const { queryKeywordResearch } = require('../../services/queries/keywordResearchQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'keyword_research',

  async handle(args, user) {
    if (!args.marketplace || !args.includeKeywords) {
      const err = new Error('marketplace and includeKeywords are required');
      err.code = -32602;
      throw err;
    }

    const data = await queryKeywordResearch(user, {
      marketplace: String(args.marketplace),
      includeKeywords: String(args.includeKeywords),
      excludeKeywords: args.excludeKeywords ? String(args.excludeKeywords) : '',
      month: args.month ? String(args.month).replace('-', '') : '',
      page: args.page,
      size: args.size,
      orderField: args.orderField,
      orderDesc: args.orderDesc,
      supplement: args.supplement,
      minSearches: args.minSearches,
      maxSearches: args.maxSearches,
      minYearlyGrowth: args.minYearlyGrowth,
      maxYearlyGrowth: args.maxYearlyGrowth,
      minProducts: args.minProducts,
      maxProducts: args.maxProducts,
      minPurchases: args.minPurchases,
      maxPurchases: args.maxPurchases,
      minGrowth: args.minGrowth,
      maxGrowth: args.maxGrowth,
      minAvgPrice: args.minAvgPrice,
      maxAvgPrice: args.maxAvgPrice,
      minWordCount: args.minWordCount,
      maxWordCount: args.maxWordCount,
      minSupplyDemandRatio: args.minSupplyDemandRatio,
      maxSupplyDemandRatio: args.maxSupplyDemandRatio,
      minPurchaseRate: args.minPurchaseRate,
      maxPurchaseRate: args.maxPurchaseRate,
      minBid: args.minBid,
      maxBid: args.maxBid,
      marketPeriod: args.marketPeriod,
      keywordBidMatchType: args.keywordBidMatchType
    });

    return buildSuccess(args, data);
  }
};
