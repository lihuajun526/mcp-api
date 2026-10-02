const { queryTrafficListingStat } = require('../../services/queries/trafficListingStatQuery');
const { buildSuccess } = require('../../toolResponse');

// marketplace 公开代码 → station 代码 (US→COM)
const MARKET_STATION_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

module.exports = {
  name: 'traffic_listing_stat',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }
    if (!args.asinList || (Array.isArray(args.asinList) && args.asinList.length === 0)) {
      const err = new Error('asinList is required');
      err.code = -32602;
      throw err;
    }

    const marketplace = String(args.marketplace);
    const asinList = Array.isArray(args.asinList) ? args.asinList : [String(args.asinList)];

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      asinList,
      station: MARKET_STATION_MAP[marketplace] || marketplace,
      queryVariations: args.queryVariations !== false
    };

    const data = await queryTrafficListingStat(user, params);
    return buildSuccess(args, data);
  }
};
