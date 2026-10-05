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

const paginated = {
  competitor_lookup: { marketplace: 'US', keyword: 'desk lamp' },
  product_research: { marketplace: 'US', keyword: 'desk lamp' },
  keyword_research: { marketplace: 'US', keywords: 'N95' },
  keyword_miner: { marketplace: 'US', keywordList: ['phone stand'] },
  traffic_listing: { marketplace: 'US', asinList: ['B07Z82895W'], relations: ['VAV'] },
  market_research: { marketplace: 'US' },
  aba_research_weekly: { marketplace: 'US' },
  aba_research_monthly: { marketplace: 'US' },
  keyword_conversion: { marketplace: 'US', keyword: 'lunch box' },
  traffic_extend: { marketplace: 'US', asinList: ['B07Z82895W'] },
  traffic_keyword: { marketplace: 'US', asin: 'B07Z82895W' },
};

(async () => {
  console.log('=== A. 分页 size 实测 (请求 size -> 响应 size / items) ===');
  for (const [name, b] of Object.entries(paginated)) {
    const line = [];
    for (const size of [20, 50, 60, 100, 15, 30, 999]) {
      const res = await call(name, { ...b, size, page: 1 });
      let r;
      if (res.result) { const d = res.result.data || {}; r = `${size}->${d.size}/${Array.isArray(d.items) ? d.items.length : '-'}(${res.result.code || ''})`; }
      else if (res.error) r = `${size}->ERR:${(res.error.message || '').slice(0, 40)}`;
      else r = `${size}->?`;
      line.push(r);
      await sleep(300);
    }
    console.log(name.padEnd(22), line.join('  '));
  }

  console.log('\n=== B. market_research 站点实测 (marketplace -> 首项 nodeIdPath / nodeLabelName / total) ===');
  for (const mp of ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX', 'AU', 'AE', 'BR', 'SA']) {
    const res = await call('market_research', { marketplace: mp, size: 20, page: 1 });
    let r;
    if (res.result) {
      const d = res.result.data || {};
      const it = (d.items || [])[0] || {};
      r = `code=${res.result.code} total=${d.total} first=${it.nodeIdPath || it.nodeId || '-'} / ${it.nodeLabelName || '-'}`;
    } else r = JSON.stringify(res).slice(0, 140);
    console.log(mp.padEnd(4), r);
    await sleep(320);
  }

  console.log('\n=== C. first_category 站点实测 ===');
  for (const mp of ['US', 'AU', 'AE', 'BR', 'SA']) {
    const res = await call('first_category', { marketplace: mp });
    let r;
    if (res.result) { const d = res.result.data || {}; r = `code=${res.result.code} total=${d.total} items=${Array.isArray(d.items) ? d.items.length : '-'} first=${(d.items || [])[0] ? (d.items[0].category_name) : '-'}`; }
    else r = JSON.stringify(res).slice(0, 140);
    console.log(mp.padEnd(4), r);
    await sleep(320);
  }
})().catch((e) => { console.error(e); process.exit(1); });
