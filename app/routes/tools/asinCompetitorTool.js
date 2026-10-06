const { queryAsinCompetitor } = require('../../services/queries/asinCompetitorQuery');
const { buildSuccess } = require('../../toolResponse');
const { isEmpty } = require('../../utils/stringUtils');
const { assertToolMarketplace, resolveToolPageSize } = require('../../utils/validation');

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

    // size：可选 20/60/100，默认 60（与 tools.json schema 的 enum/default 保持一致）
    const size = resolveToolPageSize('asin_competitor', args.size);

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      market: marketplace, // 上游字段名为 market
      monthName: 'bsr_sales_nearly',
      asins: [String(args.asin)],
      page: 1,
      size,
      symbolFlag: false,
      nodeIdPaths: [],
      order: { field: 'total_units', desc: true },
      lowPrice: 'N'
    };

    const data = await queryAsinCompetitor(user, params);
    return buildSuccess(args, data);
  }
};
