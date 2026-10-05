const { queryTrafficKeyword } = require('../../services/queries/trafficKeywordQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertToolMarketplace, toMarketCode } = require('../../utils/marketplace');
const { assertMonth, resolveToolPageSize } = require('../../utils/validation');

// 官方 MCP 排序字段枚举（表2.3 流量词列表排序字段）→ 上游 order 整数
const ORDER_FIELD_MAP = {
  rankPosition: 1,
  adPosition: 2,
  createdTime: 3,
  searchesRank: 4,
  searches: 5,
  purchases: 6,
  purchaseRate: 7,
  products: 8,
  supplyDemandRatio: 9,
  latest1daysAds: 10,
  bid: 11,
  trafficPercentage: 12
};
const ORDER_FIELDS = Object.keys(ORDER_FIELD_MAP);
const DEFAULT_ORDER = ORDER_FIELD_MAP.rankPosition; // 默认按自然排名排序

// 输入参数枚举（注意事项 1、2）
const TRAFFIC_KEYWORD_TYPES = ['PRIMARY', 'PRECISE', 'PRECISE_LONG_TAIL'];
const CONVERSION_KEYWORD_TYPES = ['EXCELLENT', 'STABLE', 'LOST', 'INVALID'];
const BADGES = [
  'NATURAL_SEARCHING', 'AMAZON_CHOICE', 'EDITORIAL_RECOMMENDATIONS', 'FOUR_STAR',
  'SPONSOR_BRAND', 'SPONSOR_VIDEO', 'HIGHLY_RATED', 'ADS'
];

function paramError(message) {
  const err = new Error(message);
  err.code = -32602;
  return err;
}

// 官方 order.field 为字符串枚举，转换为上游整数编码
function resolveOrderField(field) {
  if (Object.prototype.hasOwnProperty.call(ORDER_FIELD_MAP, field)) {
    return ORDER_FIELD_MAP[field];
  }
  throw paramError(`order.field must be one of: ${ORDER_FIELDS.join(', ')}`);
}

function resolveOrder(order) {
  if (order === null || order === undefined) return DEFAULT_ORDER;
  const rawField = typeof order === 'object' ? order.field : order;
  if (rawField === null || rawField === undefined || rawField === '') return DEFAULT_ORDER;
  return resolveOrderField(String(rawField));
}

// 官方 desc 默认 false（升序）
function resolveOrderDesc(order) {
  if (order && typeof order === 'object' && order.desc !== undefined) {
    return order.desc === true || order.desc === 'true';
  }
  return false;
}

// 校验数组型枚举参数；未传或空数组返回 []
function resolveEnumList(values, allowed, fieldName) {
  if (values === null || values === undefined) return [];
  if (!Array.isArray(values)) throw paramError(`${fieldName} must be an array`);
  if (values.length === 0) return [];
  const invalid = values.filter((v) => !allowed.includes(v));
  if (invalid.length > 0) {
    throw paramError(`${fieldName} only supports: ${allowed.join(', ')}`);
  }
  return values.map(String);
}

// badges 未传或空数组时默认全部曝光位置类型
function resolveBadges(values) {
  if (!Array.isArray(values) || values.length === 0) return BADGES.slice();
  return resolveEnumList(values, BADGES, 'badges');
}

module.exports = {
  name: 'traffic_keyword',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertToolMarketplace('traffic_keyword', args.marketplace);
    // 将 marketplace 公开代码（US/UK/DE 等）映射到 sellersprite 站点代码（COM/UK/DE 等）
    const market = toMarketCode(marketplace);
    const size = resolveToolPageSize('traffic_keyword', args.size);
    const page = Math.max(Number(args.page) || 1, 1);
    const skip = (page - 1) * size;

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      market,      // 用于构造请求 URL，不作为 payload 字段
      asin: String(args.asin),
      limit: size,
      skip,
      month: args.month != null && args.month !== '' ? assertMonth(args.month) : '',
      badges: resolveBadges(args.badges),
      conversionKeywordTypes: resolveEnumList(args.conversionKeywordTypes, CONVERSION_KEYWORD_TYPES, 'conversionKeywordTypes'),
      trafficKeywordTypes: resolveEnumList(args.trafficKeywordTypes, TRAFFIC_KEYWORD_TYPES, 'trafficKeywordTypes'),
      order: resolveOrder(args.order),
      desc: resolveOrderDesc(args.order),
      exactly: false,
      ac: false,
      keywordBidMatchType: 'exact',
      filterDeletedKeywords: false
    };

    // 关键词过滤（透传给上游）
    if (args.keyword && String(args.keyword).trim()) {
      params.keyword = String(args.keyword).trim();
    }

    const data = await queryTrafficKeyword(user, params);
    return buildSuccess(args, data);
  }
};
