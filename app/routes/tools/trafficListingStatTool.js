const { queryTrafficListingStat } = require('../../services/queries/trafficListingStatQuery');

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

    const data = await queryTrafficListingStat(user, {
      marketplace: String(args.marketplace),
      asinList: Array.isArray(args.asinList) ? args.asinList : [String(args.asinList)],
      queryVariations: args.queryVariations !== false
    });

    return {
      code: 'OK',
      message: '成功',
      data
    };
  }
};
