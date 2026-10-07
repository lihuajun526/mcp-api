/**
 * MCP 工具响应统一处理：
 * 1. buildSuccess(args, data) —— 按 MCP 规范包裹为 { content: [{type:"text", text: JSON}], isError: false }，
 *    text 内容为业务信封 { code: 'OK', message: '成功', data }；
 * 2. sanitizeInternalFields(data) —— 深度剔除上游内部字段（guestId/took/url/guestVisited/terminal）；
 * 3. applyReturnFields(data, returnFields) —— 按官方 returnFields 参数裁剪返回字段，
 *    大幅降低上下文 Token 消耗（对齐 open.sellersprite.com 的 MCP 行为）。
 */

// 上游内部字段，任何输出中都不应出现
const INTERNAL_FIELDS = new Set(['guestId', 'took', 'url', 'guestVisited', 'terminal']);

// 分页/信封类结构字段：returnFields 裁剪时始终保留（其中的 items 仍会被逐条裁剪）
const ENVELOPE_KEYS = new Set([
  'items', 'page', 'pages', 'size', 'total',
  'hasNextPage', 'marketplace', 'month', 'order'
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeInternalFields(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeInternalFields);
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value)) {
      if (INTERNAL_FIELDS.has(key)) continue;
      out[key] = sanitizeInternalFields(value[key]);
    }
    return out;
  }
  return value;
}

function normalizeReturnFields(returnFields) {
  if (!returnFields) return null;
  let arr = returnFields;
  if (typeof arr === 'string') {
    arr = arr.split(',');
  }
  if (!Array.isArray(arr)) return null;
  const set = new Set();
  for (const f of arr) {
    const name = String(f).trim();
    if (name) set.add(name);
  }
  return set.size > 0 ? set : null;
}

function filterByFields(value, fields) {
  if (Array.isArray(value)) {
    return value.map((v) => filterByFields(v, fields));
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value)) {
      if (fields.has(key)) {
        // 请求指定字段：整值保留（含嵌套对象/数组）
        out[key] = value[key];
      } else if (ENVELOPE_KEYS.has(key)) {
        // 结构字段：保留并继续向下裁剪（如 items 列表内的对象）
        out[key] = filterByFields(value[key], fields);
      }
      // 其余未请求字段：丢弃
    }
    return out;
  }
  return value;
}

function applyReturnFields(data, returnFields) {
  const fields = normalizeReturnFields(returnFields);
  if (!fields) return data;
  return filterByFields(data, fields);
}

/**
 * 统一成功响应（MCP 规范）：
 * { content: [{ type: 'text', text: '{"code":"OK","message":"成功","data":...}' }], isError: false }
 * text 内为业务信封，保持 { code, message, data } 结构供模型/调用方解析。
 */
function buildSuccess(args, data) {
  let cleaned = sanitizeInternalFields(data);
  if (args && args.returnFields) {
    cleaned = applyReturnFields(cleaned, args.returnFields);
  }
  const payload = { code: 'OK', message: '成功', data: cleaned };
  return {
    content: [{ type: 'text', text: JSON.stringify(payload) }],
    isError: false
  };
}

module.exports = {
  INTERNAL_FIELDS,
  ENVELOPE_KEYS,
  sanitizeInternalFields,
  applyReturnFields,
  buildSuccess
};
