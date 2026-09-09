const { queryAsinSalesTrend } = require('../../services/queries/asinSalesTrendQuery');
const { buildSuccess } = require('../../toolResponse');

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

    return buildSuccess(args, data);
  }
};
