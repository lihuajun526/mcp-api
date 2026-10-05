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

function line(name, s, r) {
  if (r.error) return `✗ ${r.error.message}`;
  if (r.raw) return `✗ 非 JSON ${r.raw}`;
  if (!r.result) return `✗ ${JSON.stringify(r).slice(0, 120)}`;
  const d = r.result.data || {};
  const n = Array.isArray(d.items) ? d.items.length : '-';
  return `✓ echo.size=${d.size} echo.page=${d.page} items=${n} total=${d.total}`;
}

(async () => {
  console.log('=== traffic_extend（目标 20/50/100 默认50）===');
  for (const s of [undefined, 20, 50, 100, 60, 200]) {
    const a = { marketplace: 'US', asinList: ['B07Z82895W'] };
    if (s !== undefined) a.size = s;
    console.log('  size=' + String(s).padEnd(9), line('traffic_extend', s, await call('traffic_extend', a)));
    await sleep(800);
  }

  console.log('=== keyword_research（目标 20/50/100 默认50）===');
  for (const s of [undefined, 20, 50, 100, 60, 15]) {
    const a = { marketplace: 'US', keywords: 'desk lamp' };
    if (s !== undefined) a.size = s;
    console.log('  size=' + String(s).padEnd(9), line('keyword_research', s, await call('keyword_research', a)));
    await sleep(800);
  }

  console.log('=== asin_competitor（保持不变：默认20，max100）===');
  for (const s of [undefined, 20, 100, 200]) {
    const a = { marketplace: 'US', asin: 'B07Z82895W' };
    if (s !== undefined) a.size = s;
    console.log('  size=' + String(s).padEnd(9), line('asin_competitor', s, await call('asin_competitor', a)));
    await sleep(800);
  }
})();
