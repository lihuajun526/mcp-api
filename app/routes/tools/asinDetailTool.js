const { queryAsinDetail } = require('../../services/queries/asinDetailQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertToolMarketplace } = require('../../utils/validation');
const { NotFoundError } = require('../../errors');

module.exports = {
  name: 'asin_detail',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertToolMarketplace('asin_detail', args.marketplace);

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
    if (!detail || !detail.asin) {
      throw new NotFoundError(`ASIN ${args.asin} not found on marketplace ${marketplace}`, {
        hint: '请确认 ASIN 和站点是否正确，该商品可能未被收录'
      });
    }
    return buildSuccess(args, detail);
  }
};
