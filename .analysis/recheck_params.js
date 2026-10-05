'use strict';
const local = require('/Users/lihuajun/workspace/mcp-api/app/tools.json');
const fs = require('fs');
const rawOfficial = JSON.parse(fs.readFileSync('/Users/lihuajun/workspace/mcp-api/.analysis/official_tools.json', 'utf8'));
const official = Array.isArray(rawOfficial) ? rawOfficial : (rawOfficial.tools || rawOfficial.result?.tools || []);

function localProps(name) {
  const t = local.find((x) => x.name === name);
  return t ? Object.keys(t.inputSchema.properties || {}) : null;
}
function officialProps(name) {
  const t = official.find((x) => x.name === name);
  if (!t) return null;
  const p = t.inputSchema.properties || {};
  return p.request && p.request.properties ? Object.keys(p.request.properties) : Object.keys(p);
}

// 只关注清单里点名的几个接口
const focus = ['traffic_listing_stat', 'keyword_research', 'keyword_miner', 'aba_research_weekly', 'aba_research_monthly', 'keyword_conversion', 'product_research', 'market_research', 'traffic_keyword'];
for (const n of focus) {
  const l = localProps(n);
  const o = officialProps(n);
  if (!l || !o) { console.log('### ' + n, '本地=' + (l ? l.length : '缺失'), '官方=' + (o ? o.length : '缺失')); continue; }
  const missing = o.filter((k) => !l.includes(k));
  const extra = l.filter((k) => !o.includes(k));
  console.log('### ' + n);
  console.log('   官方有·本地缺:', missing.length ? missing.join(', ') : '（无）');
  console.log('   本地有·官方无:', extra.length ? extra.join(', ') : '（无）');
}

console.log('\n=== 具体枚举/描述核查 ===');
function p(name, key) {
  const t = local.find((x) => x.name === name);
  return t && t.inputSchema.properties[key];
}
console.log('product_research.weightUnit:', JSON.stringify(p('product_research', 'weightUnit')));
console.log('competitor_lookup.variation:', JSON.stringify(p('competitor_lookup', 'variation')));
console.log('keyword_research.supplement:', JSON.stringify(p('keyword_research', 'supplement')));
console.log('keyword_miner 是否有 keyword:', !!p('keyword_miner', 'keyword'), '是否有 matchType:', !!p('keyword_miner', 'matchType'), '是否有 keywordBidMatchType:', !!p('keyword_miner', 'keywordBidMatchType'));
console.log('traffic_extend.queryType:', JSON.stringify(p('traffic_extend', 'queryType')));
console.log('aba_research_weekly 含 date?', !!p('aba_research_weekly', 'date'), 'searchModel?', !!p('aba_research_weekly', 'searchModel'), 'year?', !!p('aba_research_weekly', 'year'), 'week?', !!p('aba_research_weekly', 'week'));
console.log('keyword_conversion.keywordBidMatchType:', JSON.stringify(p('keyword_conversion', 'keywordBidMatchType')));
console.log('traffic_listing_stat props:', JSON.stringify(Object.keys(local.find((x) => x.name === 'traffic_listing_stat').inputSchema.properties)));
console.log('product_node.month:', JSON.stringify(p('product_node', 'month')));
