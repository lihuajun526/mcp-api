const { queryBsrSales } = require('../../services/queries/bsrSalesQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'bsr_prediction',

  async handle(args, user) {
    if (!args.marketplace || !args.categoryId || !args.bsr) {
      const err = new Error('marketplace, categoryId, and bsr are required');
      err.code = -32602;
      throw err;
    }

    const params = {
      marketplace: String(args.marketplace), // 供 transformer 使用，不发往上游
      station: String(args.marketplace),
      cid: String(args.categoryId),
      bsr: Number(args.bsr)
    };

    const detail = await queryBsrSales(user, params);
    return buildSuccess(args, detail);
  }
};
