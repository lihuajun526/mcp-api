'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const KEY = 'demo-key-001';
const BASE = { host: '127.0.0.1', port: 18080, path: '/mcp', method: 'POST' };

function call(name, args) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
    const req = http.request({ ...BASE, headers: { 'Content-Type': 'application/json', 'secret-key': KEY, 'Content-Length': Buffer.byteLength(payload) } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { resolve({ raw: d.slice(0, 300) }); }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

const cases = [
  ['competitor_lookup', { marketplace: 'US', keyword: 'desk lamp', size: 20 }],
  ['asin_competitor', { marketplace: 'US', asin: 'B07Z82895W' }],
  ['product_research', { marketplace: 'US', keyword: 'desk lamp', size: 20 }],
  ['asin_detail', { marketplace: 'US', asin: 'B08GHW4TBS' }],
  ['traffic_keyword', { marketplace: 'US', asin: 'B07Z82895W', size: 20 }],
  ['asin_prediction', { marketplace: 'US', asin: 'B0BDRKG478' }],
  ['keyword_research', { marketplace: 'US', keywords: 'N95', size: 15 }],
  ['traffic_extend', { marketplace: 'US', asinList: ['B07Z82895W'], size: 20 }],
  ['bsr_prediction', { marketplace: 'US', categoryId: '2619525011', bsr: 1 }],
  ['google_trend', { marketplace: 'US', keyword: 'iphone stand' }],
  ['keyword_conversion', { marketplace: 'US', keyword: 'lunch box', size: 20 }],
  ['aba_research_weekly', { marketplace: 'US', size: 20 }],
  ['aba_research_monthly', { marketplace: 'US', size: 20 }],
  ['traffic_keyword_stat', { marketplace: 'US', asin: 'B07Z82895W' }],
  ['traffic_listing_stat', { marketplace: 'US', asinList: ['B098T9ZFB5'] }],
  ['traffic_listing', { marketplace: 'US', asinList: ['B098T9ZFB5'], size: 20 }],
  ['market_research', { marketplace: 'US', size: 20 }],
  ['product_node', { marketplace: 'US', nodeIdPath: '172282:281407' }],
  ['asin_sales_trend', { marketplace: 'US', asin: 'B0DXTMS9NF' }],
  ['keyword_miner', { marketplace: 'US', keywordList: ['phone stand'], size: 20 }],
  ['first_category', { marketplace: 'US' }],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const out = [];
  for (const [name, args] of cases) {
    const res = await call(name, args);
    const rec = { name, args };
    if (res.error) rec.result = 'HTTP_ERR ' + res.error;
    else if (res.error && res.error.message) rec.result = 'RPC_ERR ' + res.error.message;
    else if (res.error) rec.result = 'RPC_ERR ' + JSON.stringify(res.error);
    else if (res.result) {
      const r = res.result;
      rec.code = r.code;
      rec.msg = r.message;
      const d = r.data;
      if (Array.isArray(d)) rec.result = 'array len=' + d.length + ' keys=' + JSON.stringify(Object.keys(d[0] || {}));
      else if (d && typeof d === 'object') {
        const keys = Object.keys(d);
        rec.result = 'obj keys=' + JSON.stringify(keys);
        if (Array.isArray(d.items)) rec.items = d.items.length;
        if (d.items && d.items[0]) rec.itemKeys = Object.keys(d.items[0]);
      } else rec.result = String(d);
    } else rec.result = 'UNKNOWN ' + JSON.stringify(res).slice(0, 300);
    out.push(rec);
    console.log('### ' + name + ' -> ' + (rec.result || '') + (rec.code ? ' | code=' + rec.code + ' msg=' + rec.msg : ''));
    if (rec.items !== undefined) console.log('    items=' + rec.items + ' itemKeys=' + JSON.stringify(rec.itemKeys || []));
    await sleep(250);
  }
  fs.writeFileSync(path.join(__dirname, 'local_test.json'), JSON.stringify(out, null, 2));
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
