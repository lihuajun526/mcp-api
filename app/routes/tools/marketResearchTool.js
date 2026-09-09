const { queryMarketResearch } = require('../../services/queries/marketResearchQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'market_research',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const data = await queryMarketResearch(user, {
      marketplace: String(args.marketplace),
      nodeIdPath: args.nodeIdPath ? String(args.nodeIdPath) : '',
      departmentKeyword: args.departmentKeyword ? String(args.departmentKeyword) : '',
      topNum: Number(args.topNum) || 10,
      newProduct: Number(args.newProduct) || 6,
      sellerLocation: args.sellerLocation ? String(args.sellerLocation) : '',
      orderField: args.order && args.order.field ? String(args.order.field) : (args.orderField || 'total_sales'),
      orderDesc: args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false),
      page: Number(args.page) || 1,
      size: Number(args.size) || 20,
      // 可选筛选参数 (HTML 表单参数名)
      minAvgSales: args.minAvgUnits,
      maxAvgSales: args.maxAvgUnits,
      minAvgBsr: args.minAvgBsr,
      maxAvgBsr: args.maxAvgBsr,
      minAvgWeight: args.minWeight,
      maxAvgWeight: args.maxWeight,
      minHeadListingAvgBsr: args.minTopAvgBsr,
      maxHeadListingAvgBsr: args.maxTopAvgBsr,
      minTotalProducts: args.minGoodsCount,
      maxTotalProducts: args.maxGoodsCount,
      minAvgRevenue: args.minAvgRevenue,
      maxAvgRevenue: args.maxAvgRevenue,
      minAvgPrice: args.minAvgPrice,
      maxAvgPrice: args.maxAvgPrice
    });

    return buildSuccess(args, data);
  }
};
