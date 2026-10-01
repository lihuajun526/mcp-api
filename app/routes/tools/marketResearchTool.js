const { queryMarketResearch } = require('../../services/queries/marketResearchQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertMonth } = require('../../utils/validation');

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

    const request = {
      marketplace: String(args.marketplace),
      nodeIdPath: args.nodeIdPath ? String(args.nodeIdPath) : '',
      departmentKeyword: args.departmentKeyword ? String(args.departmentKeyword) : '',
      month: args.month != null && args.month !== '' ? assertMonth(args.month) : '',
      topNum: Number(args.topNum) || 10,
      newProduct: Number(args.newProduct) || 3,
      sellerLocation: args.sellerLocation ? String(args.sellerLocation) : '',
      orderField: args.order && args.order.field ? String(args.order.field) : (args.orderField || 'total_sales'),
      orderDesc: args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false),
      page: (args.page && !isNaN(Number(args.page))) ? Number(args.page) : 1,
      size: (args.size && !isNaN(Number(args.size))) ? Number(args.size) : 50
    };

    // 官方维度筛选参数：存在即透传（参数名与官方一致）
    for (const key of FILTER_PARAMS) {
      if (args[key] != null && args[key] !== '') request[key] = args[key];
    }

    const data = await queryMarketResearch(user, request);

    return buildSuccess(args, data);
  }
};
