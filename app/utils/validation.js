'use strict';

/**
 * MCP 工具入参公共校验/归一化工具。
 * 校验失败统一抛出带 JSON-RPC 错误码 -32602 的 Error，
 * 由 mcpProtocolRoute 转换为标准 JSON-RPC error 响应。
 */

// 支持的亚马逊站点编码
const MARKETPLACES = ['US', 'JP', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'IN', 'MX', 'AU', 'AE', 'BR', 'SA'];

// marketplace 公开代码 → marketId (整数)
const MARKET_ID_MAP = {
  US: 1, DE: 4, UK: 3, JP: 6, FR: 5, IT: 35691, ES: 44551,
  CA: 7, IN: 44571, MX: 771770
};

// 分页每页条数：仅支持 20 / 60 / 100，默认 60
const PAGE_SIZES = [20, 60, 100];
const DEFAULT_PAGE_SIZE = 60;

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
 * 归一化分页大小：不传返回默认值 60；传值仅允许 20/60/100。
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
  PAGE_SIZES,
  DEFAULT_PAGE_SIZE,
  MATCH_TYPES,
  assertMarketplace,
  assertMonth,
  resolvePageSize,
  assertMatchType,
  toSymbolFlag,
  toStringArray
};
