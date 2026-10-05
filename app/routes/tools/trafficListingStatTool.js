const { queryTrafficListingStat } = require('../../services/queries/trafficListingStatQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertToolMarketplace } = require('../../utils/validation');

// marketplace 公开代码 → station 代码 (US→COM)
const MARKET_STATION_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU', BR: 'BR'
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

    const marketplace = assertToolMarketplace('traffic_listing_stat', args.marketplace);
    const asinList = Array.isArray(args.asinList) ? args.asinList : [String(args.asinList)];
    if (asinList.length > 20) {
      const err = new Error('asinList supports at most 20 ASINs');
      err.code = -32602;
      throw err;
    }

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      asinList,
      station: MARKET_STATION_MAP[marketplace] || marketplace,
      queryVariations: true
    };

    const data = await queryTrafficListingStat(user, params);
    return buildSuccess(args, data);
  }
};
