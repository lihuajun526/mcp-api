/* 临时迁移验证脚本：验证 mcp-api 切换至 sdx_* 表后的认证 / 计费 / 限流 / 路由 */
process.env.ENV_FILE = process.env.ENV_FILE || '.env.local';
const crypto = require('crypto');
const http = require('http');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const PLAIN = 'sk_test_MIG' + crypto.randomBytes(8).toString('hex');
const KID = 'k_testmig';
const UID = 'u_1001';
const NAME = 'migration-test';

function sha256(v) {
  return crypto.createHash('sha256').update(String(v)).digest('hex');
}
function maskKey(prefix, plain) {
  const body = String(plain).slice(prefix.length);
  return `${prefix}${body.slice(0, 4)}********${body.slice(-4)}`;
}
function httpJson(method, pathName, headers, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      { host: '127.0.0.1', port: Number(process.env.PORT || 18080), path: pathName, method, headers: { ...(headers || {}), ...(data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {}) } },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => resolve({ status: res.statusCode, body: buf ? JSON.parse(buf) : null }));
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}
function assert(cond, msg) {
  if (!cond) throw new Error('ASSERT FAILED: ' + msg);
  console.log('  PASS:', msg);
}

(async () => {
  const c = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  const [[before]] = await c.query('SELECT credits FROM sdx_user_account WHERE uid = ?', [UID]);
  const initialCredits = Number(before.credits);
  let usageId = null;

  try {
    // 准备：插入一把已知明文的临时密钥
    await c.query(
      `INSERT INTO sdx_api_key (kid, user_id, name, env, key_hash, key_prefix, masked_key, status, scopes, created_at, updated_at, last_used_at)
       VALUES (?,?,?,?,?,?,?,?,NULL,NOW(),NOW(),NULL)
       ON DUPLICATE KEY UPDATE key_hash=VALUES(key_hash), masked_key=VALUES(masked_key), status='active'`,
      [KID, UID, NAME, 'test', sha256(PLAIN), 'sk_test_', maskKey('sk_test_', PLAIN), 'active']
    );

    const authService = require('../app/services/authService');
    const billingService = require('../app/services/billingService');
    const redis = require('../app/redis');

    console.log('\n[1] 认证（sdx_api_key.key_hash + sdx_user_account）');
    const user = await authService.authenticate(PLAIN);
    assert(user.userId === UID, `userId = ${user.userId}`);
    assert(user.kid === KID, `kid = ${user.kid}`);
    assert(user.points === initialCredits, `points = ${user.points}（初始额度）`);
    assert(user.qpsLimit === 50, `qpsLimit(次/分钟) = ${user.qpsLimit}`);
    let unauth = null;
    try { await authService.authenticate('sk_live_bogus_key'); } catch (e) { unauth = e; }
    assert(unauth && unauth.status === 401, '无效密钥被拒绝（401）');

    console.log('\n[2] 定价（sdx_api_endpoint_pricing）');
    const pricing = await billingService.getPricing('asin_detail');
    assert(pricing.credits === 5 && pricing.name, `asin_detail -> ${pricing.credits} 额度 / ${pricing.name}`);
    const proxyPricing = await billingService.getPricing('ss_keepa_info');
    assert(proxyPricing.credits === 10, `ss_keepa_info -> ${proxyPricing.credits} 额度`);
    let noPrice = null;
    try { await billingService.getPricing('__not_exist__'); } catch (e) { noPrice = e; }
    assert(noPrice && noPrice.status === 400, '未配置价格的编码被拒绝');

    console.log('\n[3] 扣费 + 写调用明细（sdx_user_account / sdx_usage_record）');
    await billingService.deductAndRecord(user, pricing, 'SELLERSPRITE');
    const [[after]] = await c.query('SELECT credits FROM sdx_user_account WHERE uid = ?', [UID]);
    assert(Number(after.credits) === initialCredits - 5, `额度 ${initialCredits} -> ${after.credits}`);
    const [rows] = await c.query('SELECT * FROM sdx_usage_record WHERE kid = ? ORDER BY id DESC LIMIT 1', [KID]);
    assert(rows.length === 1, '写入了一条调用明细');
    const rec = rows[0];
    usageId = rec.id;
    assert(rec.user_id === UID, `usage.user_id = ${rec.user_id}`);
    assert(rec.tool_code === 'asin_detail' && rec.tool_name === pricing.name, `tool_code=${rec.tool_code} / tool_name=${rec.tool_name}`);
    assert(Number(rec.credits) === 5 && Number(rec.cached) === 0, `credits=${rec.credits} cached=${rec.cached}`);
    assert(rec.masked_key === maskKey('sk_test_', PLAIN), 'masked_key 落库正确');
    assert(/^ur_5\d+$/.test(rec.urid), `urid = ${rec.urid}`);
    assert(/^\d{4}-\d{2}$/.test(rec.month), `month = ${rec.month}`);

    console.log('\n[4] 限流（60s 滑动窗口，次/分钟）');
    const rk = 'mcp:ratelimit:u_ratetest';
    await redis.del(rk);
    await authService.consumeRateLimit('u_ratetest', 2);
    await authService.consumeRateLimit('u_ratetest', 2);
    let limited = null;
    try { await authService.consumeRateLimit('u_ratetest', 2); } catch (e) { limited = e; }
    assert(limited && limited.status === 429, '超过配额被限流（429）');
    await redis.del(rk);

    console.log('\n[5] HTTP 路由');
    const list = await httpJson('POST', '/mcp', {}, { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    assert(list.status === 200 && Array.isArray(list.body.result.tools), `tools/list 返回 ${list.body.result.tools.length} 个工具`);
    const okCat = await httpJson('GET', '/api/v1/mcp/category/first?marketplace=US', { 'secret-key': PLAIN });
    assert(okCat.status === 200 && okCat.body.success === true, '带合法密钥访问受保护接口成功');
    const badCat = await httpJson('GET', '/api/v1/mcp/category/first?marketplace=US', { 'secret-key': 'sk_live_bogus' });
    assert(badCat.status === 401, '非法密钥访问受保护接口返回 401');

    console.log('\n全部测试通过 ✅');
  } finally {
    // 清理测试数据
    await c.query('DELETE FROM sdx_api_key WHERE kid = ?', [KID]);
    if (usageId) await c.query('DELETE FROM sdx_usage_record WHERE id = ?', [usageId]);
    await c.query('UPDATE sdx_user_account SET credits = ? WHERE uid = ?', [initialCredits, UID]);
    await c.query('DELETE FROM sdx_api_key WHERE kid = ?', [KID]);
    await c.end();
    console.log('清理完成（密钥已删除、额度已还原、测试明细已删除）');
  }
})().then(() => process.exit(0)).catch((e) => {
  console.error('TEST ERROR:', e.message);
  process.exit(1);
});
