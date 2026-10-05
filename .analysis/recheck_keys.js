'use strict';
const http = require('http');
const fs = require('fs');
const KEY = 'demo-key-001';

function call(name, args) {
  return new Promise((resolve) => {
    const p = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
    const q = http.request(
      { host: '127.0.0.1', port: 18080, path: '/mcp', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': KEY, 'Content-Length': Buffer.byteLength(p) } },
      (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d.slice(0, 200) }); } }); }
    );
    q.on('error', (e) => resolve({ error: e.message }));
    q.write(p); q.end();
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const off = JSON.parse(fs.readFileSync('/Users/lihuajun/workspace/mcp-api/.analysis/official_test.json', 'utf8'));
const officialKeys = (n) => { const e = off.find((x) => x.name === n); return e && e.s && e.s.itemKeys ? e.s.itemKeys : null; };

(async () => {
  const cases = [
    ['market_research', { marketplace: 'US', size: 20 }],
    ['keyword_miner', { marketplace: 'US', keywordList: ['desk lamp'], size: 20 }],
    ['competitor_lookup', { marketplace: 'US', asins: ['B07Z82895W'], size: 20 }],
    ['product_research', { marketplace: 'US', keyword: 'desk lamp', size: 20 }],
    ['traffic_keyword', { marketplace: 'US', asin: 'B07Z82895W', size: 20 }],
    ['keyword_research', { marketplace: 'US', keywords: 'desk lamp', size: 20 }]
  ];
  for (const [n, a] of cases) {
    const r = await call(n, a);
    const d = r.result && r.result.data;
    const items = (d && d.items) || [];
    const lk = items[0] ? Object.keys(items[0]) : [];
    const ok = officialKeys(n);
    console.log('### ' + n + '  本地 item 字段=' + lk.length + (ok ? '  官方=' + ok.length : '  官方=（无基线）'));
    if (ok && lk.length) {
      const miss = ok.filter((k) => !lk.includes(k));
      const ext = lk.filter((k) => !ok.includes(k));
      console.log('    官方有·本地缺(' + miss.length + '):', miss.slice(0, 12).join(',') + (miss.length > 12 ? ' …' : ''));
      console.log('    本地有·官方无(' + ext.length + '):', ext.slice(0, 12).join(',') + (ext.length > 12 ? ' …' : ''));
    }
    console.log('    顶层字段:', d ? Object.keys(d).join(',') : '(无 data)');
    await sleep(800);
  }
})();
