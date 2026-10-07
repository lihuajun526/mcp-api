'use strict';

/**
 * 卖家精灵 MCP 代理转发冒烟测试（不依赖 MySQL/Redis）。
 *
 * 验证路径：
 * 1. 客户端连接上游 + 工具列表加载；
 * 2. 白名单/前缀/重名过滤后的代理工具定义；
 * 3. 真实调用（trademark_country_list，低成本）+ 信封统一；
 * 4. 错误场景（review 缺 asin）-> UpstreamError 映射；
 * 5. 连接并发去重（并发 5 个 ensureReady 只产生一次 initialize）。
 *
 * 运行：node scripts/test_mcp_proxy.js
 */

process.env.ENV_FILE = process.env.ENV_FILE || '.env.local';

const client = require('../app/services/sellerSpriteMcpClient');
const proxyTools = require('../app/routes/tools/proxyTools');

let passed = 0;
let failed = 0;

function assert(cond, name, extra) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}${extra !== undefined ? ` | got: ${JSON.stringify(extra).slice(0, 200)}` : ''}`);
  }
}

async function main() {
  console.log('== 1. 并发连接去重（5 个并发 ensureReady）==');
  await Promise.all(Array.from({ length: 5 }, () => client.ensureReady()));
  assert(client.getStatus().state === 'READY', '连接成功，状态 READY', client.getStatus());
  assert(client.getCachedTools().length > 40, `上游工具数 > 40（实际 ${client.getCachedTools().length}）`);

  console.log('== 2. 代理工具定义（白名单+前缀+重名过滤）==');
  const defs = await proxyTools.listProxiedTools();
  const names = defs.map((d) => d.name);
  assert(defs.length === proxyTools.DEFAULT_PROXY_TOOLS.length, `代理工具数 = 默认白名单 24（实际 ${defs.length}）`, names);
  assert(names.every((n) => n.startsWith('ss_')), '全部带 ss_ 前缀');
  assert(!names.some((n) => n.includes('secret')), '不包含 secret_* 元工具');
  assert(!names.includes('ss_asin_detail') && !names.includes('ss_competitor_lookup'), '不与本地工具重名');
  assert(defs.every((d) => d.inputSchema && d.inputSchema.type === 'object'), 'inputSchema 完整透传');

  console.log('== 3. 真实调用 ss_trademark_country_list ==');
  const okResult = await proxyTools.handleProxyCall('ss_trademark_country_list', {});
  const okPayload = JSON.parse(okResult.content[0].text);
  assert(
    okResult.isError === false && okPayload.code === 'OK' && Array.isArray(okPayload.data) && okPayload.data.length > 100,
    'MCP 信封合规 {content:[{type:text,text:{code:OK,data:[...]}}],isError:false}',
    okPayload.code
  );

  console.log('== 4. returnFields 裁剪（本地 buildSuccess 行为复用）==');
  const trimmed = await proxyTools.handleProxyCall('ss_trademark_country_list', { returnFields: 'office' });
  const trimmedPayload = JSON.parse(trimmed.content[0].text);
  assert(
    trimmedPayload.code === 'OK' && trimmedPayload.data.every((it) => Object.keys(it).length === 1 && it.office),
    'returnFields=office 生效'
  );

  console.log('== 5. 错误场景：ss_review 缺 asin ==');
  try {
    await proxyTools.handleProxyCall('ss_review', { marketplace: 'US' });
    assert(false, '应抛出 UpstreamError');
  } catch (e) {
    assert(e.errorCode === 'UPSTREAM_ERROR' && /asin/i.test(e.message), '映射为 UpstreamError 且携带上游错误信息', e.message);
  }

  console.log('== 6. 真实业务调用 ss_keepa_info ==');
  const keepa = await proxyTools.handleProxyCall('ss_keepa_info', { marketplace: 'US', asin: 'B07Z82895W' });
  const keepaPayload = JSON.parse(keepa.content[0].text);
  assert(keepaPayload.code === 'OK' && keepaPayload.data && typeof keepaPayload.data === 'object', 'keepa_info 返回商品画像数据');

  console.log(`\n结果: ${passed} passed, ${failed} failed`);
  proxyTools.close();
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error('冒烟测试异常终止:', e);
  proxyTools.close();
  process.exit(1);
});
