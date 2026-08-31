const { queryAsinSalesTrend } = require('../../services/queries/asinSalesTrendQuery');

module.exports = {
  name: 'asin_sales_trend',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const data = await queryAsinSalesTrend(user, {
      marketplace: String(args.marketplace),
      asin: String(args.asin)
    });

    return {
      isError: false,
      structuredContent: data,
      content: [{ type: 'text', text: `asin_sales_trend success, asin=${args.asin}, points=${data.salesTrendPoints ? data.salesTrendPoints.length : 0}` }]
    };
  }
};
