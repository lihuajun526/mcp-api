const { queryKeywordConversion } = require('../../services/queries/keywordConversionQuery');
const { buildSuccess } = require('../../toolResponse');

// 对外时间类型 WEEK | 90D → 上游 timeType：WEEK→w、90D→90D
const TIME_TYPE_MAP = { WEEK: 'w', '90D': '90D' };

// 分页大小仅支持 20/50/100，默认 50
const PAGE_SIZES = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 50;

function resolvePageSize(value) {
  if (value == null || value === '') return DEFAULT_PAGE_SIZE;
  const size = Number(value);
  if (!PAGE_SIZES.includes(size)) {
    const err = new Error(`size must be one of: ${PAGE_SIZES.join(', ')}`);
    err.code = -32602;
    throw err;
  }
  return size;
}

const RANGE_FIELDS = [
  'minSearches', 'maxSearches',
  'minClicks', 'maxClicks',
  'minPurchases', 'maxPurchases',
  'minSearchConvRate', 'maxSearchConvRate',
  'minClickConvRate', 'maxClickConvRate',
  'minPpc', 'maxPpc',
  'minCpa', 'maxCpa',
  'minProductPrice', 'maxProductPrice',
  'minAcos', 'maxAcos',
  'minClickingRate', 'maxClickingRate',
  'minConversionRate', 'maxConversionRate',
  'minPhraseCount', 'maxPhraseCount',
  'minBudget', 'maxBudget'
];

module.exports = {
  name: 'keyword_conversion',

  async handle(args, user) {
    if (!args.marketplace || !args.keyword) {
      const err = new Error('marketplace and keyword are required');
      err.code = -32602;
      throw err;
    }

    const timeType = TIME_TYPE_MAP[args.timeType] || 'w'; // 默认 WEEK
    const page = Math.max(Number(args.page) || 1, 1);
    const size = resolvePageSize(args.size);

    const params = {
      marketplace: String(args.marketplace), // 供 transformer 使用，不发往上游
      pageNum: page,
      pageSize: size,
      market: String(args.marketplace),
      timeType,
      bidMatchType: args.keywordBidMatchType || 'exact', // PPC竞价模式：phrase/exact/broad
      keywordMatchType: 'all',
      matchType: args.matchType != null ? Number(args.matchType) : 1, // 0=词组匹配，1=广泛匹配（默认）
      keyword: String(args.keyword)
    };

    for (const field of RANGE_FIELDS) {
      if (args[field] != null && args[field] !== '') {
        params[field] = Number(args[field]);
      }
    }

    if (Array.isArray(args.includeKeywords) && args.includeKeywords.length > 0) {
      params.includeKeywords = args.includeKeywords;
    }
    if (Array.isArray(args.excludeKeywords) && args.excludeKeywords.length > 0) {
      params.excludeKeywords = args.excludeKeywords;
    }
    if (args.customAvgProductPrice != null) {
      params.customAvgProductPrice = Number(args.customAvgProductPrice);
    }

    const data = await queryKeywordConversion(user, params);
    return buildSuccess(args, data);
  }
};
