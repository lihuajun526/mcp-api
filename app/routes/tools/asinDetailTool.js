const { queryAsinDetail } = require('../../services/queries/asinDetailQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'asin_detail_lookup',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const detail = await queryAsinDetail(user, {
      marketplace: String(args.marketplace),
      asin: String(args.asin)
    });

    return buildSuccess(args, detail);
  }
};
