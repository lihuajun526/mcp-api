const { queryProductResearch } = require('../../services/queries/productResearchQuery');
const { buildSuccess } = require('../../toolResponse');
const {
  assertMarketplace,
  assertMonth,
  resolvePageSize,
  assertMatchType,
  toSymbolFlag
} = require('../../utils/validation');

module.exports = {
  // 选产品
  name: 'product_research',

  async handle(args, user) {
    if (args.marketplace == null) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertMarketplace(args.marketplace);
    const month = args.month != null && args.month !== '' ? assertMonth(args.month) : null;
    const size = resolvePageSize(args.size);
    const matchType = assertMatchType(args.matchType);

    const data = await queryProductResearch(user, {
      market: marketplace,
      // 商品资格，低价商品
      eligibility: [],
      lowPrice: 'N',
      filterSub: false,
      monthName: month != null ? `bsr_sales_monthly_${month}` : 'bsr_sales_nearly',
      nodeIdPaths: args.nodeIdPaths != null ? (Array.isArray(args.nodeIdPaths) ? args.nodeIdPaths : []) : [],
      order: {
        field: args.order && args.order.field != null ? String(args.order.field) : 'total_units',
        desc: args.order && args.order.desc != null ? !!args.order.desc : true
      },
      page: args.page ? Number(args.page) : 1,
      size,
      // 包装尺寸类型，枚举值：SS（小号标准尺寸）、LS（大号标准尺寸）、SB（小号大件）
      // 、LB（大号大件）、ELO（超大尺寸：0至50磅）、EL5O（超大尺寸：50至70磅）
      // 、EL7O（超大尺寸：70至150磅）、EL15O（超大尺寸：150磅以上）、O（其他尺寸）
      pkgDimensionTypeList: args.pkgDimensionTypeList != null ? (Array.isArray(args.pkgDimensionTypeList) ? args.pkgDimensionTypeList : []) : [],
      // productTags（产品标识）枚举值：BestSeller、AmazonChoice、NewRelease、A+、NonA+
      productTags: args.productTags != null ? (Array.isArray(args.productTags) ? args.productTags : []) : [],
      // 2：模糊匹配，3：词组匹配，4、精准匹配
      selectType: matchType != null ? String(matchType) : '2',
      // 卖家所属地
      sellerNationList: args.sellerNationList != null ? (Array.isArray(args.sellerNationList) ? args.sellerNationList : []) : [],
      // 配送方式：AMZ、FBA、FBM
      sellerTypes: args.fulfillment != null ? [args.fulfillment] : [],
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
      //nodeIdPathEqual: args.nodeIdPathEqual !== undefined ? !!args.nodeIdPathEqual : undefined,
      // 上架时间
      ...(args.putawayMonth ? { putawayMonth: String(args.availableMonth) } : {}),
      // 价格
      ...(args.minPrice ? { minPrice: String(args.minPrice) } : {}),
      ...(args.maxPrice ? { maxPrice: String(args.maxPrice) } : {}),
      // 评论数（界面上是评分数）
      ...(args.minReviews ? { minReviews: String(args.minReviews) } : {}),
      ...(args.maxReviews ? { maxReviews: String(args.maxReviews) } : {}),
      // 评分值
      ...(args.minReviewRating ? { minReviewRating: String(args.minReviewRating) } : {}),
      ...(args.maxReviewRating ? { maxReviewRating: String(args.maxReviewRating) } : {}),
      // 评论新增数
      ...(args.minReviewsGrouth ? { minReviewsGrouth: String(args.minReviewsGrouth) } : {}),
      ...(args.maxReviewsGrouth ? { maxReviewsGrouth: String(args.maxReviewsGrouth) } : {}),
      // 卖家数量
      ...(args.minSellers ? { minSellers: String(args.minSellers) } : {}),
      ...(args.maxSellers ? { maxSellers: String(args.maxSellers) } : {}),
      // 毛利率
      ...(args.minProfit ? { minProfit: String(args.minProfit) } : {}),
      ...(args.maxProfit ? { maxProfit: String(args.maxProfit) } : {}),
      // BSR
      ...(args.minRanking ? { minRanking: String(args.minRanking) } : {}),
      ...(args.maxRanking ? { maxRanking: String(args.maxRanking) } : {}),
      // BSR增长数
      ...(args.minRankingCv ? { minRankingCv: String(args.minRankingCv) } : {}),
      ...(args.maxRankingCv ? { maxRankingCv: String(args.maxRankingCv) } : {}),
      // BSR增长率
      ...(args.minRankingCr ? { minRankingCr: String(args.minRankingCr) } : {}),
      ...(args.maxRankingCr ? { maxRankingCr: String(args.maxRankingCr) } : {}),
      // 月销量
      ...(args.minSales ? { minSales: String(args.minSales) } : {}),
      ...(args.maxSales ? { maxSales: String(args.maxSales) } : {}),
      // 子体销量
      ...(args.minAmzUnit ? { minAmzUnit: String(args.minAmzUnit) } : {}),
      ...(args.maxAmzUnit ? { maxAmzUnit: String(args.maxAmzUnit) } : {}),
      // 月销售额
      ...(args.minAmount ? { minAmount: String(args.minAmount) } : {}),
      ...(args.maxAmount ? { maxAmount: String(args.maxAmount) } : {}),
      // 月销量环比增长率      
      ...(args.minTotalUnitsGrowth ? { minTotalUnitsGrowth: String(args.minTotalUnitsGrowth) } : {}),
      ...(args.maxTotalUnitsGrowth ? { maxTotalUnitsGrowth: String(args.maxTotalUnitsGrowth) } : {}),
      // 包装重量
      ...(args.minWeights ? { minWeights: String(args.minWeights) } : {}),
      ...(args.maxWeights ? { maxWeights: String(args.maxWeights) } : {}),
      // 变体数量
      ...(args.minVariations ? { minVariations: String(args.minVariations) } : {}),
      ...(args.maxVariations ? { maxVariations: String(args.maxVariations) } : {}),
      // FBA运费
      ...(args.minFba ? { minFba: String(args.minFba) } : {}),
      ...(args.maxFba ? { maxFba: String(args.maxFba) } : {}),
      // LQS
      ...(args.minLqs ? { lqsFrom: String(args.minLqs) } : {}),
      ...(args.maxLqs ? { lqsTo: String(args.maxLqs) } : {}),
    });

    return buildSuccess(args, data);
  }
};
