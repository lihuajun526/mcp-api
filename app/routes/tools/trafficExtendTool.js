const { queryTrafficExtend } = require('../../services/queries/trafficExtendQuery');
const { buildSuccess } = require('../../toolResponse');
const { BusinessError } = require('../../errors');

// marketplace 字符串 → 第三方 market 整数
const MARKETPLACE_TO_MARKET_ID = {
  US: 1, UK: 2, DE: 3, FR: 4, JP: 5,
  CA: 6, IT: 7, ES: 8, IN: 9, AU: 10, MX: 11
};

// Open API 排序字段名 → 第三方 orderColumn 整数（与 traffic_extend 的 orderColumn 枚举保持一致）
const ORDER_FIELD_MAP = {
  searches: 5, purchases: 6, purchaseRate: 7, products: 8,
  supplyDemandRatio: 10, monopolyClickRate: 11, trafficPercentage: 12,
  bid: 13, avgPrice: 14, updatedTime: 15, searchesRank: 2,
  titleDensity: 4, top3ClickingRate: 16, top3ConversionRate: 17
};

function resolveOrderColumn(orderField) {
  if (!orderField) return 12; // 默认按流量占比排序
  const n = Number(orderField);
  if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  return ORDER_FIELD_MAP[orderField] || 12;
}

const RANGE_FIELDS = [
  'minSearches', 'maxSearches',
  'minSearchRank', 'maxSearchRank',
  'minPurchases', 'maxPurchases',
  'minPurchaseRate', 'maxPurchaseRate',
  'minProducts', 'maxProducts',
  'minSupplyDemandRatio', 'maxSupplyDemandRatio',
  'minBid', 'maxBid',
  'minAdProducts', 'maxAdProducts',
  'minAvgPrice', 'maxAvgPrice',
  'minWordCount', 'maxWordCount',
  'minSPR', 'maxSPR',
  'minTitleDensity', 'maxTitleDensity',
  'minMonopolyClickRate', 'maxMonopolyClickRate',
  'minTrafficPercentage', 'maxTrafficPercentage',
  'minConversionRate', 'maxConversionRate',
  'minCompetitors', 'maxCompetitors'
];

module.exports = {
  name: 'traffic_extend',

  async handle(args, user) {
    if (!args.marketplace || !Array.isArray(args.asinList) || args.asinList.length === 0) {
      const err = new Error('marketplace and asinList are required');
      err.code = -32602;
      throw err;
    }

    const asinList = args.asinList.map(String);
    if (asinList.length > 20) {
      throw new BusinessError('asinList 最多支持 20 个 ASIN', 400);
    }

    const marketplace = String(args.marketplace);
    const orderField = args.order && args.order.field ? String(args.order.field) : (args.orderField ? String(args.orderField) : undefined);
    const orderDesc = args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false);
    const page = Math.max(Number(args.page) || 1, 1);
    const size = Math.min(Number(args.size) || 50, 50);

    // queryType: 0 所有变体, 1 畅销变体, 2 当前变体(默认)
    const queryType = args.queryType != null ? Number(args.queryType) : 2;
    const queryVariations = queryType === 0;

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      queryVariations,
      asinList,
      originAsinList: asinList,
      market: MARKETPLACE_TO_MARKET_ID[marketplace] || 1,
      page,
      month: args.historyDate || '',
      size,
      orderColumn: resolveOrderColumn(orderField),
      desc: orderDesc,
      exactly: false,
      ac: args.amazonChoice === true || args.amazonChoice === 'true',
      filterDeletedKeywords: false,
      keywordBidMatchType: args.keywordBidMatchType || 'exact'
    };

    // 范围筛选参数（与 Open API 文档保持一致）
    for (const field of RANGE_FIELDS) {
      if (args[field] != null && args[field] !== '') {
        params[field] = Number(args[field]);
      }
    }

    // 包含 / 排除词
    if (Array.isArray(args.includeKeywords) && args.includeKeywords.length > 0) {
      params.includeKeywords = args.includeKeywords;
    }
    if (Array.isArray(args.excludeKeywords) && args.excludeKeywords.length > 0) {
      params.excludeKeywords = args.excludeKeywords;
    }

    const data = await queryTrafficExtend(user, params);
    return buildSuccess(args, data);
  }
};
