'use strict';
const http = require('http');
const KEY = 'demo-key-001';
function call(name, args) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
    const req = http.request({ host: '127.0.0.1', port: 18080, path: '/mcp', method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': KEY, 'Content-Length': Buffer.byteLength(payload) } }, (res) => {
      let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ raw: d.slice(0, 300) }); } });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload); req.end();
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('=== 排序 order 回显对比 (传入 order.field/desc, 看响应 order) ===');
  const cases = [
    ['market_research', { marketplace: 'US', size: 20, page: 2, order: { field: 'avg_units', desc: false } }],
    ['aba_research_weekly', { marketplace: 'US', size: 20, page: 2, order: { field: 'searches', desc: false } }],
    ['aba_research_monthly', { marketplace: 'US', size: 20, page: 2, order: { field: 'searches', desc: false } }],
    ['keyword_miner', { marketplace: 'US', keywordList: ['phone stand'], size: 20, page: 2, order: { field: 'searches', desc: false } }],
    ['keyword_conversion', { marketplace: 'US', keyword: 'lunch box', size: 20, page: 2, order: { field: 'searches', desc: false } }],
    ['traffic_listing', { marketplace: 'US', asinList: ['B07Z82895W'], relations: ['VAV'], size: 20, page: 2, order: { field: 'trafficPercentage', desc: false } }],
    ['competitor_lookup', { marketplace: 'US', keyword: 'desk lamp', size: 20, page: 2, order: { field: 'revenue', desc: false } }],
  ];
  for (const [name, args] of cases) {
    const res = await call(name, args);
    const d = res.result && res.result.data;
    if (!d) { console.log(name.padEnd(22), JSON.stringify(res).slice(0, 160)); await sleep(320); continue; }
    console.log(name.padEnd(22), 'page=' + d.page, 'size=' + d.size, 'order=' + JSON.stringify(d.order), 'items=' + (Array.isArray(d.items) ? d.items.length : '-'));
    await sleep(340);
  }
})().catch((e) => { console.error(e); process.exit(1); });
