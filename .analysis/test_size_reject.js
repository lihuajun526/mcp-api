'use strict';
const http = require('http');
const KEY = 'demo-key-001';

function call(name, args) {
  return new Promise((resolve) => {
    const p = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
    const q = http.request(
      { host: '127.0.0.1', port: 18080, path: '/mcp', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': KEY, 'Content-Length': Buffer.byteLength(p) } },
      (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d.slice(0, 300) }); } }); }
    );
    q.on('error', (e) => resolve({ error: e.message }));
    q.write(p); q.end();
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('=== 被拒参数的原始错误 ===');
  for (const [n, a] of [
    ['competitor_lookup', { marketplace: 'US', asins: ['B07Z82895W'], size: 50 }],
    ['product_research', { marketplace: 'US', keyword: 'desk lamp', size: 50 }],
    ['market_research', { marketplace: 'US', size: 60 }],
    ['keyword_miner', { marketplace: 'US', keywordList: ['desk lamp'], size: 60 }]
  ]) {
    const r = await call(n, a);
    console.log(' ', n.padEnd(20), JSON.stringify((r.error && { code: r.error.code, message: r.error.message }) || r).slice(0, 150));
    await sleep(500);
  }

  console.log('=== keyword_conversion 正确入参 ===');
  for (const s of [undefined, 50, 60]) {
    const a = { marketplace: 'US', asin: 'B07Z82895W', keyword: 'desk lamp' };
    if (s !== undefined) a.size = s;
    const r = await call('keyword_conversion', a);
    const d = r.result && r.result.data;
    console.log('  size=' + String(s).padEnd(9), r.error ? ('✗ ' + r.error.message) : ('✓ size=' + (d && d.size)));
    await sleep(500);
  }
})();
