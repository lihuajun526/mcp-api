const { queryAsinDetail } = require('../../services/queries/asinDetailQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'asin_detail',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = String(args.marketplace);

    const params = {
      marketplace, // 供后处理使用，不发往上游
      market: marketplace,
      monthName: 'bsr_sales_nearly',
      asins: [String(args.asin)],
      page: 1,
      size: 20,
      symbolFlag: true,
      nodeIdPaths: [],
      order: { field: 'total_units', desc: true },
      lowPrice: 'N'
    };

    const detail = await queryAsinDetail(user, params);
    return buildSuccess(args, detail);
  }
};
