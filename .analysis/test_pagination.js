'use strict';
const http = require('http');

const KEY = 'demo-key-001';
function call(name, args) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
    const req = http.request({ host: '127.0.0.1', port: 18080, path: '/mcp', method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': KEY, 'Content-Length': Buffer.byteLength(payload) } }, (res) => {
      let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ raw: d.slice(0, 200) }); } });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload); req.end();
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const base = {
  competitor_lookup: { marketplace: 'US', keyword: 'desk lamp' },
  product_research: { marketplace: 'US', keyword: 'desk lamp' },
  keyword_miner: { marketplace: 'US', keywordList: ['phone stand'] },
  keyword_research: { marketplace: 'US', keywords: 'N95' },
  traffic_listing: { marketplace: 'US', asinList: ['B098T9ZFB5'], relations: ['VAV'] },
  traffic_extend: { marketplace: 'US', asinList: ['B07Z82895W'] },
  market_research: { marketplace: 'US' },
  aba_research_weekly: { marketplace: 'US' },
  aba_research_monthly: { marketplace: 'US' },
  keyword_conversion: { marketplace: 'US', keyword: 'lunch box' },
  traffic_keyword: { marketplace: 'US', asin: 'B07Z82895W' },
};

(async () => {
  const out = [];
  for (const [name, b] of Object.entries(base)) {
    const sizes = name === 'keyword_research' ? [15, 50, 100] : [20, 50, 100];
    for (const size of sizes) {
      const res = await call(name, { ...b, size, page: 1 });
      let rec;
      if (res.result) {
        const d = res.result.data || {};
        rec = `req size=${size} -> resp size=${d.size} page=${d.page} pages=${d.pages} total=${d.total} items=${Array.isArray(d.items) ? d.items.length : '-'} code=${res.result.code}`;
      } else if (res.error) rec = `req size=${size} -> RPC_ERR ${res.error.message || JSON.stringify(res.error)}`;
      else rec = `req size=${size} -> ${JSON.stringify(res).slice(0, 150)}`;
      console.log(`${name.padEnd(22)} ${rec}`);
      out.push({ name, size, rec });
      await sleep(320);
    }
    // invalid size test
    const bad = await call(name, { ...b, size: 30, page: 1 });
    const badMsg = bad.error ? `RPC_ERR ${bad.error.message}` : (bad.result ? `code=${bad.result.code} size=${(bad.result.data || {}).size}` : JSON.stringify(bad).slice(0, 120));
    console.log(`${name.padEnd(22)} size=30(invalid) -> ${badMsg}`);
    await sleep(320);
  }
})().catch((e) => { console.error(e); process.exit(1); });
