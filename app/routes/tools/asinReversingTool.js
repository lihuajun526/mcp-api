const { queryAsinReversing } = require('../../services/queries/asinReversingQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'traffic_keyword',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const data = await queryAsinReversing(user, {
      marketplace: String(args.marketplace),
      asin: String(args.asin),
      keyword: args.keyword,
      page: args.page,
      size: args.size,
      month: args.month,
      badges: args.badges,
      trafficKeywordTypes: args.trafficKeywordTypes,
      conversionKeywordTypes: args.conversionKeywordTypes,
      order: args.order
    });

    return buildSuccess(args, data);
  }
};
