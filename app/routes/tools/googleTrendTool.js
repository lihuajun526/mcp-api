const { queryGoogleTrend } = require('../../services/queries/googleTrendQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'google_trend',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const data = await queryGoogleTrend(user, {
      marketplace: String(args.marketplace),
      keyword: args.keyword ? String(args.keyword) : '',
      googleProp: args.googleProp ? String(args.googleProp) : 'web',
      monthly: args.monthly === true || args.monthly === 'true'
    });

    return buildSuccess(args, data);
  }
};
