// 生成《工具站点支持表》文档
const fs = require('fs');
const path = require('path');
const { TOOL_MARKETPLACES, MARKET_ID_MAP } = require('../app/utils/validation');

const GROUPS = {
  10: ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX'],
  14: ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX', 'BR', 'AU', 'SA', 'AE'],
  13: ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX', 'BR', 'AU', 'AE'],
  12: ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX', 'BR', 'AU'],
  9: ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN']
};

// 工具名 → 上游传参方式（人工核对）
const PARAM_STYLE = {
  asin_detail: '`market`=站点代码',
  asin_competitor: '`market`=站点代码',
  asin_prediction: '`station`=站点代码',
  asin_sales_trend: '`marketId`=整数',
  bsr_prediction: '`station`=站点代码',
  competitor_lookup: '`market`=站点代码',
  product_research: '`market`=站点代码',
  product_node: '`marketplace`（本地类目表）',
  market_research: '`marketId`=整数',
  keyword_research: '`marketId`=整数 + `station`',
  first_category: '`marketplace`',
  aba_research_weekly: '`market`=代码(US→COM)',
  aba_research_monthly: '`market`=代码(US→COM)',
  keyword_miner: '`market`=整数',
  google_trend: '`station`=代码(US→COM)',
  traffic_keyword: '`market`=代码(US→COM)',
  traffic_keyword_stat: '`marketId`=整数',
  traffic_extend: '`market`=整数',
  traffic_listing: '`market`=整数',
  traffic_listing_stat: '`station`=代码(US→COM)',
  keyword_conversion: '`market`=站点代码'
};

const ORDER = [
  'asin_detail', 'asin_competitor', 'asin_prediction', 'asin_sales_trend', 'bsr_prediction',
  'competitor_lookup', 'product_research', 'product_node', 'market_research',
  'keyword_research', 'first_category', 'aba_research_weekly', 'aba_research_monthly',
  'keyword_miner', 'google_trend', 'traffic_keyword', 'traffic_keyword_stat', 'traffic_extend',
  'traffic_listing', 'traffic_listing_stat', 'keyword_conversion'
];

const lines = [];
lines.push('# 工具站点（marketplace）支持表');
lines.push('');
lines.push('> 本表为**权威口径**，由 `app/utils/validation.js` 的 `TOOL_MARKETPLACES` 与 `app/tools.json` 中每个工具的 `marketplace.enum` 共同保证一致。');
lines.push('> 校验入口：各 handler 调用 `assertToolMarketplace(toolName, value)` / `resolveToolMarketId(toolName, value)`，非法站点直接返回 JSON-RPC `-32602`。');
lines.push('> 代理工具（`ss_` 前缀，25 个）由官方 MCP 自行控制，不在此表内。');
lines.push('');
lines.push('## 1. 各工具支持的站点枚举');
lines.push('');
lines.push('| # | 工具 | 站点数 | 支持的站点枚举 | 上游传参方式 |');
lines.push('|---|------|:---:|------|------|');
ORDER.forEach((name, i) => {
  const list = TOOL_MARKETPLACES[name];
  lines.push(`| ${i + 1} | \`${name}\` | ${list.length} | ${list.join(' / ')} | ${PARAM_STYLE[name]} |`);
});
lines.push('');
lines.push('## 2. 站点分组（5 种能力档位）');
lines.push('');
lines.push('| 分组 | 站点数 | 站点枚举 | 工具 |');
lines.push('|------|:---:|------|------|');
[10, 14, 13, 12, 9].forEach((size) => {
  const names = ORDER.filter((n) => TOOL_MARKETPLACES[n].length === size);
  lines.push(`| ${size} 站组 | ${size} | ${GROUPS[size].join(' / ')} | ${names.map((n) => '`' + n + '`').join('、')} |`);
});
lines.push('');
lines.push('## 3. 站点 → 上游 marketId 映射');
lines.push('');
lines.push('来源：卖家精灵前端站点表（`code → marketId`），与上游 `marketId` 参数一致。');
lines.push('');
lines.push('| 站点 | marketId | 站点 | marketId | 站点 | marketId |');
lines.push('|------|:---:|------|:---:|------|:---:|');
const idPairs = [
  ['US', MARKET_ID_MAP.US], ['JP', MARKET_ID_MAP.JP], ['UK', MARKET_ID_MAP.UK],
  ['DE', MARKET_ID_MAP.DE], ['FR', MARKET_ID_MAP.FR], ['IT', MARKET_ID_MAP.IT],
  ['ES', MARKET_ID_MAP.ES], ['CA', MARKET_ID_MAP.CA], ['IN', MARKET_ID_MAP.IN],
  ['MX', MARKET_ID_MAP.MX], ['AU', MARKET_ID_MAP.AU], ['AE', MARKET_ID_MAP.AE],
  ['SA', MARKET_ID_MAP.SA], ['BR', MARKET_ID_MAP.BR]
];
for (let i = 0; i < idPairs.length; i += 3) {
  const row = [];
  for (let j = 0; j < 3; j++) {
    const p = idPairs[i + j];
    row.push(p ? `${p[0]}` : '', p ? `${p[1]}` : '');
  }
  lines.push(`| ${row.join(' | ')} |`);
}
lines.push('');
lines.push('## 4. 变更说明');
lines.push('');
lines.push('- 原实现：`MARKET_ID_MAP[marketplace] || 1` 会把未收录站点**静默降级为美国站**，返回错误数据；`keyword_research` 甚至把 `marketId` 写死为 `1`。');
lines.push('- 现实现：`MARKET_ID_MAP` 补齐 14 站；每个工具按上表**显式校验**，不支持则报错，不再静默降级。');
lines.push('- `tools.json` 中 21 个工具的 `marketplace.enum` 与描述已按上表同步。');

const out = path.join(__dirname, '..', 'docs', '工具站点支持表.md');
fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8');
console.log('已生成:', out);
console.log(lines.slice(9, 34).join('\n'));
