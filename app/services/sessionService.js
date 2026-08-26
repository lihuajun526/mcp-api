const redis = require('../redis');
const { BusinessError } = require('../errors');

async function pickSession(provider) {
  const hashKey = `mcp:session:${provider}`;
  const cursorKey = `mcp:session:cursor:${provider}`;
  const size = await redis.hlen(hashKey);
  if (!size || size <= 0) {
    throw new BusinessError(`未找到可用第三方会话: ${provider}`, 500);
  }
  const cursor = await redis.incr(cursorKey);
  const fields = await redis.hkeys(hashKey);
  const field = fields[(Number(cursor) - 1) % fields.length];
  const raw = await redis.hget(hashKey, field);
  if (!raw) {
    throw new BusinessError(`第三方会话数据为空: ${provider}`, 500);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new BusinessError(`第三方会话配置格式错误: ${provider}`, 500);
  }
}

module.exports = { pickSession };
