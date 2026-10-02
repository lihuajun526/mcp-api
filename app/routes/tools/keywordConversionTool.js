const { queryKeywordConversion } = require('../../services/queries/keywordConversionQuery');
const { buildSuccess } = require('../../toolResponse');

// Open API 时间类型 → 第三方 timeType
// Open API: WEEK | 90D  ；第三方: W | 90D
const TIME_TYPE_MAP = { WEEK: 'W', W: 'W', '90D': '90D' };

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

    const timeType = TIME_TYPE_MAP[args.timeType] || 'W';
    const page = Math.max(Number(args.page) || 1, 1);
    const size = Math.min(Number(args.size) || 100, 100);

    const params = {
      marketplace: String(args.marketplace), // 供 transformer 使用，不发往上游
      pageNum: page,
      pageSize: size,
      market: String(args.marketplace),
      timeType,
      bidMatchType: args.bidMatchType || 'exact',
      desc: args.orderDesc !== false,
      keywordMatchType: 'all',
      matchType: args.matchType != null ? Number(args.matchType) : 1,
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
