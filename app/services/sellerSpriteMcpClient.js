'use strict';

/**
 * 卖家精灵官方 MCP（streamable-http）客户端。
 *
 * 职责：把官方 MCP 能力以 JSON-RPC 客户端方式接入，供 proxyTools 转发调用。
 *
 * 设计要点（稳定性优先）：
 * 1. 惰性连接：首次 listTools/callTool 时才 initialize，进程启动不依赖上游可用性；
 * 2. 连接并发去重：_connecting 单飞（single-flight），并发调用共享同一个连接 Promise，
 *    避免重连风暴（与 StatesRedisService _connecting 同一思路）；
 * 3. 失败退避：连接失败后按 5s -> 60s 指数退避，冷却期内快速失败，不反复打到上游；
 * 4. 调用重试：网络层失败时断开重连并重试一次（仅一次，避免雪崩）；
 * 5. 协议兼容：优先按 application/json 解析，同时兼容 text/event-stream（SSE）响应；
 * 6. 工具列表缓存 + 定时刷新：tools/list 结果缓存，后台周期刷新，上游工具更新可自动同步。
 */

const axios = require('axios');
const config = require('../config');
const { UpstreamError } = require('../errors');

const STATE = { DISCONNECTED: 'DISCONNECTED', CONNECTING: 'CONNECTING', READY: 'READY' };

// 连接失败退避：5s 起步，封顶 60s
const BACKOFF_BASE_MS = 5000;
const BACKOFF_MAX_MS = 60000;

class SellerSpriteMcpClient {
  constructor(cfg) {
    this.cfg = cfg;
    this.state = STATE.DISCONNECTED;
    this._connecting = null; // 单飞 Promise：并发 ensureReady 共享
    this._tools = []; // 上游工具 schema 缓存
    this._toolsLoadedAt = 0;
    this._requestId = 0;
    this._lastError = null;
    this._nextRetryAt = 0;
    this._backoffMs = BACKOFF_BASE_MS;
    this._refreshTimer = null;
  }

  getStatus() {
    return {
      enabled: this.cfg.enabled,
      state: this.state,
      upstreamToolCount: this._tools.length,
      toolsLoadedAt: this._toolsLoadedAt || null,
      lastError: this._lastError ? this._lastError.message : null
    };
  }

  /** 已缓存的上游工具列表（可能为空数组） */
  getCachedTools() {
    return this._tools;
  }

  /**
   * 确保已连接且工具列表已加载。
   * 单飞去重 + 退避冷却：冷却期内直接抛出上次错误，快速失败。
   */
  async ensureReady() {
    if (!this.cfg.enabled) {
      throw new UpstreamError('卖家精灵 MCP 转发未启用', { hint: '检查 SELLERSPRITE_MCP_ENABLED 配置' });
    }
    if (!this.cfg.secretKey) {
      throw new UpstreamError('缺少卖家精灵 MCP 密钥', { hint: '配置 SELLERSPRITE_MCP_SECRET_KEY（注意与 API Key 不通用）' });
    }
    if (this.state === STATE.READY) return;

    const now = Date.now();
    if (now < this._nextRetryAt) {
      throw new UpstreamError(`卖家精灵 MCP 暂时不可用，${Math.ceil((this._nextRetryAt - now) / 1000)}s 后重试`, {
        hint: '上游连接失败处于退避冷却期',
        cause: this._lastError || undefined
      });
    }

    // 并发去重：已有进行中的连接则复用
    if (this._connecting) return this._connecting;

    this.state = STATE.CONNECTING;
    this._connecting = this._connect()
      .then(() => {
        this.state = STATE.READY;
        this._lastError = null;
        this._backoffMs = BACKOFF_BASE_MS;
        this._nextRetryAt = 0;
        this._startRefreshTimer();
      })
      .catch((e) => {
        this.state = STATE.DISCONNECTED;
        this._lastError = e;
        this._nextRetryAt = Date.now() + this._backoffMs;
        this._backoffMs = Math.min(this._backoffMs * 2, BACKOFF_MAX_MS);
        console.error(`[sellersprite-mcp] connect failed: ${e.message} (retry in ${this._backoffMs / 1000}s)`);
        throw new UpstreamError('卖家精灵 MCP 连接失败', {
          hint: '检查网络与 SELLERSPRITE_MCP_SECRET_KEY 是否有效',
          cause: e
        });
      })
      .finally(() => {
        this._connecting = null;
      });

    return this._connecting;
  }

  async _connect() {
    // 1. initialize 握手
    const init = await this._rpc('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcp-api-node', version: '1.0.0' }
    });
    if (!init || !init.serverInfo) {
      throw new Error('initialize 响应缺少 serverInfo');
    }
    // 2. 按协议发送 initialized 通知（无 id，忽略响应）
    await this._notify('notifications/initialized', {});
    // 3. 拉取工具列表
    const result = await this._rpc('tools/list', {});
    this._tools = (result && result.tools) || [];
    this._toolsLoadedAt = Date.now();
    console.log(`[sellersprite-mcp] connected, ${this._tools.length} upstream tools loaded`);
  }

  /** 刷新工具列表（后台定时调用；失败仅记录日志，保留旧缓存） */
  async refreshTools() {
    if (this.state !== STATE.READY) return;
    try {
      const result = await this._rpc('tools/list', {});
      if (result && Array.isArray(result.tools)) {
        this._tools = result.tools;
        this._toolsLoadedAt = Date.now();
      }
    } catch (e) {
      console.error(`[sellersprite-mcp] refresh tools failed: ${e.message}`);
    }
  }

  _startRefreshTimer() {
    if (this._refreshTimer || !(this.cfg.refreshMs > 0)) return;
    this._refreshTimer = setInterval(() => this.refreshTools(), this.cfg.refreshMs);
    this._refreshTimer.unref(); // 不阻塞进程退出
  }

  stop() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
    this.state = STATE.DISCONNECTED;
  }

  /**
   * 调用上游工具。
   * 网络层失败时重连并重试一次；上游业务失败抛出 UpstreamError（由路由层统一包裹）。
   * @returns {Promise<{data: any}>} 解析后的上游 data 字段
   */
  async callTool(name, args) {
    await this.ensureReady();
    try {
      return await this._callToolOnce(name, args);
    } catch (e) {
      // 业务错误（UpstreamError 且非网络原因）不重试，直接抛出
      if (e instanceof UpstreamError && e.upstreamCode !== 'NETWORK') throw e;
      console.error(`[sellersprite-mcp] call ${name} failed (${e.message}), reconnecting and retrying once`);
      this.state = STATE.DISCONNECTED;
      this._nextRetryAt = 0; // 主动重连，清冷却
      await this.ensureReady();
      return this._callToolOnce(name, args);
    }
  }

  async _callToolOnce(name, args) {
    const result = await this._rpc('tools/call', { name, arguments: args || {} }, this.cfg.timeoutMs);

    // 上游执行失败：{ content: [{type:'text',text:'错误信息'}], isError: true }
    if (result && result.isError) {
      const text = extractText(result);
      throw new UpstreamError(text || `上游工具 ${name} 执行失败`, {
        hint: '上游返回执行错误，请检查参数后重试；若提示密钥/额度问题请联系管理员'
      });
    }

    const text = extractText(result);
    if (!text) {
      return { data: result !== undefined ? result : null };
    }

    // 成功时 text 为 JSON 字符串，信封与本地约定一致：{ code, message, data }
    let envelope;
    try {
      envelope = JSON.parse(text);
    } catch (e) {
      // 非 JSON：原样透传文本
      return { data: text };
    }

    if (envelope && typeof envelope === 'object' && 'code' in envelope) {
      if (envelope.code !== 'OK') {
        throw new UpstreamError(envelope.message || `上游返回 ${envelope.code}`, {
          upstreamCode: envelope.code,
          hint: hintByUpstreamCode(envelope.code)
        });
      }
      return { data: envelope.data !== undefined ? envelope.data : null };
    }

    return { data: envelope };
  }

  /** JSON-RPC 请求（带 id），返回 result；JSON-RPC error / 网络错误均抛出 */
  async _rpc(method, params, timeoutMs) {
    const id = ++this._requestId;
    const payload = { jsonrpc: '2.0', id, method, params: params || {} };
    const body = await this._post(payload, timeoutMs || this.cfg.timeoutMs);
    if (body.error) {
      const err = new UpstreamError(body.error.message || `JSON-RPC error ${body.error.code}`, {
        upstreamCode: body.error.code,
        hint: '上游协议层错误'
      });
      err.upstreamCode = body.error.code;
      throw err;
    }
    return body.result;
  }

  /** JSON-RPC 通知（无 id），上游按 streamable-http 约定返回 202 */
  async _notify(method, params) {
    const payload = { jsonrpc: '2.0', method, params: params || {} };
    try {
      await this._post(payload, this.cfg.timeoutMs);
    } catch (e) {
      // 通知失败不阻断主流程，仅记录
      console.error(`[sellersprite-mcp] notify ${method} failed: ${e.message}`);
    }
  }

  /**
   * POST 上游网关，兼容 application/json 与 text/event-stream 两种响应。
   * 网络/超时错误统一包装为 upstreamCode='NETWORK' 的 UpstreamError。
   */
  async _post(payload, timeoutMs) {
    let resp;
    try {
      resp = await axios.post(this.cfg.url, payload, {
        timeout: timeoutMs,
        responseType: 'text', // 统一按文本接收，自行区分 JSON / SSE
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
          'secret-key': this.cfg.secretKey
        },
        // axios 默认不读 HTTPS_PROXY 环境变量，显式注入；'none'/空 则直连
        proxy: resolveAxiosProxy(this.cfg.proxy),
        // 202（通知确认）也视为成功
        validateStatus: (s) => (s >= 200 && s < 300) || s === 202
      });
    } catch (e) {
      const status = e.response && e.response.status;
      const err = new UpstreamError(`上游请求失败: ${e.message}`, {
        httpStatus: status || null,
        upstreamCode: 'NETWORK',
        hint: status === 401 || status === 403 ? 'MCP 密钥无效或未授权' : '网络异常或上游不可用',
        url: this.cfg.url
      });
      throw err;
    }

    if (resp.status === 202 || resp.data === '' || resp.data === undefined) {
      return {};
    }

    const contentType = String(resp.headers['content-type'] || '');
    if (contentType.includes('text/event-stream')) {
      return parseSsePayload(resp.data);
    }

    try {
      return JSON.parse(resp.data);
    } catch (e) {
      throw new UpstreamError('上游响应非 JSON，解析失败', { upstreamCode: 'NETWORK', url: this.cfg.url });
    }
  }
}

/** 解析代理配置为 axios proxy 选项；空/'none' 返回 false（显式禁用，避免 axios 读 env） */
function resolveAxiosProxy(proxyUrl) {
  if (!proxyUrl || String(proxyUrl).trim().toLowerCase() === 'none') return false;
  try {
    const u = new URL(proxyUrl);
    return {
      protocol: u.protocol.replace(':', ''),
      host: u.hostname,
      port: Number(u.port || (u.protocol === 'https:' ? 443 : 80)),
      ...(u.username ? { auth: { username: decodeURIComponent(u.username), password: decodeURIComponent(u.password) } } : {})
    };
  } catch (e) {
    console.error(`[sellersprite-mcp] invalid proxy url, fallback to direct: ${proxyUrl}`);
    return false;
  }
}

/** 从 MCP result.content 中提取首个 text 内容 */
function extractText(result) {
  if (!result || !Array.isArray(result.content)) return null;
  const item = result.content.find((c) => c && c.type === 'text' && typeof c.text === 'string');
  return item ? item.text : null;
}

/** 解析 SSE 响应：取 event: message 块中 data: 的 JSON 负载 */
function parseSsePayload(raw) {
  const blocks = String(raw).split(/\r?\n\r?\n/);
  for (const block of blocks) {
    const dataLines = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim());
    if (!dataLines.length) continue;
    try {
      return JSON.parse(dataLines.join('\n'));
    } catch (e) {
      // 继续尝试下一个块
    }
  }
  throw new UpstreamError('上游 SSE 响应解析失败', { upstreamCode: 'NETWORK' });
}

/** 按上游业务错误码给出下一步建议 */
function hintByUpstreamCode(code) {
  switch (code) {
    case 'ERROR_SECRET_KEY':
    case 'ERROR_SECRET_KEY_INVALID':
    case 'ERROR_UNAUTHORIZED':
      return 'MCP 密钥无效，请检查 SELLERSPRITE_MCP_SECRET_KEY';
    case 'ERROR_SECRET_KEY_OVERDUE':
      return 'MCP 密钥已过期，请到卖家精灵开放平台续期';
    case 'ERROR_VISIT_MAX':
      return '上游调用次数已达上限，请升级套餐或下月再试';
    case 'ERROR_PARAM':
      return '参数错误，请对照官方文档检查入参';
    default:
      return '上游业务错误，请稍后重试';
  }
}

module.exports = new SellerSpriteMcpClient(config.sellerSpriteMcp);
module.exports.STATE = STATE;
