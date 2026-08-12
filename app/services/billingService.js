const { randomUUID } = require('crypto');
const db = require('../db');
const { BusinessError } = require('../errors');

async function getCostPoints(endpointCode) {
  const rows = await db.query(
    'SELECT cost_points FROM api_endpoint_pricing WHERE endpoint_code = ? AND enabled = 1 LIMIT 1',
    [endpointCode]
  );
  if (!rows.length) {
    throw new BusinessError(`接口未配置价格: ${endpointCode}`, 400);
  }
  return rows[0].cost_points;
}

async function deductAndRecord(userId, endpointCode, costPoints, provider) {
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    const [users] = await conn.query('SELECT points FROM user_account WHERE id = ? FOR UPDATE', [userId]);
    if (!users.length) {
      throw new BusinessError('用户不存在', 400);
    }
    const points = Number(users[0].points || 0);
    if (points < costPoints) {
      throw new BusinessError('点数余额不足', 400);
    }
    await conn.query('UPDATE user_account SET points = points - ? WHERE id = ?', [costPoints, userId]);
    await conn.query(
      'INSERT INTO usage_record (user_id, endpoint_code, request_id, cost_points, provider, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, endpointCode, randomUUID(), costPoints, provider, 'SUCCESS']
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { getCostPoints, deductAndRecord };
