const { queryTrafficListing } = require('../../services/queries/trafficListingQuery');
const { buildSuccess } = require('../../toolResponse');
const { BusinessError } = require('../../errors');

// marketplace 公开代码 → marketId (整数)
const MARKET_ID_MAP = {
  US: 1, UK: 2, DE: 3, FR: 4, ES: 5, IT: 6,
  JP: 7, CA: 8, MX: 9, AU: 13, IN: 14
};

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

    const asinList = Array.isArray(args.asinList) ? args.asinList : [String(args.asinList)];
    if (asinList.length > 20) {
      throw new BusinessError('单次查询 ASIN 数量不能超过 20 个', 400);
    }

    const marketplace = String(args.marketplace);
    const orderField = args.order && args.order.field ? String(args.order.field) : (args.orderField ? String(args.orderField) : 'createdTime');
    const orderDesc = args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false);

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      market: MARKET_ID_MAP[marketplace] || 1,
      pageNum: (args.page && !isNaN(Number(args.page))) ? Number(args.page) : 1,
      pageSize: (args.size && !isNaN(Number(args.size))) ? Number(args.size) : 50,
      desc: orderDesc,
      orderField,
      relations: Array.isArray(args.relations) ? args.relations : [String(args.relations)],
      queryVariations: args.variations === true,
      asinList
    };

    const data = await queryTrafficListing(user, params);
    return buildSuccess(args, data);
  }
};
