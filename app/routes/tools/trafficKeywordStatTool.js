const { queryTrafficKeywordStat } = require('../../services/queries/trafficKeywordStatQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'traffic_keyword_stat',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }
    if (!args.asin) {
      const err = new Error('asin is required');
      err.code = -32602;
      throw err;
    }

    const data = await queryTrafficKeywordStat(user, {
      marketplace: String(args.marketplace),
      asin: String(args.asin),
      month: args.month ? String(args.month) : '',
      forceReStat: args.forceReStat === true,
      badges: Array.isArray(args.badges) ? args.badges : []
    });

    return buildSuccess(args, data);
  }
};
