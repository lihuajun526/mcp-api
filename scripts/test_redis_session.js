'use strict';

/**
 * Redis session 诊断脚本
 *
 * 从 Redis 读取真实 session，用与应用完全相同的 headers + body 发送请求，
 * 对比结果找出应用失败的根本原因。
 *
 * 运行（在 Linux 服务器应用目录下）：
 *   ENV_FILE=.env.prod node scripts/test_redis_session.js
 */

process.env.ENV_FILE = process.env.ENV_FILE || '.env.prod';

const axios = require('axios');
const config = require('../app/config');
const redis = require('../app/redis');

const PROVIDER = 'SELLERSPRITE';
const HASH_KEY = `mcp:session:${PROVIDER}`;

async function main() {
  console.log('Node.js  :', process.version);
  console.log('OpenSSL  :', process.versions.openssl);
  console.log('Platform :', process.platform, process.arch);
  console.log('Redis    :', config.redis.host, ':', config.redis.port, 'db', config.redis.db);
  console.log('');

  // ── 1. 读取 Redis 中所有 session ─────────────────────────────────────────
  const fields = await redis.hkeys(HASH_KEY);
  if (!fields.length) {
    console.error(`Redis 中未找到 session: ${HASH_KEY}`);
    process.exit(1);
  }
  console.log(`Redis session 字段 (${fields.length} 个):`, fields);
  console.log('');

  for (const field of fields) {
    const raw = await redis.hget(HASH_KEY, field);
    let session;
    try {
      session = JSON.parse(raw);
    } catch {
      console.error(`[${field}] JSON 解析失败:`, raw?.slice(0, 100));
      continue;
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`[${field}] session 字段概览:`);
    console.log('  has cookie     :', !!session.cookie, '| 长度:', (session.cookie || '').length);
    console.log('  has gtk        :', !!session.gtk,    '| 长度:', (session.gtk    || '').length);
    console.log('  userAgent      :', session.userAgent ? session.userAgent.slice(0, 60) + '...' : '(未设置，用 config 默认值)');
    console.log('  accept         :', session.accept        || '(未设置)');
    console.log('  acceptLanguage :', session.acceptLanguage || '(未设置)');
    console.log('');

    // ── 2. 用与应用完全相同的方式构造 headers + body ─────────────────────
    const body = new URLSearchParams();
    body.append('station', 'US');
    body.append('asin', 'B0B41YH9B6');
    if (session.gtk) body.append('gtk', session.gtk);

    const headers = {
      accept: session.accept || 'application/json, text/javascript, */*; q=0.01',
      'accept-language': session.acceptLanguage || 'zh,en;q=0.9',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
      cookie: session.cookie || '',
      'user-agent': session.userAgent || config.sellerSprite.userAgent,
      'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
    };

    const url = `${config.sellerSprite.baseUrl}${config.sellerSprite.asinSalesPath}`;
    console.log(`  请求 URL: ${url}`);
    console.log(`  body    : ${body.toString().slice(0, 120)}...`);

    // ── 3. 发送请求 ──────────────────────────────────────────────────────
    try {
      const resp = await axios.post(url, body.toString(), {
        headers,
        timeout: config.sellerSprite.timeoutMs,
      });

      const data = resp.data;
      const isOk = data && [0, 200, '0', '200', 'OK', 'SUCCESS'].includes(
        typeof data.code === 'string' ? data.code.toUpperCase() : data.code
      );

      if (isOk) {
        console.log(`  结果: ✓ 业务成功 (code=${data.code})`);
        const preview = JSON.stringify(data).slice(0, 200);
        console.log(`  data preview: ${preview}...`);
      } else {
        console.log(`  结果: ✗ 业务失败`);
        console.log(`    code    : ${data?.code}`);
        console.log(`    message : ${data?.message}`);
      }
    } catch (err) {
      if (err.response) {
        console.log(`  结果: ✗ HTTP ${err.response.status}`);
        console.log(`    body: ${JSON.stringify(err.response.data).slice(0, 300)}`);
      } else {
        console.log(`  结果: ✗ 网络错误: ${err.message}`);
      }
    }
  }

  await redis.quit();
  console.log('\n诊断完成');
}

main().catch((e) => {
  console.error('脚本异常:', e.message);
  redis.quit().catch(() => {});
  process.exit(1);
});
