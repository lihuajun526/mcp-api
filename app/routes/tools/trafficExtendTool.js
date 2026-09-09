const { queryTrafficExtend } = require('../../services/queries/trafficExtendQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'traffic_extend',

  async handle(args, user) {
    if (!args.marketplace || !Array.isArray(args.asinList) || args.asinList.length === 0) {
      const err = new Error('marketplace and asinList are required');
      err.code = -32602;
      throw err;
    }

    const data = await queryTrafficExtend(user, {
      marketplace: String(args.marketplace),
      asinList: args.asinList.map(String),
      historyDate: args.historyDate ? String(args.historyDate) : '',
      queryType: args.queryType,
      page: args.page,
      size: args.size,
      orderField: args.orderField,
      orderDesc: args.orderDesc,
      amazonChoice: args.amazonChoice,
      keywordBidMatchType: args.keywordBidMatchType,
      includeKeywords: Array.isArray(args.includeKeywords) ? args.includeKeywords : undefined,
      excludeKeywords: Array.isArray(args.excludeKeywords) ? args.excludeKeywords : undefined,
      minSearches: args.minSearches,
      maxSearches: args.maxSearches,
      minSearchRank: args.minSearchRank,
      maxSearchRank: args.maxSearchRank,
      minPurchases: args.minPurchases,
      maxPurchases: args.maxPurchases,
      minPurchaseRate: args.minPurchaseRate,
      maxPurchaseRate: args.maxPurchaseRate,
      minProducts: args.minProducts,
      maxProducts: args.maxProducts,
      minSupplyDemandRatio: args.minSupplyDemandRatio,
      maxSupplyDemandRatio: args.maxSupplyDemandRatio,
      minBid: args.minBid,
      maxBid: args.maxBid,
      minAdProducts: args.minAdProducts,
      maxAdProducts: args.maxAdProducts,
      minAvgPrice: args.minAvgPrice,
      maxAvgPrice: args.maxAvgPrice,
      minWordCount: args.minWordCount,
      maxWordCount: args.maxWordCount,
      minSPR: args.minSPR,
      maxSPR: args.maxSPR,
      minTitleDensity: args.minTitleDensity,
      maxTitleDensity: args.maxTitleDensity,
      minMonopolyClickRate: args.minMonopolyClickRate,
      maxMonopolyClickRate: args.maxMonopolyClickRate,
      minTrafficPercentage: args.minTrafficPercentage,
      maxTrafficPercentage: args.maxTrafficPercentage,
      minConversionRate: args.minConversionRate,
      maxConversionRate: args.maxConversionRate,
      minCompetitors: args.minCompetitors,
      maxCompetitors: args.maxCompetitors
    });

    return buildSuccess(args, data);
  }
};
