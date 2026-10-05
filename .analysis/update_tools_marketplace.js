// 按「权威站点枚举」更新 tools.json 中每个工具的 marketplace 枚举与说明
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'app', 'tools.json');

const G10 = ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX'];
const G14 = [...G10, 'BR', 'AU', 'SA', 'AE'];
const G13 = [...G10, 'BR', 'AU', 'AE'];
const G12 = [...G10, 'BR', 'AU'];
const G9 = ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN'];

const TOOL_MARKETPLACES = {
  asin_detail: G10,
  asin_competitor: G10,
  asin_prediction: G10,
  asin_sales_trend: G10,
  bsr_prediction: G10,
  competitor_lookup: G10,
  product_research: G10,
  product_node: G10,
  market_research: G10,
  keyword_research: G14,
  first_category: G14,
  aba_research_weekly: G14,
  aba_research_monthly: G14,
  keyword_miner: G13,
  google_trend: G13,
  traffic_keyword: G13,
  traffic_keyword_stat: G13,
  traffic_extend: G13,
  traffic_listing: G12,
  traffic_listing_stat: G12,
  keyword_conversion: G9
};

const arr = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let updated = 0;
const missing = [];
for (const tool of arr) {
  const list = TOOL_MARKETPLACES[tool.name];
  if (!list) {
    missing.push(tool.name);
    continue;
  }
  const props = (tool.inputSchema && tool.inputSchema.properties) || {};
  const prop = props.marketplace;
  if (!prop) {
    missing.push(tool.name + '(无 marketplace 参数)');
    continue;
  }
  prop.type = 'string';
  prop.description = `亚马逊站点，仅支持 ${list.length} 站：${list.join('/')}`;
  prop.enum = [...list];
  updated++;
}
fs.writeFileSync(FILE, JSON.stringify(arr, null, 2) + '\n', 'utf8');
console.log('已更新工具数:', updated, '/', arr.length);
if (missing.length) console.log('未匹配:', missing.join(', '));
