'use strict';

/**
 * MCP 工具入参公共校验/归一化工具。
 * 校验失败统一抛出带 JSON-RPC 错误码 -32602 的 Error，
 * 由 mcpProtocolRoute 转换为标准 JSON-RPC error 响应。
 */

// 支持的亚马逊站点编码
const MARKETPLACES = ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX', 'AU', 'AE', 'BR', 'SA'];

// marketplace 公开代码 → marketId (整数)
// 取值来源：卖家精灵前端站点表（code → marketId），与上游 market/marketId 参数一致。
// 注意：并非所有上游接口都支持全部站点，各接口可用站点见 TOOL_MARKETPLACES。
const MARKET_ID_MAP = {
  US: 1, DE: 4, UK: 3, JP: 6, FR: 5, IT: 35691, ES: 44551,
  CA: 7, IN: 44571, MX: 771770, BR: 15, AU: 111172, AE: 9, SA: 13
};

// 支持 marketId 查询的站点（= MARKET_ID_MAP 的键）
const MARKET_ID_SUPPORTED = Object.keys(MARKET_ID_MAP);

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

// 分页每页条数：官方口径「默认 50，最大 100」（多数工具）
const PAGE_SIZES = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 50;

// 例外档：competitor_lookup / product_research 的 size 为 20/60/100，默认 60
const PAGE_SIZES_60 = [20, 60, 100];
const DEFAULT_PAGE_SIZE_60 = 60;

/**
 * 每个工具的 size 档位（仅有例外的工具需要登记，未登记的工具走 PAGE_SIZES/DEFAULT_PAGE_SIZE）。
 * 与 tools.json 中对应工具的 size.enum / description 必须保持一致。
 */
const TOOL_PAGE_SIZES = {
  competitor_lookup: { sizes: PAGE_SIZES_60, defaultSize: DEFAULT_PAGE_SIZE_60 },
  product_research: { sizes: PAGE_SIZES_60, defaultSize: DEFAULT_PAGE_SIZE_60 }
};

// 关键词匹配方式：1 词组匹配，2 模糊匹配，3 精准匹配
const MATCH_TYPES = [1, 2, 3];

function paramError(message) {
  const err = new Error(message);
  err.code = -32602;
  return err;
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * 归一化并校验 marketplace，返回大写站点编码。
 */
function assertMarketplace(value) {
  const marketplace = String(value == null ? '' : value).trim().toUpperCase();
  if (!MARKETPLACES.includes(marketplace)) {
    throw paramError(`marketplace must be one of: ${MARKETPLACES.join(', ')}`);
  }
  return marketplace;
}

/**
 * 校验 yyyyMM 月份，返回字符串形式。
 * 严格校验 6 位数字且月份落在 01-12，避免 Date 自动进位（如 202513 被判为合法）。
 */
function assertMonth(value) {
  const month = String(value == null ? '' : value).trim();
  const invalid = () => paramError('month must be a valid date in yyyyMM format');
  if (!/^\d{6}$/.test(month)) throw invalid();
  const year = Number(month.slice(0, 4));
  const mm = Number(month.slice(4, 6));
  if (year < 1970 || mm < 1 || mm > 12) throw invalid();
  return month;
}

/**
 * 归一化分页大小（通用档）：不传返回默认值 50；传值仅允许 20/50/100。
 */
function resolvePageSize(value) {
  if (isBlank(value)) return DEFAULT_PAGE_SIZE;
  const size = Number(value);
  if (!PAGE_SIZES.includes(size)) {
    throw paramError(`size must be one of: ${PAGE_SIZES.join(', ')}`);
  }
  return size;
}

/**
 * 归一化分页大小（按工具）：未登记 TOOL_PAGE_SIZES 的工具走通用档 20/50/100（默认 50），
 * competitor_lookup / product_research 走 20/60/100（默认 60）。
 */
function resolveToolPageSize(toolName, value) {
  const conf = TOOL_PAGE_SIZES[toolName] || { sizes: PAGE_SIZES, defaultSize: DEFAULT_PAGE_SIZE };
  if (isBlank(value)) return conf.defaultSize;
  const size = Number(value);
  if (!conf.sizes.includes(size)) {
    throw paramError(`size must be one of: ${conf.sizes.join(', ')}`);
  }
  return size;
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

/**
 * 归一化「排序」参数。
 * 兼容 handler 历史上使用过的多种命名：
 *   order: { field, desc }  /  orderField  /  orderDesc  /  'order.field'  /  'order.desc'
 * 统一返回 { field, desc }，供 transformer 回显。
 */
function resolveOrder(request, defaultField = '') {
  const req = request || {};
  const orderObj = req.order && typeof req.order === 'object' ? req.order : {};
  const field =
    orderObj.field != null && orderObj.field !== ''
      ? String(orderObj.field)
      : req.orderField != null && req.orderField !== ''
        ? String(req.orderField)
        : req['order.field'] != null && req['order.field'] !== ''
          ? String(req['order.field'])
          : defaultField;
  const rawDesc =
    orderObj.desc !== undefined
      ? orderObj.desc
      : req.orderDesc !== undefined
        ? req.orderDesc
        : req['order.desc'] !== undefined
          ? req['order.desc']
          : req.desc;
  return { field, desc: rawDesc === undefined || rawDesc === null ? true : rawDesc !== false && rawDesc !== 'false' };
}

/**
 * 归一化「分页」参数。
 * 兼容 page / pageNum 与 size / pageSize 两种命名。
 */
function resolvePaging(request, defaultSize = 50) {
  const req = request || {};
  const page = Math.max(Number(req.page != null ? req.page : req.pageNum) || 1, 1);
  const size = Number(req.size != null ? req.size : req.pageSize) || defaultSize;
  return { page, size };
}

/**
 * 校验 matchType（1/2/3）；不传返回 null，由调用方决定默认值。
 */
function assertMatchType(value) {
  if (isBlank(value)) return null;
  const matchType = Number(value);
  if (!MATCH_TYPES.includes(matchType)) {
    throw paramError(`matchType must be one of: ${MATCH_TYPES.join(', ')}`);
  }
  return matchType;
}

/**
 * variation（N=含变体，Y=不含变体）转换为上游 symbolFlag。
 * 不传时默认 false（含变体）。
 */
function toSymbolFlag(variation) {
  if (isBlank(variation)) return false;
  return String(variation).trim().toUpperCase() === 'Y';
}

/**
 * 将单个值或数组统一为字符串数组（用于 asins / asinList 等列表参数兼容）。
 */
function toStringArray(value) {
  if (value === undefined || value === null || value === '') return [];
  const list = Array.isArray(value) ? value : [value];
  return list.map((v) => String(v));
}

module.exports = {
  MARKETPLACES,
  MARKET_ID_MAP,
  MARKET_ID_SUPPORTED,
  TOOL_MARKETPLACES,
  PAGE_SIZES,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES_60,
  DEFAULT_PAGE_SIZE_60,
  TOOL_PAGE_SIZES,
  MATCH_TYPES,
  assertMarketplace,
  assertMonth,
  resolvePageSize,
  resolveToolPageSize,
  requireMarketId,
  getToolMarketplaces,
  assertToolMarketplace,
  resolveToolMarketId,
  resolveToolMarketplace,
  assertMatchType,
  toSymbolFlag,
  resolveOrder,
  resolvePaging,
  toStringArray
};
