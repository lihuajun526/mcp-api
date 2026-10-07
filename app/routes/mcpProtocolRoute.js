const express = require('express');
const config = require('../config');
const authService = require('../services/authService');
const toolHandlers = require('./tools');
const proxyTools = require('./tools/proxyTools');
const { assertMarketplace } = require('../utils/validation');
const { BusinessError, UpstreamError } = require('../errors');

const router = express.Router();

function ok(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function fail(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

/**
 * 工具执行错误统一包裹为 MCP 规范格式：
 * { content: [{ type: 'text', text: '{"code":...,"message":...,"data":...}' }], isError: true }
 * text 内为业务信封，data 携带 hint（下一步处理建议）等结构化信息，便于调用方/模型决定后续动作。
 */
function errorEnvelope(e) {
  // 注意：不向外暴露 e.url 等第三方/内部实现信息；url 仅记录到服务端日志
  // 仅对已知业务错误类型透出 message，未知系统错误（如数据库连接失败）使用通用提示，避免暴露内部实现细节
  const isSafeError = e instanceof BusinessError || e instanceof UpstreamError;
  const detail = {};
  if (e.upstreamCode !== undefined && e.upstreamCode !== null) detail.upstreamCode = e.upstreamCode;
  if (e.httpStatus !== undefined && e.httpStatus !== null) detail.httpStatus = e.httpStatus;
  if (e.hint) detail.hint = e.hint;
  const payload = {
    code: e.errorCode || 'INTERNAL_ERROR',
    message: isSafeError ? (e.message || 'internal error') : 'internal error',
    data: Object.keys(detail).length ? detail : null
  };
  return {
    content: [{ type: 'text', text: JSON.stringify(payload) }],
    isError: true
  };
}

router.post('/mcp', async (req, res) => {
  const body = req.body || {};
  const id = body.id;
  const method = body.method;

  // JSON-RPC 通知（无 id，如 notifications/initialized）：
  // 按 MCP Streamable HTTP 约定返回 202 Accepted，不回 JSON-RPC 响应体
  if ((id === undefined || id === null) && typeof method === 'string' && method.startsWith('notifications/')) {
    return res.status(202).end();
  }

  try {
    // MCP 标准 ping：健康探测/保活，返回空 result，无需鉴权
    if (method === 'ping') {
      return res.json(ok(id, {}));
    }

    if (method === 'initialize') {
      return res.json(
        ok(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'mcp-api-node', version: '1.0.0' }
        })
      );
    }

    if (method === 'list_tools' || method === 'tools/list') {
      // 本地工具 + 卖家精灵官方 MCP 代理工具（ss_ 前缀）；
      // 代理工具失败开放：上游不可用时仅返回本地工具，不影响存量能力
      const proxied = await proxyTools.listProxiedTools();
      return res.json(ok(id, { tools: [...authService.readTools(), ...proxied] }));
    }

    if (method === 'tools/call') {
      const apiKey = req.header(config.mcp.apiKeyHeader);
      if (!apiKey) {
        return res.json(fail(id, -32001, 'missing API key'));
      }
      const user = await authService.authenticate(apiKey);
      await authService.consumeRateLimit(user.userId, user.qpsLimit);

      const params = body.params || {};
      const toolName = params.name;
      const args = params.arguments || {};

      const isProxy = proxyTools.isProxyTool(toolName);

      // 统一校验并归一化 marketplace 枚举（非法值直接返回 JSON-RPC -32602）
      if (args.marketplace !== undefined && args.marketplace !== null && args.marketplace !== '') {
        args.marketplace = assertMarketplace(args.marketplace);
      }

      if (isProxy) {
        try {
          // 传入 user 以支持积分扣除（与本地工具行为对称）
          const result = await proxyTools.handleProxyCall(toolName, args, user);
          return res.json(ok(id, result));
        } catch (e) {
          if (typeof e.code === 'number') {
            return res.json(fail(id, e.code, e.message));
          }
          console.error(`proxy tool ${toolName} failed:`, e.message, e.url ? `| upstream: ${e.url}` : '');
          return res.json(ok(id, errorEnvelope(e)));
        }
      }

      const handler = toolHandlers[toolName];
      if (!handler) {
        return res.json(fail(id, -32602, `Unsupported tool: ${toolName}`));
      }

      let result;
      try {
        result = await handler.handle(args, user);
      } catch (e) {
        // 参数校验错误（工具内抛出带数字 code 的 Error）保持 JSON-RPC 协议错误，语义不变
        if (typeof e.code === 'number') {
          return res.json(fail(id, e.code, e.message));
        }
        // 业务/上游错误走统一 {code, message, data} 包裹，并附下一步处理建议
        console.error(`tool ${toolName} failed:`, e.message, e.url ? `| upstream: ${e.url}` : '');
        return res.json(ok(id, errorEnvelope(e)));
      }
      return res.json(ok(id, result));
    }

    return res.json(fail(id, -32601, `Method not found: ${method}`));
  } catch (e) {
    // 已知安全错误（参数校验/业务/上游）透出 message；系统级错误（如数据库连接失败）只记日志、返回通用提示
    const isSafeError = typeof e.code === 'number' || e instanceof BusinessError || e instanceof UpstreamError;
    if (!isSafeError) console.error('Unhandled MCP error:', e);
    const code = typeof e.code === 'number' ? e.code : -32000;
    return res.json(fail(id, code, isSafeError ? (e.message || 'internal error') : 'internal error'));
  }
});

// MCP Streamable HTTP：本服务为无状态、非流式实现，不提供 GET 独立 SSE 通道。
// 规范要求此时必须回 405 Method Not Allowed（而不是 404）：
// 官方 SDK 客户端对 405 判定为「服务端不提供 SSE」并静默返回，
// 对其他非 2xx（尤其 404「Cannot GET /mcp」）则会抛 StreamableHTTPError 并触发 onerror。
router.get('/mcp', (req, res) => {
  res.set('Allow', 'POST, DELETE');
  res.status(405).end();
});

// 同理：无会话状态可终止，DELETE 亦回 405；规范允许客户端忽略该响应。
router.delete('/mcp', (req, res) => {
  res.set('Allow', 'POST');
  res.status(405).end();
});

module.exports = router;
