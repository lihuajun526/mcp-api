'use strict';
const http = require('http');
const fs = require('fs');
const KEY = 'demo-key-001';

function call(name, args) {
  return new Promise((resolve) => {
    const p = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
    const q = http.request(
      { host: '127.0.0.1', port: 18080, path: '/mcp', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'secret-key': KEY, 'Content-Length': Buffer.byteLength(p) } },
      (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d.slice(0, 200) }); } }); }
    );
    q.on('error', (e) => resolve({ error: e.message }));
    q.write(p); q.end();
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const off = JSON.parse(fs.readFileSync('/Users/lihuajun/workspace/mcp-api/.analysis/official_test.json', 'utf8'));
function officialItemKeys(name) {
  const e = off.find((x) => x.name === name);
  if (!e || !e.s || !e.s.itemKeys) return null;
  return e.s.itemKeys;
}

(async () => {
  const cases = [
    ['traffic_extend', { marketplace: 'US', asinList: ['B07Z82895W'], size: 20 }],
    ['traffic_listing', { marketplace: 'US', asinList: ['B07Z82895W'], size: 20 }]
  ];
  for (const [n, a] of cases) {
    const r = await call(n, a);
    const d = r.result && r.result.data;
    const items = (d && d.items) || [];
    const lk = items[0] ? Object.keys(items[0]) : [];
    const ok = officialItemKeys(n);
    console.log('### ' + n, '本地 items=' + items.length, 'total=' + (d && d.total));
    console.log('   本地 item 字段(' + lk.length + '):', lk.join(',') || '(空)');
    if (ok) {
      const missing = ok.filter((k) => !lk.includes(k));
      const extra = lk.filter((k) => !ok.includes(k));
      console.log('   官方 item 字段(' + ok.length + ') => 官方有·本地缺:', missing.length ? missing.join(',') : '（无）');
      console.log('                             本地有·官方无:', extra.length ? extra.join(',') : '（无）');
    } else {
      console.log('   （官方样本无 itemKeys）');
    }
    await sleep(800);
  }
})();
