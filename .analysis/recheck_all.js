'use strict';
const http = require('http');
const KEY = 'demo-key-001';

function rpc(method, params) {
  return new Promise((resolve) => {
    const p = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
    const q = http.request(
      { host: '127.0.0.1', port: 18080, path: '/mcp', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': KEY, 'Content-Length': Buffer.byteLength(p) } },
      (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d.slice(0, 300) }); } }); }
    );
    q.on('error', (e) => resolve({ error: e.message }));
    q.write(p); q.end();
  });
}
const call = (name, args) => rpc('tools/call', { name, arguments: args });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function brief(res) {
  if (res.error) return 'ERR ' + res.error.message;
  if (res.result && res.result.code && res.result.code !== 'OK') return 'code=' + res.result.code + ' msg=' + String(res.result.message).slice(0, 60);
  if (res.result && res.result.data) return 'data';
  return JSON.stringify(res).slice(0, 100);
}

(async () => {
  console.log('########## A. order 回显 ##########');
  const orderCases = [
    ['market_research', { marketplace: 'US', size: 20, order: { field: 'avg_units', desc: false } }],
    ['keyword_miner', { marketplace: 'US', keywordList: ['desk lamp'], size: 20, order: { field: 'searches', desc: false } }],
    ['aba_research_weekly', { marketplace: 'US', size: 20, order: { field: 'searches', desc: false } }],
    ['aba_research_monthly', { marketplace: 'US', size: 20, order: { field: 'searches', desc: false } }],
    ['traffic_extend', { marketplace: 'US', asinList: ['B07Z82895W'], size: 20, order: { field: 'searches', desc: false } }],
    ['traffic_listing', { marketplace: 'US', asinList: ['B07Z82895W'], size: 20, order: { field: 'relationCount', desc: false } }],
    ['keyword_conversion', { marketplace: 'US', asin: 'B07Z82895W', keyword: 'desk lamp', size: 20, order: { field: 'searches', desc: false } }],
    ['keyword_research', { marketplace: 'US', keywords: 'desk lamp', size: 20, order: { field: 'searches', desc: false } }],
    ['competitor_lookup', { marketplace: 'US', asins: ['B07Z82895W'], size: 20, order: { field: 'total_units', desc: false } }],
    ['product_research', { marketplace: 'US', keyword: 'desk lamp', size: 20, order: { field: 'total_units', desc: false } }]
  ];
  for (const [n, a] of orderCases) {
    const r = await call(n, a);
    const d = r.result && r.result.data;
    const hasOrder = d && Object.prototype.hasOwnProperty.call(d, 'order');
    console.log('  ' + n.padEnd(22), 'hasOrder=' + hasOrder, 'order=' + JSON.stringify(d && d.order));
    await sleep(700);
  }

  console.log('\n########## B. 非法 order.field 的响应形状 ##########');
  for (const n of ['competitor_lookup', 'product_research']) {
    const r = await call(n, { marketplace: 'US', keyword: 'desk lamp', asins: ['B07Z82895W'], size: 20, order: { field: 'revenue', desc: true } });
    console.log('  ' + n.padEnd(22), JSON.stringify(r).slice(0, 300));
    await sleep(700);
  }

  console.log('\n########## C. traffic_keyword 响应是否含 size/page ##########');
  {
    const r = await call('traffic_keyword', { marketplace: 'US', asin: 'B07Z82895W', size: 20 });
    const d = r.result && r.result.data;
    console.log('  data keys:', d ? Object.keys(d).join(',') : brief(r));
    console.log('  size=' + (d && d.size), 'page=' + (d && d.page), 'total=' + (d && d.total));
    await sleep(700);
  }

  console.log('\n########## D. traffic_listing_stat：官方 asin（单数）/ month 兼容性 ##########');
  for (const a of [
    { marketplace: 'US', asinList: ['B07Z82895W'] },
    { marketplace: 'US', asin: 'B07Z82895W' },
    { marketplace: 'US', asinList: ['B07Z82895W'], month: '202508' }
  ]) {
    const r = await call('traffic_listing_stat', a);
    console.log('  ' + JSON.stringify(a).padEnd(62), r.error ? '✗ ' + r.error.message : (r.result && r.result.code && r.result.code !== 'OK' ? '✗code=' + r.result.code : '✓ data=' + JSON.stringify(r.result && r.result.data).slice(0, 90)));
    await sleep(700);
  }

  console.log('\n########## E. product_node month 是否影响结果 ##########');
  for (const a of [
    { marketplace: 'US', month: '202508' },
    { marketplace: 'US', month: '202401' }
  ]) {
    const r = await call('product_node', a);
    const d = r.result && r.result.data;
    console.log('  ' + JSON.stringify(a).padEnd(40), '→', JSON.stringify(d).slice(0, 160));
    await sleep(700);
  }

  console.log('\n########## F. request 包裹层（官方 schema 形状）是否被解包 ##########');
  {
    const r = await call('competitor_lookup', { request: { marketplace: 'US', asins: ['B07Z82895W'], size: 20 } });
    console.log('  ', JSON.stringify(r).slice(0, 260));
  }

  console.log('\n########## G. tools/list 名称冲突检查 ##########');
  {
    const r = await rpc('tools/list', {});
    const names = (r.result.tools || []).map((t) => t.name);
    const dup = names.filter((n, i) => names.indexOf(n) !== i);
    console.log('  总数=' + names.length, '本地=' + names.filter((n) => !n.startsWith('ss_')).length, '代理=' + names.filter((n) => n.startsWith('ss_')).length);
    console.log('  重名:', dup.length ? dup.join(', ') : '（无）');
    const localShort = names.filter((n) => !n.startsWith('ss_'));
    const clash = names.filter((n) => n.startsWith('ss_')).map((n) => n.slice(3)).filter((n) => localShort.includes(n));
    console.log('  ss_XXX 与本地同名:', clash.length ? clash.join(', ') : '（无）');
  }
})();
