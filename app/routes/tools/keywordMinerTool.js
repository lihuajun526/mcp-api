const { queryKeywordMiner } = require('../../services/queries/keywordMinerQuery');

module.exports = {
  name: 'keyword_miner',

  async handle(args, user) {
    if (!args.marketplace || !args.keyword) {
      const err = new Error('marketplace and keyword are required');
      err.code = -32602;
      throw err;
    }

    const data = await queryKeywordMiner(user, {
      marketplace: String(args.marketplace),
      keyword: String(args.keyword),
      keywordList: Array.isArray(args.keywordList) ? args.keywordList : undefined,
      historyDate: args.historyDate ? String(args.historyDate) : '',
      page: args.page,
      size: args.size,
      orderField: args.orderField,
      orderDesc: args.orderDesc,
      filterRootWord: args.filterRootWord,
      matchType: args.matchType,
      amazonChoice: args.amazonChoice,
      keywordBidMatchType: args.keywordBidMatchType,
      includeKeywords: Array.isArray(args.includeKeywords) ? args.includeKeywords : undefined,
      excludeKeywords: Array.isArray(args.excludeKeywords) ? args.excludeKeywords : undefined,
      minSearch: args.minSearch,
      maxSearch: args.maxSearch,
      minPurchases: args.minPurchases,
      maxPurchases: args.maxPurchases,
      minPurchasesRate: args.minPurchasesRate,
      maxPurchasesRate: args.maxPurchasesRate,
      minSPR: args.minSPR,
      maxSPR: args.maxSPR,
      minTitleDensity: args.minTitleDensity,
      maxTitleDensity: args.maxTitleDensity,
      minRelevancy: args.minRelevancy,
      maxRelevancy: args.maxRelevancy,
      minSearchRank: args.minSearchRank,
      maxSearchRank: args.maxSearchRank,
      minProducts: args.minProducts,
      maxProducts: args.maxProducts,
      minSupplyDemandRatio: args.minSupplyDemandRatio,
      maxSupplyDemandRatio: args.maxSupplyDemandRatio,
      minAdProducts: args.minAdProducts,
      maxAdProducts: args.maxAdProducts,
      minMonopolyClickRate: args.minMonopolyClickRate,
      maxMonopolyClickRate: args.maxMonopolyClickRate,
      minBid: args.minBid,
      maxBid: args.maxBid,
      minWordCount: args.minWordCount,
      maxWordCount: args.maxWordCount,
      minPrice: args.minPrice,
      maxPrice: args.maxPrice,
      minRatings: args.minRatings,
      maxRatings: args.maxRatings,
      minRating: args.minRating,
      maxRating: args.maxRating
    });

    return {
      code: 'OK',
      message: '成功',
      data
    };
  }
};
