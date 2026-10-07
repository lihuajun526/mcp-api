const { queryAsinSalesTrend } = require('../../services/queries/asinSalesTrendQuery');
const { buildSuccess } = require('../../toolResponse');
const { resolveToolMarketId } = require('../../utils/validation');
const { NotFoundError } = require('../../errors');

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
    if (!data || !data.asin || !data.asin.asin) {
      throw new NotFoundError(`ASIN ${args.asin} not found on marketplace ${marketplace}`, {
        hint: '请确认 ASIN 和站点是否正确，该商品可能未被收录'
      });
    }
    return buildSuccess(args, data);
  }
};
