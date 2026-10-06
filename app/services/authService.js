const fs = require('fs');
const { randomUUID, createHash } = require('crypto');
const config = require('../config');
const db = require('../db');
const redis = require('../redis');
const { BusinessError } = require('../errors');

// 60 秒滑动窗口限流脚本（配额口径：次/分钟，对应 sdx_user_account.rate_limit_qpm）
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

const RATE_LIMIT_WINDOW_MS = 60000;
const DEFAULT_RATE_LIMIT_QPM = 50;

let _toolsCache = null;
function readTools() {
  if (!_toolsCache) {
    _toolsCache = JSON.parse(fs.readFileSync(config.mcp.toolsPath, 'utf8'));
  }
  return _toolsCache;
}

// 密钥落库口径与 SellerDex 一致：服务端只存 SHA-256(明文密钥)
function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

async function authenticate(apiKey) {
  if (!apiKey || !String(apiKey).trim()) {
    throw new BusinessError('缺少API Key', 401);
  }
  const keyHash = sha256(String(apiKey).trim());
  const rows = await db.query(
    `SELECT k.kid, k.masked_key, u.uid, u.email, u.credits, u.rate_limit_qpm
       FROM sdx_api_key k
       JOIN sdx_user_account u ON u.uid = k.user_id
      WHERE k.key_hash = ? AND k.status = 'active' AND u.status = 'active'
      LIMIT 1`,
    [keyHash]
  );
  if (!rows.length) {
    throw new BusinessError('API Key无效或用户已禁用', 401);
  }
  const row = rows[0];
  return {
    userId: row.uid,
    username: row.email,
    apiKey: row.masked_key,
    points: Number(row.credits || 0),
    // 字段语义调整为「次/分钟」，保留 qpsLimit 属性名以兼容调用方
    qpsLimit: Number(row.rate_limit_qpm || DEFAULT_RATE_LIMIT_QPM),
    kid: row.kid,
    maskedKey: row.masked_key,
    admin: false
  };
}

async function consumeRateLimit(userId, qpmLimit) {
  const limit = qpmLimit && qpmLimit > 0 ? qpmLimit : DEFAULT_RATE_LIMIT_QPM;
  const now = Date.now();
  const key = `mcp:ratelimit:${userId}`;
  const member = `${now}-${randomUUID()}`;
  const allowed = await redis.eval(
    RATE_LIMIT_SCRIPT,
    1,
    key,
    String(now),
    String(RATE_LIMIT_WINDOW_MS),
    String(limit),
    member
  );
  if (!allowed) {
    throw new BusinessError('请求过于频繁，请稍后再试', 429);
  }
}

module.exports = { readTools, authenticate, consumeRateLimit };
