const { queryKeywordMiner } = require('../../services/queries/keywordMinerQuery');
const { buildSuccess } = require('../../toolResponse');
const { resolveToolMarketId, resolveToolPageSize } = require('../../utils/validation');

// 对外排序字段名 → 上游 orderBy 整数编码
const ORDER_FIELD_MAP = {
  relevancy: 21,         // 相关度（默认）
  searchRank: 23,        // ABA月排名
  searches: 5,           // 月搜索量
  purchases: 6,          // 月购买量
  purchaseRate: 7,       // 购买率
  impressions: 25,       // 展示量
  clicks: 24,            // 点击量
  spr: 16,               // SPR
  titleDensity: 15,      // 标题密度
  products: 8,           // 商品数
  supplyDemandRatio: 9,  // 供需比
  adProducts: 22,        // 广告竞品数
  monopolyClickRate: 18, // 点击总占比
  cvsShareRate: 27,      // 转化总占比
  bid: 11,               // PPC竞价
  avgPrice: 17,          // 均价
  avgRatings: 20,        // 评分数
  avgRating: 19          // 评分值
};

function resolveOrderBy(orderField) {
  if (!orderField) return ORDER_FIELD_MAP.relevancy; // 默认按相关度排序
  return ORDER_FIELD_MAP[orderField] || ORDER_FIELD_MAP.relevancy;
}

// keywordList 必填，最多 200 个关键词
const MAX_KEYWORD_LIST_LENGTH = 200;

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
  'minRating', 'maxRating'
];

module.exports = {
  name: 'keyword_miner',

  async handle(args, user) {
    const keywordList = Array.isArray(args.keywordList) ? args.keywordList : [];
    if (!args.marketplace || keywordList.length === 0) {
      const err = new Error('marketplace and keywordList are required');
      err.code = -32602;
      throw err;
    }
    if (keywordList.length > MAX_KEYWORD_LIST_LENGTH) {
      const err = new Error(`keywordList must not contain more than ${MAX_KEYWORD_LIST_LENGTH} keywords`);
      err.code = -32602;
      throw err;
    }

    // 排序参数与官方一致：仅接受 order { field, desc } 对象
    const orderField = args.order && args.order.field;
    const orderDesc = args.order && args.order.desc;

    const marketplace = String(args.marketplace).trim().toUpperCase();
    const page = Math.max(Number(args.page) || 1, 1);
    const size = resolveToolPageSize('keyword_miner', args.size);

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      keywordList: keywordList.map(String),
      market: resolveToolMarketId('keyword_miner', marketplace),
      pageNum: page,
      pageSize: size,
      historyDate: args.historyDate ? String(args.historyDate) : '',
      orderBy: resolveOrderBy(orderField),
      desc: orderDesc !== false,
      // 供 transformer 回显排序信息（上游 payload 会剔除该字段）
      order: { field: orderField || 'relevancy', desc: orderDesc !== false },
      filterRootWord: args.filterRootWord != null ? Number(args.filterRootWord) : 0,
      matchType: args.matchType != null ? Number(args.matchType) : 1, // 0=词组匹配，1=广泛匹配（默认）
      amazonChoice: args.amazonChoice === true || args.amazonChoice === 'true',
      keywordBidMatchType: args.keywordBidMatchType || 'exact' // PPC竞价模式：phrase/exact/broad
    };

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
