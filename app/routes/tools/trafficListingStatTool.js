const { queryTrafficListingStat } = require('../../services/queries/trafficListingStatQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertToolMarketplace, toMarketCode } = require('../../utils/marketplace');

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
      station: toMarketCode(marketplace),
      queryVariations: true
    };

    const data = await queryTrafficListingStat(user, params);
    return buildSuccess(args, data);
  }
};
