const { queryKeywordConversion } = require('../../services/queries/keywordConversionQuery');

module.exports = {
  name: 'keyword_conversion',

  async handle(args, user) {
    if (!args.marketplace || !args.keyword) {
      const err = new Error('marketplace and keyword are required');
      err.code = -32602;
      throw err;
    }

    const data = await queryKeywordConversion(user, {
      marketplace: String(args.marketplace),
      keyword: String(args.keyword),
      timeType: args.timeType ? String(args.timeType) : 'WEEK',
      page: args.page,
      size: args.size,
      bidMatchType: args.bidMatchType,
      matchType: args.matchType,
      orderDesc: args.orderDesc,
      includeKeywords: Array.isArray(args.includeKeywords) ? args.includeKeywords : undefined,
      excludeKeywords: Array.isArray(args.excludeKeywords) ? args.excludeKeywords : undefined,
      customAvgProductPrice: args.customAvgProductPrice,
      minSearches: args.minSearches,
      maxSearches: args.maxSearches,
      minClicks: args.minClicks,
      maxClicks: args.maxClicks,
      minPurchases: args.minPurchases,
      maxPurchases: args.maxPurchases,
      minSearchConvRate: args.minSearchConvRate,
      maxSearchConvRate: args.maxSearchConvRate,
      minClickConvRate: args.minClickConvRate,
      maxClickConvRate: args.maxClickConvRate,
      minPpc: args.minPpc,
      maxPpc: args.maxPpc,
      minCpa: args.minCpa,
      maxCpa: args.maxCpa,
      minProductPrice: args.minProductPrice,
      maxProductPrice: args.maxProductPrice,
      minAcos: args.minAcos,
      maxAcos: args.maxAcos,
      minClickingRate: args.minClickingRate,
      maxClickingRate: args.maxClickingRate,
      minConversionRate: args.minConversionRate,
      maxConversionRate: args.maxConversionRate,
      minPhraseCount: args.minPhraseCount,
      maxPhraseCount: args.maxPhraseCount,
      minBudget: args.minBudget,
      maxBudget: args.maxBudget
    });

    return {
      code: 'OK',
      message: '成功',
      data
    };
  }
};
