const { queryTrafficKeywordStat } = require('../../services/queries/trafficKeywordStatQuery');
const { assertMonth, MARKET_ID_MAP } = require('../../utils/validation');
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

    const marketplace = String(args.marketplace);
    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      asin: String(args.asin),
      marketId: MARKET_ID_MAP[marketplace] || 1,
      month: args.month != null && args.month !== '' ? assertMonth(args.month) : '',
      forceReStat: false,
      badges: [],
      limit: 50
    };

    const data = await queryTrafficKeywordStat(user, params);
    return buildSuccess(args, data);
  }
};
