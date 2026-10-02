const { queryTrafficKeywordStat } = require('../../services/queries/trafficKeywordStatQuery');
const { assertMonth } = require('../../utils/validation');
const { buildSuccess } = require('../../toolResponse');

// marketplace 公开代码 → marketId (整数)
const MARKET_ID_MAP = {
  US: 1, UK: 2, DE: 3, FR: 4, ES: 5, IT: 6,
  JP: 7, CA: 8, MX: 9, AU: 13, IN: 14
};

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
      forceReStat: args.forceReStat === true,
      badges: Array.isArray(args.badges) ? args.badges : [],
      limit: Number(args.limit) || 50
    };

    const data = await queryTrafficKeywordStat(user, params);
    return buildSuccess(args, data);
  }
};
