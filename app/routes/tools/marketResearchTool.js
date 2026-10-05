const { queryMarketResearch } = require('../../services/queries/marketResearchQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertMonth, resolveToolMarketId } = require('../../utils/validation');

// 官方参数名 → 上游表单参数名（名称不同的才需映射，其余同名直接透传）
const FIELD_ALIAS = {
  minAvgUnits: 'minAvgSales', maxAvgUnits: 'maxAvgSales',
  minAvgRatings: 'minAvgReviews', maxAvgRatings: 'maxAvgReviews',
  minWeight: 'minAvgWeight', maxWeight: 'maxAvgWeight',
  minVolume: 'minAvgVolume', maxVolume: 'maxAvgVolume',
  minTopAvgUnits: 'minHeadListingAvgSales', maxTopAvgUnits: 'maxHeadListingAvgSales',
  minTopAvgRevenue: 'minHeadListingAvgRevenue', maxTopAvgRevenue: 'maxHeadListingAvgRevenue',
  minTopAvgBsr: 'minHeadListingAvgBsr', maxTopAvgBsr: 'maxHeadListingAvgBsr',
  minGoodsCount: 'minTotalProducts', maxGoodsCount: 'maxTotalProducts',
  minGoodsCrn: 'minHeadListingProductCrn', maxGoodsCrn: 'maxHeadListingProductCrn',
  minBrandCrn: 'minHeadListingBrandCrn', maxBrandCrn: 'maxHeadListingBrandCrn',
  minSellerCrn: 'minHeadListingSellerCrn', maxSellerCrn: 'maxHeadListingSellerCrn',
  minEbcProportion: 'minEbcRatio', maxEbcProportion: 'maxEbcRatio',
  minFbaProportion: 'minFbaRatio', maxFbaProportion: 'maxFbaRatio',
  minFbmProportion: 'minFbmRatio', maxFbmProportion: 'maxFbmRatio',
  minAmazonSelfProportion: 'minAmzRatio', maxAmazonSelfProportion: 'maxAmzRatio',
  minNewProportion: 'minNewRatio', maxNewProportion: 'maxNewRatio',
  minNewAvgRatings: 'minNewAvgReviews', maxNewAvgRatings: 'maxNewAvgReviews',
  minNewAvgUnits: 'minNewAvgSales', maxNewAvgUnits: 'maxNewAvgSales'
};

// 每页条数仅支持 20/50/100，默认 50
const PAGE_SIZES = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 50;

// 官方维度筛选参数（存在即透传，参数名与官方一致）
const FILTER_PARAMS = [
  'minAvgUnits', 'maxAvgUnits',
  'minAvgRevenue', 'maxAvgRevenue',
  'minAvgRatings', 'maxAvgRatings',
  'minAvgRating', 'maxAvgRating',
  'minAvgBsr', 'maxAvgBsr',
  'minAvgPrice', 'maxAvgPrice',
  'minWeight', 'maxWeight',
  'minVolume', 'maxVolume',
  'minAvgProfit', 'maxAvgProfit',
  'minTopAvgUnits', 'maxTopAvgUnits',
  'minTopAvgRevenue', 'maxTopAvgRevenue',
  'minTopAvgBsr', 'maxTopAvgBsr',
  'minGoodsCount', 'maxGoodsCount',
  'minBrands', 'maxBrands',
  'minSellers', 'maxSellers',
  'minAvgSellers', 'maxAvgSellers',
  'minGoodsCrn', 'maxGoodsCrn',
  'minBrandCrn', 'maxBrandCrn',
  'minSellerCrn', 'maxSellerCrn',
  'minEbcProportion', 'maxEbcProportion',
  'minFbaProportion', 'maxFbaProportion',
  'minFbmProportion', 'maxFbmProportion',
  'minAmazonSelfProportion', 'maxAmazonSelfProportion',
  'minNewProportion', 'maxNewProportion',
  'minNewCount', 'maxNewCount',
  'minNewAvgRatings', 'maxNewAvgRatings',
  'minNewAvgPrice', 'maxNewAvgPrice',
  'minNewAvgRating', 'maxNewAvgRating',
  'minNewAvgUnits', 'maxNewAvgUnits',
  'minNewAvgRevenue', 'maxNewAvgRevenue'
];

module.exports = {
  name: 'market_research',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const marketplace = String(args.marketplace);
    const marketId = resolveToolMarketId('market_research', marketplace);
    const month = args.month != null && args.month !== '' ? assertMonth(args.month) : '';
    const orderField = args.order && args.order.field ? String(args.order.field) : (args.orderField || 'total_sales');
    const orderDesc = args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false);

    const size = args.size == null || args.size === '' ? DEFAULT_PAGE_SIZE : Number(args.size);
    if (!PAGE_SIZES.includes(size)) {
      const err = new Error(`size must be one of: ${PAGE_SIZES.join(', ')}`);
      err.code = -32602;
      throw err;
    }

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      marketId,
      nodeIdPath: args.nodeIdPath ? String(args.nodeIdPath) : '',
      sampleNumber: 1,
      topn: Number(args.topNum) || 10,
      newReleaseNum: Number(args.newProduct) || 3,
      departmentKeyword: args.departmentKeyword ? String(args.departmentKeyword) : '',
      'order.field': orderField,
      'order.desc': orderDesc ? 'true' : 'false',
      sellerNations: args.sellerLocation ? String(args.sellerLocation) : '',
      page: (args.page && !isNaN(Number(args.page))) ? Number(args.page) : 1,
      size,
      // 不传 month 时官方口径为“最近30天”，对应上游 bsr_sales_nearly
      monthName: month ? `bsr_sales_monthly_${month}` : 'bsr_sales_nearly'
    };

    // 官方维度筛选参数：按上游表单参数名映射后加入
    for (const key of FILTER_PARAMS) {
      const value = args[key];
      if (value == null || value === '') continue;
      params[FIELD_ALIAS[key] || key] = value;
    }

    const data = await queryMarketResearch(user, params);
    return buildSuccess(args, data);
  }
};
