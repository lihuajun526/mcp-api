const { createHash } = require('crypto');
const redis = require('../redis');
const config = require('../config');

/**
 * 数据缓存模块
 * 用于缓存第三方选品软件的响应结果，用户量增大后可直接命中缓存，
 * 减少对第三方选品软件的调用量与点数消耗。
 *
 * 缓存键设计：
 *   mcp:cache:{provider}:{endpointCode}:{version}:{hash}
 *   - provider: 选品软件标识（如 SELLERSPRITE）
 *   - endpointCode: 接口编码（如 ASIN_DETAIL、COMPETING_LOOKUP）
 *   - version: 数据版本号，升级转换器时 +1 使旧缓存失效
 *   - hash: 请求参数归一化后的 SHA1
 */
const CACHE_VERSION = 'v2';

// 递归排序对象 key，保证字段顺序不同但内容相同的请求生成一致的字符串
function stableValue(value) {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = stableValue(value[key]);
    }
    return out;
  }
  return value;
}

/**
 * 归一化请求参数生成缓存键内容。
 * 缓存的是「该次请求返回的完整结果」，分页与排序同样决定返回内容，
 * 因此 page / size / order 必须纳入缓存键，否则不同分页/排序会互相命中错误结果。
 * 同时对 marketplace、ASIN 列表做大小写与顺序归一化，提升命中率。
 */
function normalizeRequest(request) {
  const src = request || {};
  const normalized = {};
  for (const key of Object.keys(src).sort()) {
    let value = src[key];
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (key === 'marketplace' || key === 'market') {
      value = String(value).toUpperCase();
    } else if (key === 'asins' || key === 'asinList') {
      const list = Array.isArray(value) ? value : [value];
      value = list.map((v) => String(v == null ? '' : v).toUpperCase()).sort();
    }
    normalized[key] = stableValue(value);
  }
  return JSON.stringify(normalized);
}

function cacheKey(provider, endpointCode, request) {
  const hash = createHash('sha1').update(normalizeRequest(request)).digest('hex').slice(0, 16);
  return `mcp:cache:${provider}:${endpointCode}:${CACHE_VERSION}:${hash}`;
}

/**
 * 尝试读取缓存，命中返回解析后的对象，未命中返回 null
 */
async function get(provider, endpointCode, request) {
  const cacheConfig = config.cache;
  if (!cacheConfig || !cacheConfig.enabled || !cacheConfig.readEnabled) {
    return null;
  }
  const key = cacheKey(provider, endpointCode, request);
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    // 缓存异常不影响主流程
    return null;
  }
}

/**
 * 写入缓存
 */
async function set(provider, endpointCode, request, data) {
  const cacheConfig = config.cache;
  if (!cacheConfig || !cacheConfig.enabled) {
    return;
  }
  const key = cacheKey(provider, endpointCode, request);
  const ttl = Number(cacheConfig.ttlSeconds || 300);
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
  } catch (e) {
    // 缓存写入失败不影响主流程
  }
}

/**
 * 手动失效缓存（管理后台修改数据时使用）
 */
async function del(provider, endpointCode, request) {
  const key = cacheKey(provider, endpointCode, request);
  try {
    await redis.del(key);
  } catch (e) {
    // ignore
  }
}

module.exports = {
  get,
  set,
  del,
  cacheKey,
  normalizeRequest
};
