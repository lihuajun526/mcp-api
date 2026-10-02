const { queryAsinReversing } = require('../../services/queries/asinReversingQuery');
const { buildSuccess } = require('../../toolResponse');

// 将 marketplace 公开代码（US/UK/DE 等）映射到 sellersprite 站点代码（COM/UK/DE 等）
const MARKET_CODE_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

// Open API 排序字段名 → 第三方 order 整数（与 traffic_extend 的 orderColumn 枚举保持一致）
const ORDER_FIELD_MAP = {
  searches: 5, purchases: 6, purchaseRate: 7, products: 8,
  supplyDemandRatio: 10, monopolyClickRate: 11, trafficPercentage: 12,
  bid: 13, avgPrice: 14, updatedTime: 15, searchesRank: 2,
  titleDensity: 4, top3ClickingRate: 16, top3ConversionRate: 17
};

// 官方 order.field 为字符串，第三方 order 为整数编码；无映射时回退默认 12
function resolveOrder(order) {
  if (order === null || order === undefined) return 12;
  const rawField = typeof order === 'object' ? order.field : order;
  if (rawField === null || rawField === undefined || rawField === '') return 12;
  const n = Number(rawField);
  if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  return ORDER_FIELD_MAP[rawField] || 12;
}

function resolveOrderDesc(order) {
  if (order && typeof order === 'object' && order.desc !== undefined) {
    return order.desc !== false;
  }
  return true;
}

module.exports = {
  name: 'traffic_keyword',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = String(args.marketplace);
    const market = MARKET_CODE_MAP[marketplace] || marketplace;
    const size = Math.min(Math.max(Number(args.size) || 50, 1), 100);
    const page = Math.max(Number(args.page) || 1, 1);
    const skip = (page - 1) * size;

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      market,      // 用于构造请求 URL，不作为 payload 字段
      asin: String(args.asin),
      limit: size,
      skip,
      month: args.month || '',
      badges: Array.isArray(args.badges) && args.badges.length > 0
        ? args.badges
        : ['NATURAL_SEARCHING', 'AMAZON_CHOICE', 'EDITORIAL_RECOMMENDATIONS', 'FOUR_STAR', 'SPONSOR_BRAND', 'SPONSOR_VIDEO', 'HIGHLY_RATED', 'ADS'],
      conversionKeywordTypes: Array.isArray(args.conversionKeywordTypes) && args.conversionKeywordTypes.length > 0
        ? args.conversionKeywordTypes
        : [],
      trafficKeywordTypes: Array.isArray(args.trafficKeywordTypes) && args.trafficKeywordTypes.length > 0
        ? args.trafficKeywordTypes
        : [],
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

    const data = await queryAsinReversing(user, params);
    return buildSuccess(args, data);
  }
};
