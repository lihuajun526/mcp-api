const { queryKeywordResearch } = require('../../services/queries/keywordResearchQuery');
const { buildSuccess } = require('../../toolResponse');

const MARKET_STATION_MAP = {
  US: 'US', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

module.exports = {
  name: 'keyword_research',

  async handle(args, user) {
    if (!args.marketplace || !args.keywords) {
      const err = new Error('marketplace and keywords are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = String(args.marketplace);
    const station = MARKET_STATION_MAP[marketplace] || marketplace;
    const size = Math.min(Number(args.size) || 100, 200);
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
      marketId: '1',
      limitUserStatic: 'true',
      adminDes: 'N',
      presetMode: '',
      itemImageRange: '2',
      keywordBidMatchType: 'exact',
      month: args.month ? String(args.month).replace('-', '') : '',
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
