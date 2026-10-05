const { queryProductResearch } = require('../../services/queries/productResearchQuery');
const { buildSuccess } = require('../../toolResponse');
const {
  assertToolMarketplace,
  assertMonth,
  resolveToolPageSize,
  assertMatchType,
  toSymbolFlag
} = require('../../utils/validation');

// 官方参数 fulfillment / sellerNation / dimensionType 支持逗号分隔多值
function toList(value) {
  if (value === undefined || value === null || value === '') return [];
  const list = Array.isArray(value) ? value : String(value).split(',');
  return list.map((v) => String(v).trim()).filter(Boolean);
}

// 官方 badgeBS / badgeAC / badgeNR（Y=是）-> 上游 productTags
function toProductTags(args) {
  const tags = [];
  if (String(args.badgeBS).toUpperCase() === 'Y') tags.push('BestSeller');
  if (String(args.badgeAC).toUpperCase() === 'Y') tags.push('AmazonChoice');
  if (String(args.badgeNR).toUpperCase() === 'Y') tags.push('NewRelease');
  return tags;
}

module.exports = {
  // 选产品
  name: 'product_research',

  async handle(args, user) {
    if (args.marketplace == null) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertToolMarketplace('product_research', args.marketplace);
    const month = args.month != null && args.month !== '' ? assertMonth(args.month) : null;
    const size = resolveToolPageSize('product_research', args.size);
    const matchType = assertMatchType(args.matchType);
    // 官方 filterSub 为 String（Y=是），项目 schema 为 boolean，两者都兼容
    const filterSub = args.filterSub === true || String(args.filterSub).toUpperCase() === 'Y';

    const data = await queryProductResearch(user, {
      market: marketplace,
      // 商品资格，低价商品
      eligibility: [],
      lowPrice: 'N',
      smallAndLight: 'N',
      filterSub,
      monthName: month != null ? `bsr_sales_monthly_${month}` : 'bsr_sales_nearly',
      nodeIdPaths: Array.isArray(args.nodeIdPaths) ? args.nodeIdPaths : [],
      //...(args.nodeIdPathEqual !== undefined ? { nodeIdPathEqual: !!args.nodeIdPathEqual } : {}),
      order: {
        field: args.order && args.order.field != null ? String(args.order.field) : 'total_units',
        desc: args.order && args.order.desc != null ? !!args.order.desc : true
      },
      page: (args.page && !isNaN(Number(args.page))) ? Number(args.page) : 1,
      size,
      // 官方 dimensionType（尺寸类型集合，逗号分隔）-> 上游 pkgDimensionTypeList
      // 枚举：SS（小号标准尺寸）、LS（大号标准尺寸）、SB（小号大件）
      // 、LB（大号大件）、ELO（超大尺寸：0至50磅）、EL5O（超大尺寸：50至70磅）
      // 、EL7O（超大尺寸：70至150磅）、EL15O（超大尺寸：150磅以上）、O（其他尺寸）
      pkgDimensionTypeList: toList(args.dimensionType),
      // 官方 badgeBS/badgeAC/badgeNR -> 上游 productTags
      // productTags（产品标识）枚举值：BestSeller、AmazonChoice、NewRelease、A+、NonA+
      productTags: toProductTags(args),
      // 2：模糊匹配，3：词组匹配，4、精准匹配
      selectType: matchType != null ? String(matchType) : '2',
      // 官方 sellerNation（卖家所属地，逗号分隔）-> 上游 sellerNationList
      sellerNationList: toList(args.sellerNation),
      // 官方 fulfillment（配送方式，逗号分隔）：AMZ、FBA、FBM
      sellerTypes: toList(args.fulfillment),
      // 是否包含变体
      symbolFlag: toSymbolFlag(args.variation),
      // 重量单位，枚举值：g、kg、oz、lb
      weightUnit: args.weightUnit != null ? String(args.weightUnit) : 'g',
      // 关键词
      ...(args.keyword ? { keywords: String(args.keyword) } : {}),
      // 排除关键词
      ...(args.excludeKeywords ? { outOfKeywords: String(args.excludeKeywords) } : {}),
      // 包含品牌
      ...(args.includeBrands ? { includeBrands: String(args.includeBrands) } : {}),
      // 排除品牌
      ...(args.excludeBrands ? { excludeBrands: String(args.excludeBrands) } : {}),
      // 包含卖家
      ...(args.includeSellers ? { includeSellers: String(args.includeSellers) } : {}),
      // 排除卖家
      ...(args.excludeSellers ? { excludeSellers: String(args.excludeSellers) } : {}),
      // 官方 availableMonth（上架月份）-> 上游 putawayMonth
      ...(args.availableMonth != null ? { putawayMonth: String(args.availableMonth) } : {}),
      // 价格
      ...(args.minPrice != null ? { minPrice: String(args.minPrice) } : {}),
      ...(args.maxPrice != null ? { maxPrice: String(args.maxPrice) } : {}),
      // 官方 minRatings/maxRatings（评分数）-> 上游 minReviews/maxReviews
      ...(args.minRatings != null ? { minReviews: String(args.minRatings) } : {}),
      ...(args.maxRatings != null ? { maxReviews: String(args.maxRatings) } : {}),
      // 官方 minRating/maxRating（评分值）-> 上游 minReviewRating/maxReviewRating
      ...(args.minRating != null ? { minReviewRating: String(args.minRating) } : {}),
      ...(args.maxRating != null ? { maxReviewRating: String(args.maxRating) } : {}),
      // 官方 minRatingsCv/maxRatingsCv（月新增评分数）-> 上游 minReviewsGrouth/maxReviewsGrouth
      ...(args.minRatingsCv != null ? { minReviewsGrouth: String(args.minRatingsCv) } : {}),
      ...(args.maxRatingsCv != null ? { maxReviewsGrouth: String(args.maxRatingsCv) } : {}),
      // 卖家数量
      ...(args.minSellers != null ? { minSellers: String(args.minSellers) } : {}),
      ...(args.maxSellers != null ? { maxSellers: String(args.maxSellers) } : {}),
      // 毛利率
      ...(args.minProfit != null ? { minProfit: String(args.minProfit) } : {}),
      ...(args.maxProfit != null ? { maxProfit: String(args.maxProfit) } : {}),
      // 官方 minBsr/maxBsr（大类 BSR 排名）-> 上游 minRanking/maxRanking
      ...(args.minBsr != null ? { minRanking: String(args.minBsr) } : {}),
      ...(args.maxBsr != null ? { maxRanking: String(args.maxBsr) } : {}),
      // 官方 minBsrCv/maxBsrCv（BSR 增长数）-> 上游 minRankingCv/maxRankingCv
      ...(args.minBsrCv != null ? { minRankingCv: String(args.minBsrCv) } : {}),
      ...(args.maxBsrCv != null ? { maxRankingCv: String(args.maxBsrCv) } : {}),
      // 官方 minBsrCr/maxBsrCr（BSR 增长率）-> 上游 minRankingCr/maxRankingCr
      ...(args.minBsrCr != null ? { minRankingCr: String(args.minBsrCr) } : {}),
      ...(args.maxBsrCr != null ? { maxRankingCr: String(args.maxBsrCr) } : {}),
      // 官方 minUnits/maxUnits（月销量）-> 上游 minSales/maxSales
      ...(args.minUnits != null ? { minSales: String(args.minUnits) } : {}),
      ...(args.maxUnits != null ? { maxSales: String(args.maxUnits) } : {}),
      // 子体销量
      ...(args.minAmzUnit != null ? { minAmzUnit: String(args.minAmzUnit) } : {}),
      ...(args.maxAmzUnit != null ? { maxAmzUnit: String(args.maxAmzUnit) } : {}),
      // 官方 minRevenue/maxRevenue（月销售额）-> 上游 minAmount/maxAmount
      ...(args.minRevenue != null ? { minAmount: String(args.minRevenue) } : {}),
      ...(args.maxRevenue != null ? { maxAmount: String(args.maxRevenue) } : {}),
      // 官方 minUnitsCr/maxUnitsCr（月销量增长率）-> 上游 minTotalUnitsGrowth/maxTotalUnitsGrowth
      ...(args.minUnitsCr != null ? { minTotalUnitsGrowth: String(args.minUnitsCr) } : {}),
      ...(args.maxUnitsCr != null ? { maxTotalUnitsGrowth: String(args.maxUnitsCr) } : {}),
      // 官方 minRevenueCr/maxRevenueCr（月销售额增长率）-> 上游 minTotalAmountGrowth/maxTotalAmountGrowth
      ...(args.minRevenueCr != null ? { minTotalAmountGrowth: String(args.minRevenueCr) } : {}),
      ...(args.maxRevenueCr != null ? { maxTotalAmountGrowth: String(args.maxRevenueCr) } : {}),
      // 包装重量
      ...(args.minWeights != null ? { minWeights: String(args.minWeights) } : {}),
      ...(args.maxWeights != null ? { maxWeights: String(args.maxWeights) } : {}),
      // 变体数量
      ...(args.minVariations != null ? { minVariations: String(args.minVariations) } : {}),
      ...(args.maxVariations != null ? { maxVariations: String(args.maxVariations) } : {}),
      // 官方 minSubBsrRank/maxSubBsrRank（子类排名，filterSub=Y 生效）
      ...(filterSub && args.minSubBsrRank != null ? { minSubBsrRank: String(args.minSubBsrRank) } : {}),
      ...(filterSub && args.maxSubBsrRank != null ? { maxSubBsrRank: String(args.maxSubBsrRank) } : {}),
      // FBA运费
      ...(args.minFba != null ? { minFba: String(args.minFba) } : {}),
      ...(args.maxFba != null ? { maxFba: String(args.maxFba) } : {}),
      // LQS
      ...(args.minLqs != null ? { lqsFrom: String(args.minLqs) } : {}),
      ...(args.maxLqs != null ? { lqsTo: String(args.maxLqs) } : {})
    });

    return buildSuccess(args, data);
  }
};
