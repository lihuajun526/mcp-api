'use strict';

/**
 * 站点（marketplace）公共映射与校验 —— 全工程唯一权威来源。
 *
 * 聚合了原先分散在 validation.js / googleTrendTool / abaResearchWeeklyTool /
 * abaResearchMonthlyTool / trafficKeywordTool / trafficListingStatTool / keywordOrderTool
 * 的 6 张站点表：
 *   - MARKET_ID_MAP             站点 → marketId（整数，上游 market/marketId 参数）
 *   - MARKET_ID_TO_MARKETPLACE  marketId → 站点（反查，供 transformer 使用）
 *   - MARKET_CODE_MAP           站点 → 第三方 market 代码（US→COM）
 *   - MARKET_STATION_MAP        站点 → 公开站点代码（US→US，出单词反查页）
 *   - TOOL_MARKETPLACES         按工具的站点分组（权威口径）
 *   - 站点分组常量              G_CORE_9 / G_CORE_10 / G_CORE_12 / G_CORE_13 / G_CORE_14
 *
 * 校验失败统一抛出带 JSON-RPC 错误码 -32602 的 Error。
 */

// 支持的亚马逊站点编码（公共集）
const MARKETPLACES = ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX', 'AU', 'AE', 'BR', 'SA'];

// marketplace 公开代码 → marketId (整数)
// 取值来源：卖家精灵前端站点表（code → marketId），与上游 market/marketId 参数一致。
const MARKET_ID_MAP = {
  US: 1, DE: 4, UK: 3, JP: 6, FR: 5, IT: 35691, ES: 44551,
  CA: 7, IN: 44571, MX: 771770, BR: 15, AU: 111172, AE: 9, SA: 13
};

// marketId → marketplace 字符串映射（由权威映射反推，避免多处口径不一致）
const MARKET_ID_TO_MARKETPLACE = Object.entries(MARKET_ID_MAP).reduce((acc, [code, id]) => {
  acc[id] = code;
  return acc;
}, {});

// 支持 marketId 查询的站点（= MARKET_ID_MAP 的键）
const MARKET_ID_SUPPORTED = Object.keys(MARKET_ID_MAP);

// marketplace → 第三方 market 代码 (US→COM)
// 用于 google_trend / aba_research_weekly / aba_research_monthly / traffic_keyword / traffic_listing_stat
const MARKET_CODE_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN',
  AU: 'AU', BR: 'BR', AE: 'AE', SA: 'SA'
};

// marketplace → 公开站点代码 (US→US)
// 用于 keyword_order（出单词反查页面使用公开站点代码，上游仅支持这 11 站）
const MARKET_STATION_MAP = {
  US: 'US', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

// ---------------------------------------------------------------------------
// 站点分组：按上游各接口实际支持的站点集合划分
// ---------------------------------------------------------------------------
const G_CORE_10 = ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX'];
const G_CORE_14 = [...G_CORE_10, 'BR', 'AU', 'SA', 'AE'];
const G_CORE_13 = [...G_CORE_10, 'BR', 'AU', 'AE'];
const G_CORE_12 = [...G_CORE_10, 'BR', 'AU'];
const G_CORE_9 = ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN'];

/**
 * 每个工具支持的 marketplace 枚举（权威口径）。
 * 与 tools.json 中对应工具的 marketplace.enum 必须保持一致。
 */
const TOOL_MARKETPLACES = {
  // 10 站
  asin_detail: G_CORE_10,
  asin_competitor: G_CORE_10,
  asin_prediction: G_CORE_10,
  asin_sales_trend: G_CORE_10,
  bsr_prediction: G_CORE_10,
  competitor_lookup: G_CORE_10,
  product_research: G_CORE_10,
  product_node: G_CORE_10,
  market_research: G_CORE_10,
  // 14 站
  keyword_research: G_CORE_14,
  first_category: G_CORE_14,
  aba_research_weekly: G_CORE_14,
  aba_research_monthly: G_CORE_14,
  // 13 站
  keyword_miner: G_CORE_13,
  google_trend: G_CORE_13,
  traffic_keyword: G_CORE_13,
  traffic_keyword_stat: G_CORE_13,
  traffic_extend: G_CORE_13,
  // 12 站
  traffic_listing: G_CORE_12,
  traffic_listing_stat: G_CORE_12,
  // 9 站
  keyword_conversion: G_CORE_9
};

function paramError(message) {
  const err = new Error(message);
  err.code = -32602;
  return err;
}

/** 取某工具支持的站点列表；未知工具回退为公共 14 站。 */
function getToolMarketplaces(toolName) {
  return TOOL_MARKETPLACES[toolName] || MARKETPLACES;
}

/**
 * 归一化并校验某工具的 marketplace，返回大写站点编码。
 * 站点不在该工具支持列表内时抛 -32602。
 */
function assertToolMarketplace(toolName, value) {
  const code = String(value == null ? '' : value).trim().toUpperCase();
  const allowed = getToolMarketplaces(toolName);
  if (!allowed.includes(code)) {
    throw paramError(`marketplace must be one of: ${allowed.join(', ')}`);
  }
  return code;
}

/** 某工具的 marketplace → 上游 marketId（整数）。 */
function resolveToolMarketId(toolName, value) {
  const code = assertToolMarketplace(toolName, value);
  return MARKET_ID_MAP[code];
}

/** 某工具的 marketplace → 上游 station/market 代码字符串（US→COM 等由调用方决定）。 */
function resolveToolMarketplace(toolName, value) {
  return assertToolMarketplace(toolName, value);
}

/**
 * 归一化并校验 marketplace（公共 14 站），返回大写站点编码。
 * 用于协议层在分发前的统一预校验；按工具的精细校验由 assertToolMarketplace 负责。
 */
function assertMarketplace(value) {
  const marketplace = String(value == null ? '' : value).trim().toUpperCase();
  if (!MARKETPLACES.includes(marketplace)) {
    throw paramError(`marketplace must be one of: ${MARKETPLACES.join(', ')}`);
  }
  return marketplace;
}

/**
 * 解析 marketId（整数）。站点不在支持列表时显式报错，
 * 禁止再退化成 `|| 1`（会把 AU/AE/BR/SA 静默当成美国站返回错误数据）。
 */
function requireMarketId(marketplace) {
  const code = String(marketplace == null ? '' : marketplace).trim().toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(MARKET_ID_MAP, code)) {
    throw paramError(
      `marketplace ${code || '(empty)'} 不支持该接口的按站点查询，仅支持: ${MARKET_ID_SUPPORTED.join(', ')}`
    );
  }
  return MARKET_ID_MAP[code];
}

/** marketplace → 第三方 market 代码（US→COM）；未知代码原样返回。 */
function toMarketCode(marketplace) {
  const code = String(marketplace == null ? '' : marketplace);
  return MARKET_CODE_MAP[code] || code;
}

/** marketplace → 公开站点代码（US→US）；未知代码原样返回。 */
function toStationCode(marketplace) {
  const code = String(marketplace == null ? '' : marketplace);
  return MARKET_STATION_MAP[code] || code;
}

module.exports = {
  MARKETPLACES,
  MARKET_ID_MAP,
  MARKET_ID_TO_MARKETPLACE,
  MARKET_ID_SUPPORTED,
  MARKET_CODE_MAP,
  MARKET_STATION_MAP,
  G_CORE_9,
  G_CORE_10,
  G_CORE_12,
  G_CORE_13,
  G_CORE_14,
  TOOL_MARKETPLACES,
  getToolMarketplaces,
  assertToolMarketplace,
  resolveToolMarketId,
  resolveToolMarketplace,
  assertMarketplace,
  requireMarketId,
  toMarketCode,
  toStationCode
};
