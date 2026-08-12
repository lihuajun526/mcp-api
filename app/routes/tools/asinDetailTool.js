const { queryAsinDetail } = require('../../services/queries/asinDetailQuery');

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

    return {
      isError: false,
      structuredContent: detail,
      content: [{ type: 'text', text: 'asin_detail_lookup success' }]
    };
  }
};
