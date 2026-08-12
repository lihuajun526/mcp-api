const redis = require('../redis');
const { BusinessError } = require('../errors');

async function pickSession(provider) {
  const listKey = `mcp:session:${provider}`;
  const cursorKey = `mcp:session:cursor:${provider}`;
  const size = await redis.llen(listKey);
  if (!size || size <= 0) {
    throw new BusinessError(`未找到可用第三方会话: ${provider}`, 500);
  }
  const cursor = await redis.incr(cursorKey);
  const index = (Number(cursor) - 1) % size;
  const raw = await redis.lindex(listKey, index);
  if (!raw) {
    throw new BusinessError(`第三方会话数据为空: ${provider}`, 500);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new BusinessError(`第三方会话配置格式错误: ${provider}`, 500);
  }
}

async function pickSellerSpriteSession() {
  return pickSession('SELLERSPRITE');
}

module.exports = { pickSession, pickSellerSpriteSession };
