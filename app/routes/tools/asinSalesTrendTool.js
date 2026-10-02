const { queryAsinSalesTrend } = require('../../services/queries/asinSalesTrendQuery');
const { buildSuccess } = require('../../toolResponse');

// marketplace 公开代码 → marketId (整数)
const MARKET_ID_MAP = {
  US: 1, DE: 4, UK: 3, JP: 6, FR: 5, IT: 35691, ES: 44551,
  CA: 7, IN: 44571, MX: 771770
};

module.exports = {
  name: 'asin_sales_trend',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = String(args.marketplace);
    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      asin: String(args.asin),
      marketId: MARKET_ID_MAP[marketplace] || 1
    };

    const data = await queryAsinSalesTrend(user, params);
    return buildSuccess(args, data);
  }
};
