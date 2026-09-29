const fs = require('fs');
const { randomUUID } = require('crypto');
const config = require('../config');
const db = require('../db');
const redis = require('../redis');
const { BusinessError } = require('../errors');

const RATE_LIMIT_SCRIPT = [
  'local key = KEYS[1]',
  'local now = tonumber(ARGV[1])',
  'local window = tonumber(ARGV[2])',
  'local limit = tonumber(ARGV[3])',
  'local member = ARGV[4]',
  "redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)",
  "local current = redis.call('ZCARD', key)",
  'if current >= limit then return 0 end',
  "redis.call('ZADD', key, now, member)",
  "redis.call('PEXPIRE', key, window)",
  'return 1'
].join(' ');

let _toolsCache = null;
function readTools() {
  if (!_toolsCache) {
    _toolsCache = JSON.parse(fs.readFileSync(config.mcp.toolsPath, 'utf8'));
  }
  return _toolsCache;
}

async function authenticate(apiKey) {
  if (!apiKey || !String(apiKey).trim()) {
    throw new BusinessError('缺少API Key', 401);
  }
  const rows = await db.query(
    'SELECT id, username, api_key, points, qps_limit, admin FROM user_account WHERE api_key = ? AND status = ? LIMIT 1',
    [String(apiKey).trim(), 'ACTIVE']
  );
  if (!rows.length) {
    throw new BusinessError('API Key无效或用户已禁用', 401);
  }
  const user = rows[0];
  return {
    userId: user.id,
    username: user.username,
    apiKey: user.api_key,
    points: user.points,
    qpsLimit: user.qps_limit,
    admin: !!user.admin
  };
}

async function consumeRateLimit(userId, qpsLimit) {
  const limit = qpsLimit && qpsLimit > 0 ? qpsLimit : 5;
  const now = Date.now();
  const key = `mcp:ratelimit:${userId}`;
  const member = `${now}-${randomUUID()}`;
  const allowed = await redis.eval(RATE_LIMIT_SCRIPT, 1, key, String(now), '1000', String(limit), member);
  if (!allowed) {
    throw new BusinessError('请求过于频繁，请稍后再试', 429);
  }
}

module.exports = { readTools, authenticate, consumeRateLimit };
