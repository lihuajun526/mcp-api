const { queryTrafficListing } = require('../../services/queries/trafficListingQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'traffic_listing',

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
    if (!args.relations) {
      const err = new Error('relations is required');
      err.code = -32602;
      throw err;
    }

    const data = await queryTrafficListing(user, {
      marketplace: String(args.marketplace),
      asinList: Array.isArray(args.asinList) ? args.asinList : [String(args.asinList)],
      relations: Array.isArray(args.relations) ? args.relations : [String(args.relations)],
      variations: args.variations === true,
      page: Number(args.page) || 1,
      size: Number(args.size) || 50,
      orderField: args.order && args.order.field ? String(args.order.field) : (args.orderField ? String(args.orderField) : 'createdTime'),
      orderDesc: args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false)
    });

    return buildSuccess(args, data);
  }
};
