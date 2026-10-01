const { queryKeywordResearch } = require('../../services/queries/keywordResearchQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'keyword_research',

  async handle(args, user) {
    // 官方参数名为 keywords（String），必填
    if (!args.marketplace || !args.keywords) {
      const err = new Error('marketplace and keywords are required');
      err.code = -32602;
      throw err;
    }

    // 官方排序参数为对象 order { field, desc }，兼容历史平铺写法 orderField/orderDesc
    const orderField = (args.order && args.order.field) || args.orderField;
    const orderDesc = args.order && args.order.desc != null ? args.order.desc : args.orderDesc;

    const data = await queryKeywordResearch(user, {
      marketplace: String(args.marketplace),
      keywords: String(args.keywords),
      excludeKeywords: args.excludeKeywords ? String(args.excludeKeywords) : '',
      departments: Array.isArray(args.departments)
        ? args.departments
        : (args.departments ? [String(args.departments)] : undefined),
      month: args.month ? String(args.month).replace('-', '') : '',
      page: args.page,
      size: args.size,
      orderField,
      orderDesc,
      supplement: args.supplement,
      minSearches: args.minSearches,
      maxSearches: args.maxSearches,
      minGrowth: args.minSearchesCr,
      maxGrowth: args.maxSearchesCr,
      minProducts: args.minProducts,
      maxProducts: args.maxProducts,
      minPurchases: args.minPurchases,
      maxPurchases: args.maxPurchases,
      minPurchaseRate: args.minPurchaseRate,
      maxPurchaseRate: args.maxPurchaseRate,
      withYearlyGrowth: args.withYearlyGrowth,
      minYearlyGrowth: args.minSearchMonthCv,
      maxYearlyGrowthRate: args.maxSearchMonthCv,
      minYearlyGrowthRate: args.minSearchMonthCr,
      maxYearlyGrowthRate: args.maxSearchMonthCr,
      minGrowthTrendMin: args.minSearchNearlyCv,
      maxGrowthTrendMin: args.maxSearchNearlyCv,
      minGrowthRateTrendMin: args.minSearchNearlyCr,
      maxGrowthRateTrendMin: args.maxSearchNearlyCr,
      marketPeriod: args.marketPeriod,
      minAvgPrice: args.minAvgPrice,
      maxAvgPrice: args.maxAvgPrice,
      minAvgReviews: args.minRatings,
      maxAvgReviews: args.maxRatings,
      minAvgRating: args.minRating,
      maxAvgRating: args.maxRating,
      minBid: args.minBid,
      maxBid: args.maxBid,
      minMonopolyClickRate: args.minAraClickRate,
      maxMonopolyClickRate: args.maxAraClickRate,
      minGoodsValue: args.minGoodsValue,
      maxGoodsValue: args.maxGoodsValue,
      minSupplyDemandRatio: args.minSupplyDemandRatio,
      maxSupplyDemandRatio: args.maxSupplyDemandRatio,
      minWordCount: args.minWordCount,
      maxWordCount: args.maxWordCount
    });

    return buildSuccess(args, data);
  }
};
