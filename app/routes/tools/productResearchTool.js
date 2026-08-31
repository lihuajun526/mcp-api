const { queryProductResearch } = require('../../services/queries/productResearchQuery');

module.exports = {
  name: 'product_research',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const data = await queryProductResearch(user, {
      marketplace: String(args.marketplace),
      month: args.month ? String(args.month) : undefined,
      keyword: args.keyword ? String(args.keyword) : undefined,
      matchType: args.matchType !== undefined ? Number(args.matchType) : undefined,
      excludeKeywords: args.excludeKeywords ? String(args.excludeKeywords) : undefined,
      includeBrands: args.includeBrands ? String(args.includeBrands) : undefined,
      excludeBrands: args.excludeBrands ? String(args.excludeBrands) : undefined,
      includeSellers: args.includeSellers ? String(args.includeSellers) : undefined,
      excludeSellers: args.excludeSellers ? String(args.excludeSellers) : undefined,
      nodeIdPaths: Array.isArray(args.nodeIdPaths) ? args.nodeIdPaths : (args.nodeIdPath ? [String(args.nodeIdPath)] : undefined),
      nodeIdPathEqual: args.nodeIdPathEqual !== undefined ? !!args.nodeIdPathEqual : undefined,
      filterSub: args.filterSub !== undefined ? (args.filterSub === true || args.filterSub === 'Y') : undefined,
      weightUnit: args.weightUnit ? String(args.weightUnit) : 'g',
      variation: args.variation ? String(args.variation) : undefined,
      fulfillment: args.fulfillment ? String(args.fulfillment) : undefined,
      sellerNation: args.sellerNation ? String(args.sellerNation) : undefined,
      dimensionType: args.dimensionType ? String(args.dimensionType) : undefined,
      badgeBS: args.badgeBS ? String(args.badgeBS) : undefined,
      badgeAC: args.badgeAC ? String(args.badgeAC) : undefined,
      badgeNR: args.badgeNR ? String(args.badgeNR) : undefined,
      availableMonth: args.availableMonth !== undefined ? Number(args.availableMonth) : undefined,
      page: args.page ? Number(args.page) : 1,
      size: args.size ? Number(args.size) : 50,
      orderField: args.order && args.order.field ? String(args.order.field) : (args.orderField || 'total_units'),
      orderDesc: args.order && args.order.desc !== undefined ? !!args.order.desc : (args.orderDesc !== undefined ? !!args.orderDesc : true),
      // 范围过滤
      minPrice: args.minPrice != null ? Number(args.minPrice) : undefined,
      maxPrice: args.maxPrice != null ? Number(args.maxPrice) : undefined,
      minRating: args.minRating != null ? Number(args.minRating) : undefined,
      maxRating: args.maxRating != null ? Number(args.maxRating) : undefined,
      minRatings: args.minRatings != null ? Number(args.minRatings) : undefined,
      maxRatings: args.maxRatings != null ? Number(args.maxRatings) : undefined,
      minRatingsCv: args.minRatingsCv != null ? Number(args.minRatingsCv) : undefined,
      maxRatingsCv: args.maxRatingsCv != null ? Number(args.maxRatingsCv) : undefined,
      minSellers: args.minSellers != null ? Number(args.minSellers) : undefined,
      maxSellers: args.maxSellers != null ? Number(args.maxSellers) : undefined,
      minProfit: args.minProfit != null ? Number(args.minProfit) : undefined,
      maxProfit: args.maxProfit != null ? Number(args.maxProfit) : undefined,
      minBsr: args.minBsr != null ? Number(args.minBsr) : undefined,
      maxBsr: args.maxBsr != null ? Number(args.maxBsr) : undefined,
      minBsrCv: args.minBsrCv != null ? Number(args.minBsrCv) : undefined,
      maxBsrCv: args.maxBsrCv != null ? Number(args.maxBsrCv) : undefined,
      minBsrCr: args.minBsrCr != null ? Number(args.minBsrCr) : undefined,
      maxBsrCr: args.maxBsrCr != null ? Number(args.maxBsrCr) : undefined,
      minUnits: args.minUnits != null ? Number(args.minUnits) : undefined,
      maxUnits: args.maxUnits != null ? Number(args.maxUnits) : undefined,
      minAmzUnit: args.minAmzUnit != null ? Number(args.minAmzUnit) : undefined,
      maxAmzUnit: args.maxAmzUnit != null ? Number(args.maxAmzUnit) : undefined,
      minRevenue: args.minRevenue != null ? Number(args.minRevenue) : undefined,
      maxRevenue: args.maxRevenue != null ? Number(args.maxRevenue) : undefined,
      minRevenueCr: args.minRevenueCr != null ? Number(args.minRevenueCr) : undefined,
      maxRevenueCr: args.maxRevenueCr != null ? Number(args.maxRevenueCr) : undefined,
      minUnitsCr: args.minUnitsCr != null ? Number(args.minUnitsCr) : undefined,
      maxUnitsCr: args.maxUnitsCr != null ? Number(args.maxUnitsCr) : undefined,
      minWeights: args.minWeights != null ? Number(args.minWeights) : undefined,
      maxWeights: args.maxWeights != null ? Number(args.maxWeights) : undefined,
      minVariations: args.minVariations != null ? Number(args.minVariations) : undefined,
      maxVariations: args.maxVariations != null ? Number(args.maxVariations) : undefined,
      minSubBsrRank: args.minSubBsrRank != null ? Number(args.minSubBsrRank) : undefined,
      maxSubBsrRank: args.maxSubBsrRank != null ? Number(args.maxSubBsrRank) : undefined,
      minFba: args.minFba != null ? Number(args.minFba) : undefined,
      maxFba: args.maxFba != null ? Number(args.maxFba) : undefined,
      minLqs: args.minLqs != null ? Number(args.minLqs) : undefined,
      maxLqs: args.maxLqs != null ? Number(args.maxLqs) : undefined
    });

    return {
      isError: false,
      structuredContent: data,
      content: [{ type: 'text', text: `product_research success, total=${data.total}` }]
    };
  }
};
