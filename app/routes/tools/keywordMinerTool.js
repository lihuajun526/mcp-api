const { queryKeywordMiner } = require('../../services/queries/keywordMinerQuery');
const { buildSuccess } = require('../../toolResponse');

// marketplace 字符串 → 第三方 market 整数
const MARKETPLACE_TO_MARKET_ID = {
  US: 1, UK: 2, DE: 3, FR: 4, JP: 5,
  CA: 6, IT: 7, ES: 8, IN: 9, AU: 10, MX: 11
};

// Open API 排序字段名 → 第三方 orderBy 整数
const ORDER_FIELD_MAP = {
  searches: 5, purchases: 6, purchaseRate: 7, products: 8,
  adProducts: 9, supplyDemandRatio: 10, monopolyClickRate: 11,
  spr: 12, bid: 13, avgPrice: 14, avgRating: 15, avgRatings: 16,
  cvsShareRate: 17, relevancy: 1, searchRank: 2, wordCount: 3,
  titleDensity: 4, clicks: 18, impressions: 19
};

function resolveOrderBy(orderField) {
  if (!orderField) return 5; // 默认按搜索量排序
  const n = Number(orderField);
  if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  return ORDER_FIELD_MAP[orderField] || 5;
}

const RANGE_FIELDS = [
  'minSearch', 'maxSearch',
  'minPurchases', 'maxPurchases',
  'minPurchasesRate', 'maxPurchasesRate',
  'minSPR', 'maxSPR',
  'minTitleDensity', 'maxTitleDensity',
  'minRelevancy', 'maxRelevancy',
  'minSearchRank', 'maxSearchRank',
  'minProducts', 'maxProducts',
  'minSupplyDemandRatio', 'maxSupplyDemandRatio',
  'minAdProducts', 'maxAdProducts',
  'minMonopolyClickRate', 'maxMonopolyClickRate',
  'minBid', 'maxBid',
  'minWordCount', 'maxWordCount',
  'minPrice', 'maxPrice',
  'minRatings', 'maxRatings',
  'minRating', 'maxRating',
  'minImpressions', 'maxImpressions',
  'minClicks', 'maxClicks'
];

module.exports = {
  name: 'keyword_miner',

  async handle(args, user) {
    if (!args.marketplace || !args.keyword) {
      const err = new Error('marketplace and keyword are required');
      err.code = -32602;
      throw err;
    }

    // 官方排序参数为对象 order { field, desc }，兼容历史平铺写法 orderField/orderDesc
    const orderField = (args.order && args.order.field) || args.orderField;
    const orderDesc = args.order && args.order.desc != null ? args.order.desc : args.orderDesc;

    const marketplace = String(args.marketplace);
    const page = Math.max(Number(args.page) || 1, 1);
    const size = Math.min(Number(args.size) || 50, 100);

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      keyword: String(args.keyword),
      market: MARKETPLACE_TO_MARKET_ID[marketplace] || 1,
      pageNum: page,
      pageSize: size,
      historyDate: args.historyDate ? String(args.historyDate) : '',
      orderBy: resolveOrderBy(orderField),
      desc: orderDesc !== false,
      filterRootWord: args.filterRootWord != null ? Number(args.filterRootWord) : 0,
      matchType: args.matchType != null ? Number(args.matchType) : 2, // 默认模糊匹配（对齐官方）
      amazonChoice: args.amazonChoice === true || args.amazonChoice === 'true',
      keywordBidMatchType: args.keywordBidMatchType || 'exact'
    };

    // 批量关键词
    if (Array.isArray(args.keywordList) && args.keywordList.length > 0) {
      params.keywordList = args.keywordList;
    }
    // 包含 / 排除词
    if (Array.isArray(args.includeKeywords) && args.includeKeywords.length > 0) {
      params.includeKeywords = args.includeKeywords;
    }
    if (Array.isArray(args.excludeKeywords) && args.excludeKeywords.length > 0) {
      params.excludeKeywords = args.excludeKeywords;
    }

    // 各项范围筛选（undefined 不传）
    for (const field of RANGE_FIELDS) {
      if (args[field] != null && args[field] !== '') {
        params[field] = Number(args[field]);
      }
    }

    const data = await queryKeywordMiner(user, params);
    return buildSuccess(args, data);
  }
};
