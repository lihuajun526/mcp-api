const { queryBsrSales } = require('../../services/queries/bsrSalesQuery');

module.exports = {
  name: 'bsr_sales',

  async handle(args, user) {
    if (!args.marketplace || !args.categoryId || !args.bsr) {
      const err = new Error('marketplace, categoryId, and bsr are required');
      err.code = -32602;
      throw err;
    }

    const detail = await queryBsrSales(user, {
      marketplace: String(args.marketplace),
      categoryId: String(args.categoryId),
      bsr: Number(args.bsr)
    });

    return {
      code: "OK",
      message: "成功",
      data: detail
    };
  }
};
