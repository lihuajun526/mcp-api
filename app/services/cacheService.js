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
const CACHE_VERSION = 'v1';

function normalizeRequest(request) {
  // 只保留影响数据内容的业务参数，剔除 page/size/order 等与数据内容无关的分页排序参数
  const { marketplace, asin, asins, monthName, lowPrice, symbolFlag, nodeIdPaths } = request || {};
  const list = asins && asins.length ? asins : [asin];
  return JSON.stringify({
    marketplace: marketplace ? String(marketplace).toUpperCase() : null,
    asins: (list || []).map((s) => String(s || '').toUpperCase()).sort(),
    monthName: monthName || 'bsr_sales_nearly',
    lowPrice: lowPrice || 'N',
    symbolFlag: symbolFlag !== undefined ? symbolFlag : true,
    nodeIdPaths: nodeIdPaths || []
  });
}

function cacheKey(provider, endpointCode, request) {
  const { createHash } = require('crypto');
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
    if (!raw) {
      return null;
    }
    const ttl = await redis.ttl(key);
    return { ...JSON.parse(raw), _cache: { hit: true, key, ttl } };
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
