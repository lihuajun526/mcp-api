const express = require('express');
const config = require('../config');
const authService = require('../services/authService');
const toolHandlers = require('./tools');

const router = express.Router();

function ok(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function fail(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

/**
 * 工具执行错误统一包裹为 { code, message, data }，
 * data 携带 hint（下一步处理建议）等结构化信息，便于调用方/模型决定后续动作。
 */
function errorEnvelope(e) {
  // 注意：不向外暴露 e.url 等第三方/内部实现信息；url 仅记录到服务端日志
  const data = {};
  if (e.upstreamCode !== undefined && e.upstreamCode !== null) data.upstreamCode = e.upstreamCode;
  if (e.httpStatus !== undefined && e.httpStatus !== null) data.httpStatus = e.httpStatus;
  if (e.hint) data.hint = e.hint;
  return {
    code: e.errorCode || 'INTERNAL_ERROR',
    message: e.message || 'internal error',
    data: Object.keys(data).length ? data : null
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
      return res.json(ok(id, { tools: authService.readTools() }));
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
    const code = e.code && typeof e.code === 'number' ? e.code : -32000;
    return res.json(fail(id, code, e.message || 'internal error'));
  }
});

module.exports = router;
