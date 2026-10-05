const { queryAsinSalesTrend } = require('../../services/queries/asinSalesTrendQuery');
const { buildSuccess } = require('../../toolResponse');
const { resolveToolMarketId } = require('../../utils/validation');

module.exports = {
  name: 'asin_sales_trend',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = String(args.marketplace).trim().toUpperCase();
    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      asin: String(args.asin),
      marketId: resolveToolMarketId('asin_sales_trend', marketplace)
    };

    const data = await queryAsinSalesTrend(user, params);
    return buildSuccess(args, data);
  }
};
