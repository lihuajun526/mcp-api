const { queryAsinReversing } = require('../../services/queries/asinReversingQuery');

module.exports = {
  name: 'asin_reversing',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const data = await queryAsinReversing(user, {
      marketplace: String(args.marketplace),
      asin: String(args.asin),
      page: args.page,
      size: args.size,
      month: args.month,
      badges: args.badges
    });

    return {
      code: "OK",
      message: "成功",
      data
    };
  }
};
