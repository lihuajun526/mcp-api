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
  for (const page of [1, 2, 3]) {
    const res = await call('competitor_lookup', { marketplace: 'US', keyword: 'desk lamp', size: 20, page });
    const d = res.result && res.result.data;
    console.log('page=' + page, d ? ('keys=' + JSON.stringify(Object.keys(d)) + ' total=' + d.total + ' items=' + (Array.isArray(d.items) ? d.items.length : '-')) : JSON.stringify(res).slice(0, 200));
    await sleep(340);
  }
  console.log('--- 不带 order 的分页对照 ---');
  for (const name of ['keyword_miner', 'keyword_conversion', 'aba_research_weekly']) {
    const b = { keyword_miner: { marketplace: 'US', keywordList: ['phone stand'] }, keyword_conversion: { marketplace: 'US', keyword: 'lunch box' }, aba_research_weekly: { marketplace: 'US' } }[name];
    for (const page of [1, 2]) {
      const res = await call(name, { ...b, size: 20, page });
      const d = res.result && res.result.data;
      console.log(name.padEnd(20), 'page=' + page, d ? ('respPage=' + d.page + ' size=' + d.size + ' items=' + (Array.isArray(d.items) ? d.items.length : '-') + ' firstKw=' + ((d.items || [])[0] || {}).keyword) : JSON.stringify(res).slice(0, 150));
      await sleep(340);
    }
  }
})().catch((e) => { console.error(e); process.exit(1); });
