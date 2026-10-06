const { randomUUID } = require('crypto');
const db = require('../db');
const { BusinessError } = require('../errors');

// 统计口径与 SellerDex 一致：按 UTC 生成 YYYY-MM
function monthOf(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * 查询接口定价（sdx_api_endpoint_pricing，仅 online 生效）。
 * 返回 { code, name, credits }，name 用于写入调用明细的 tool_name。
 * 定价表低频变更，进程内缓存 60s，避免每次调用都查库。
 */
const PRICING_CACHE_TTL_MS = 60000;
const _pricingCache = new Map(); // toolCode -> { value, expireAt }

async function getPricing(toolCode) {
  const hit = _pricingCache.get(toolCode);
  if (hit && hit.expireAt > Date.now()) {
    return hit.value;
  }
  const rows = await db.query(
    "SELECT code, name, credits_per_call FROM sdx_api_endpoint_pricing WHERE code = ? AND status = 'online' LIMIT 1",
    [toolCode]
  );
  if (!rows.length) {
    throw new BusinessError(`接口未配置价格: ${toolCode}`, 400);
  }
  const value = {
    code: rows[0].code,
    name: rows[0].name,
    credits: Number(rows[0].credits_per_call)
  };
  _pricingCache.set(toolCode, { value, expireAt: Date.now() + PRICING_CACHE_TTL_MS });
  return value;
}

/**
 * 事务内扣减额度并写入调用明细。
 * @param {object} user 认证用户（含 userId=uid、kid、maskedKey）
 * @param {object} pricing getPricing 返回的定价
 * @param {string} provider 数据源标识
 */
async function deductAndRecord(user, pricing, provider) {
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    const [users] = await conn.query('SELECT credits FROM sdx_user_account WHERE uid = ? FOR UPDATE', [user.userId]);
    if (!users.length) {
      throw new BusinessError('用户不存在', 400);
    }
    const balance = Number(users[0].credits || 0);
    if (balance < pricing.credits) {
      throw new BusinessError('积分余额不足', 400);
    }
    await conn.query('UPDATE sdx_user_account SET credits = credits - ?, updated_at = NOW() WHERE uid = ?', [
      pricing.credits,
      user.userId
    ]);

    const now = new Date();
    // 业务 ID 由自增主键派生（ur_5xxxxx），先占位写入再回填，与 SellerDex 同口径
    const placeholder = `tmp_${randomUUID()}`;
    const [ins] = await conn.query(
      `INSERT INTO sdx_usage_record
         (urid, user_id, kid, masked_key, tool_code, tool_name, credits, cached, request_summary, provider, month, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        placeholder,
        user.userId,
        user.kid || null,
        user.maskedKey || null,
        pricing.code,
        pricing.name,
        pricing.credits,
        0,
        null,
        provider,
        monthOf(now),
        now
      ]
    );
    await conn.query('UPDATE sdx_usage_record SET urid = ? WHERE id = ?', [
      `ur_5${String(ins.insertId).padStart(5, '0')}`,
      ins.insertId
    ]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { getPricing, deductAndRecord };
