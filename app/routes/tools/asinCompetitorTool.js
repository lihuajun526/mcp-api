const { queryAsinCompetitor } = require('../../services/queries/asinCompetitorQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'asin_competitor',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const data = await queryAsinCompetitor(user, {
      marketplace: String(args.marketplace),
      asin: String(args.asin),
      size: args.size ? Number(args.size) : 20
    });

    return buildSuccess(args, data);
  }
};
