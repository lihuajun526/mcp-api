const { queryAsinCompetitor } = require('../../services/queries/asinCompetitorQuery');
const { buildSuccess } = require('../../toolResponse');
const { isEmpty } = require('../../utils/stringUtils');
const { assertToolMarketplace } = require('../../utils/validation');

module.exports = {
  // 查询ASIN竞品数据
  name: 'asin_competitor',

  async handle(args, user) {
    if (isEmpty(args.marketplace) || isEmpty(args.asin)) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertToolMarketplace('asin_competitor', args.marketplace);

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      market: marketplace, // 上游字段名为 market
      monthName: 'bsr_sales_nearly',
      asins: [String(args.asin)],
      page: 1,
      size: (args.size && !isNaN(Number(args.size))) ? Number(args.size) : 20,
      symbolFlag: false,
      nodeIdPaths: [],
      order: { field: 'total_units', desc: true },
      lowPrice: 'N'
    };

    const data = await queryAsinCompetitor(user, params);
    return buildSuccess(args, data);
  }
};
