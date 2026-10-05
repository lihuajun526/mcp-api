'use strict';
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: process.env.ENV_FILE || '.env.local' });

const URL = process.env.SELLERSPRITE_MCP_URL || 'https://mcp.sellersprite.com/mcp';
const KEY = process.env.SELLERSPRITE_MCP_SECRET_KEY;

async function post(payload) {
  const resp = await axios.post(URL, payload, {
    timeout: 60000, responseType: 'text',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'secret-key': KEY },
    validateStatus: (s) => (s >= 200 && s < 300) || s === 202
  });
  if (resp.status === 202 || resp.data === '') return {};
  const ct = String(resp.headers['content-type'] || '');
  if (ct.includes('text/event-stream')) {
    const blocks = String(resp.data).split(/\r?\n\r?\n/);
    for (const b of blocks) {
      const dl = b.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim());
      if (dl.length) { try { return JSON.parse(dl.join('\n')); } catch (e) {} }
    }
    throw new Error('SSE parse failed');
  }
  return JSON.parse(resp.data);
}

// wrapped = true means arguments = { request: {...} }
const cases = [
  ['competitor_lookup', { marketplace: 'US', keyword: 'desk lamp', size: 20 }, true],
  ['asin_competitor', { marketplace: 'US', asin: 'B07Z82895W' }, false],
  ['product_research', { marketplace: 'US', keyword: 'desk lamp', size: 20 }, true],
  ['asin_detail', { marketplace: 'US', asin: 'B08GHW4TBS' }, false],
  ['traffic_keyword', { marketplace: 'US', asin: 'B07Z82895W', size: 20 }, true],
  ['asin_prediction', { marketplace: 'US', asin: 'B0BDRKG478' }, false],
  ['keyword_research', { marketplace: 'US', keywords: 'N95', size: 15 }, true],
  ['traffic_extend', { marketplace: 'US', asinList: ['B07Z82895W'], queryType: 2, size: 20 }, true],
  ['bsr_prediction', { marketplace: 'US', categoryId: '2619525011', bsr: 1 }, false],
  ['google_trend', { marketplace: 'US', keyword: 'iphone stand' }, true],
  ['keyword_conversion', { marketplace: 'US', keyword: 'lunch box', timeType: 'WEEK', size: 20 }, true],
  ['aba_research_weekly', { marketplace: 'US', size: 20 }, true],
  ['aba_research_monthly', { marketplace: 'US', size: 20 }, true],
  ['traffic_keyword_stat', { marketplace: 'US', asin: 'B07Z82895W' }, false],
  ['traffic_listing_stat', { marketplace: 'US', asin: 'B098T9ZFB5' }, false],
  ['traffic_listing', { marketplace: 'US', asinList: ['B098T9ZFB5'], relations: ['VAV'], size: 20 }, true],
  ['market_research', { marketplace: 'US', size: 20 }, true],
  ['product_node', { marketplace: 'US', nodeIdPath: '172282:281407' }, true],
  ['asin_sales_trend', { marketplace: 'US', asin: 'B0DXTMS9NF' }, false],
  ['keyword_miner', { marketplace: 'US', keywordList: ['phone stand'], size: 20 }, true],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function summarize(res) {
  if (res.error) return { err: JSON.stringify(res.error).slice(0, 200) };
  const r = res.result;
  if (!r) return { raw: JSON.stringify(res).slice(0, 200) };
  if (r.isError) return { isError: true, text: (r.content && r.content[0] && r.content[0].text || '').slice(0, 300) };
  const text = r.content && r.content.find((c) => c.type === 'text') && r.content.find((c) => c.type === 'text').text;
  if (!text) return { noText: JSON.stringify(r).slice(0, 200) };
  try {
    const env = JSON.parse(text);
    const d = env.data;
    const o = { code: env.code };
    if (Array.isArray(d)) { o.shape = 'array len=' + d.length; o.keys = Object.keys(d[0] || {}); }
    else if (d && typeof d === 'object') {
      o.keys = Object.keys(d);
      if (Array.isArray(d.items)) { o.items = d.items.length; o.itemKeys = Object.keys(d.items[0] || {}); }
    } else o.data = String(d);
    return o;
  } catch (e) { return { textRaw: text.slice(0, 300) }; }
}

(async () => {
  let id = 0;
  await post({ jsonrpc: '2.0', id: ++id, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'cmp', version: '1' } } });
  await post({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });
  const out = [];
  for (const [name, args, wrapped] of cases) {
    const arguments_ = wrapped ? { request: args } : args;
    let res;
    try {
      res = await post({ jsonrpc: '2.0', id: ++id, method: 'tools/call', params: { name, arguments: arguments_ } });
    } catch (e) { res = { error: { message: e.message, status: e.response && e.response.status } }; }
    const s = summarize(res);
    out.push({ name, args, s });
    console.log('### ' + name);
    console.log('    ' + JSON.stringify(s));
    await sleep(400);
  }
  fs.writeFileSync(path.join(__dirname, 'official_test.json'), JSON.stringify(out, null, 2));
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
