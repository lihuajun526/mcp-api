'use strict';
const http = require('http');
const KEY = 'demo-key-001';

function call(name, args) {
  return new Promise((resolve) => {
    const p = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
    const q = http.request(
      {
        host: '127.0.0.1',
        port: 18080,
        path: '/mcp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': KEY, 'Content-Length': Buffer.byteLength(p) }
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            resolve({ raw: d.slice(0, 300) });
          }
        });
      }
    );
    q.on('error', (e) => resolve({ error: e.message }));
    q.write(p);
    q.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function show(tag, res) {
  if (res.error) return `✗ 连接错误 ${res.error}`;
  if (res.raw) return `✗ 非 JSON ${res.raw}`;
  if (res.error && !res.result) return `✗ ${JSON.stringify(res)}`;
  if (!res.result) return `✗ ${JSON.stringify(res).slice(0, 160)}`;
  if (res.result.isError) {
    const txt = (res.result.content || []).map((c) => c.text).join(' ').slice(0, 120);
    return `✗ 参数被拒：${txt || JSON.stringify(res.result).slice(0, 160)}`;
  }
  const d = res.result.data || {};
  return `✓ size=${d.size} page=${d.page} total=${d.total}`;
}

(async () => {
  console.log('--- competitor_lookup（目标 20/60/100 默认60）---');
  for (const s of [undefined, 20, 60, 100, 50, 15]) {
    const a = { marketplace: 'US', asins: ['B07Z82895W'] };
    if (s !== undefined) a.size = s;
    console.log('  size=' + String(s).padEnd(9), show('competitor_lookup', await call('competitor_lookup', a)));
    await sleep(600);
  }

  console.log('--- product_research（目标 20/60/100 默认60）---');
  for (const s of [undefined, 20, 60, 100, 50]) {
    const a = { marketplace: 'US', keyword: 'desk lamp' };
    if (s !== undefined) a.size = s;
    console.log('  size=' + String(s).padEnd(9), show('product_research', await call('product_research', a)));
    await sleep(600);
  }

  console.log('--- 对照：其它工具应仍为 20/50/100 默认50 ---');
  const others = [
    ['market_research', { marketplace: 'US' }],
    ['keyword_miner', { marketplace: 'US', keywordList: ['desk lamp'] }],
    ['traffic_listing', { marketplace: 'US', asinList: ['B07Z82895W'] }],
    ['traffic_keyword', { marketplace: 'US', asin: 'B07Z82895W' }],
    ['keyword_conversion', { marketplace: 'US', asins: ['B07Z82895W'] }]
  ];
  for (const [n, base] of others) {
    for (const s of [undefined, 50, 60]) {
      const args = { ...base };
      if (s !== undefined) args.size = s;
      console.log('  ' + n.padEnd(20), 'size=' + String(s).padEnd(9), show(n, await call(n, args)));
      await sleep(600);
    }
  }
})();
