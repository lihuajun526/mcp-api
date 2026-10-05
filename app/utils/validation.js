'use strict';

/**
 * MCP 工具入参公共校验/归一化工具。
 * 校验失败统一抛出带 JSON-RPC 错误码 -32602 的 Error，
 * 由 mcpProtocolRoute 转换为标准 JSON-RPC error 响应。
 *
 * 说明：站点（marketplace）相关映射与校验已全部收敛到 app/utils/marketplace.js，
 * 本文件仅保留站点以外的参数校验（月份/分页/排序/匹配方式等）。
 * 站点工具函数在此处 re-export，保持既有 `require('../../utils/validation')` 调用不变。
 */

const marketplace = require('./marketplace');

// ---------------------------------------------------------------------------
// 分页
// ---------------------------------------------------------------------------

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
  // 分页
  PAGE_SIZES,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES_60,
  DEFAULT_PAGE_SIZE_60,
  TOOL_PAGE_SIZES,
  MATCH_TYPES,
  resolvePageSize,
  resolveToolPageSize,
  // 通用
  assertMonth,
  assertMatchType,
  toSymbolFlag,
  resolveOrder,
  resolvePaging,
  toStringArray,
  // 站点（转发 marketplace.js，保持既有调用路径不变）
  MARKETPLACES: marketplace.MARKETPLACES,
  MARKET_ID_MAP: marketplace.MARKET_ID_MAP,
  MARKET_ID_TO_MARKETPLACE: marketplace.MARKET_ID_TO_MARKETPLACE,
  MARKET_ID_SUPPORTED: marketplace.MARKET_ID_SUPPORTED,
  MARKET_CODE_MAP: marketplace.MARKET_CODE_MAP,
  MARKET_STATION_MAP: marketplace.MARKET_STATION_MAP,
  TOOL_MARKETPLACES: marketplace.TOOL_MARKETPLACES,
  getToolMarketplaces: marketplace.getToolMarketplaces,
  assertToolMarketplace: marketplace.assertToolMarketplace,
  resolveToolMarketId: marketplace.resolveToolMarketId,
  resolveToolMarketplace: marketplace.resolveToolMarketplace,
  assertMarketplace: marketplace.assertMarketplace,
  requireMarketId: marketplace.requireMarketId,
  toMarketCode: marketplace.toMarketCode,
  toStationCode: marketplace.toStationCode
};
