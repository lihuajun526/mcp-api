const { queryKeywordResearch } = require('../../services/queries/keywordResearchQuery');
const { buildSuccess } = require('../../toolResponse');
const { resolveToolMarketId, resolveToolPageSize, assertMonth } = require('../../utils/validation');

module.exports = {
  name: 'keyword_research',

  async handle(args, user) {
    if (!args.marketplace || !args.keywords) {
      const err = new Error('marketplace and keywords are required');
      err.code = -32602;
      throw err;
    }

    // marketId 必须按站点映射（原实现写死 '1'，导致所有站点都按美国站出数）
    const marketId = resolveToolMarketId('keyword_research', args.marketplace);
    const marketplace = String(args.marketplace).trim().toUpperCase();
    const station = marketplace;
    // 分页：20/50/100，默认 50（通用档）
    const size = resolveToolPageSize('keyword_research', args.size);
    const page = Math.max(Number(args.page) || 1, 1);
    const orderField = (args.order && args.order.field) || args.orderField || 'searches';
    const orderDesc = (args.order && args.order.desc != null ? args.order.desc : args.orderDesc) !== false;

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      station,
      'order.field': orderField,
      'order.desc': orderDesc ? 'true' : 'false',
      supplement: args.supplement || 'N',
      usestatic: 'R',
      exportGkImages: 'false',
      marketId: String(marketId),
      limitUserStatic: 'true',
      adminDes: 'N',
      presetMode: '',
      itemImageRange: '2',
      keywordBidMatchType: 'exact',
      // 兼容 2026-07 写法，统一归一化为 yyyyMM 并严格校验
      month: args.month ? assertMonth(String(args.month).replace(/-/g, '')) : '',
      minSearches: args.minSearches || '',
      maxSearches: args.maxSearches || '',
      minGrowth: args.minGrowth != null ? args.minGrowth : '',
      maxGrowth: args.maxGrowth != null ? args.maxGrowth : '',
      minGrowthTrendMin: args.minGrowthTrendMin != null ? args.minGrowthTrendMin : '',
      maxGrowthTrendMin: args.maxGrowthTrendMin != null ? args.maxGrowthTrendMin : '',
      minProducts: args.minProducts || '',
      maxProducts: args.maxProducts || '',
      minPurchases: args.minPurchases || '',
      maxPurchases: args.maxPurchases || '',
      minImpressions: '',
      maxImpressions: '',
      minSPR: '',
      maxSPR: '',
      minGoodsValue: args.minGoodsValue != null ? args.minGoodsValue : '',
      maxGoodsValue: args.maxGoodsValue != null ? args.maxGoodsValue : '',
      minAvgPrice: args.minAvgPrice || '',
      maxAvgPrice: args.maxAvgPrice || '',
      minAvgReviews: args.minAvgReviews != null ? args.minAvgReviews : '',
      maxAvgReviews: args.maxAvgReviews != null ? args.maxAvgReviews : '',
      minWordCount: args.minWordCount || '',
      maxWordCount: args.maxWordCount || '',
      minYearlyGrowth: args.minYearlyGrowth != null ? args.minYearlyGrowth : '',
      maxYearlyGrowth: args.maxYearlyGrowth != null ? args.maxYearlyGrowth : '',
      minYearlyGrowthRate: args.minYearlyGrowthRate != null ? args.minYearlyGrowthRate : '',
      maxYearlyGrowthRate: args.maxYearlyGrowthRate != null ? args.maxYearlyGrowthRate : '',
      minGrowthRateTrendMin: args.minGrowthRateTrendMin != null ? args.minGrowthRateTrendMin : '',
      maxGrowthRateTrendMin: args.maxGrowthRateTrendMin != null ? args.maxGrowthRateTrendMin : '',
      marketPeriod: args.marketPeriod || '',
      minSupplyDemandRatio: args.minSupplyDemandRatio || '',
      maxSupplyDemandRatio: args.maxSupplyDemandRatio || '',
      minPurchaseRate: args.minPurchaseRate || '',
      maxPurchaseRate: args.maxPurchaseRate || '',
      minClicks: '',
      maxClicks: '',
      minTitleDensity: '',
      maxTitleDensity: '',
      minMonopolyClickRate: args.minMonopolyClickRate != null ? args.minMonopolyClickRate : '',
      maxMonopolyClickRate: args.maxMonopolyClickRate != null ? args.maxMonopolyClickRate : '',
      minCvsShareRate: '',
      maxCvsShareRate: '',
      minBid: args.minBid || '',
      maxBid: args.maxBid || '',
      minAvgRating: args.minAvgRating != null ? args.minAvgRating : '',
      maxAvgRating: args.maxAvgRating != null ? args.maxAvgRating : '',
      includeKeywords: String(args.keywords),
      excludeKeywords: args.excludeKeywords ? String(args.excludeKeywords) : '',
      page,
      size
    };

    if (args.withYearlyGrowth != null) {
      params.withYearlyGrowth = args.withYearlyGrowth === true || args.withYearlyGrowth === 'true' ? 'true' : 'false';
    }

    const data = await queryKeywordResearch(user, params);
    return buildSuccess(args, data);
  }
};
