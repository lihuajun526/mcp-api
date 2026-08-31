const { queryCompetingLookup } = require('../../services/queries/competitorLookupQuery');

module.exports = {
  name: 'competitor_lookup',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const data = await queryCompetingLookup(user, {
      marketplace: String(args.marketplace),
      month: args.month ? String(args.month) : undefined,
      keyword: args.keyword ? String(args.keyword) : undefined,
      brand: args.brand ? String(args.brand) : undefined,
      sellerName: args.sellerName ? String(args.sellerName) : undefined,
      asins: Array.isArray(args.asins) ? args.asins.map((a) => String(a)) : undefined,
      nodeIdPath: args.nodeIdPath ? String(args.nodeIdPath) : undefined,
      nodeIdPathEqual: args.nodeIdPathEqual !== undefined ? !!args.nodeIdPathEqual : undefined,
      matchType: args.matchType !== undefined ? Number(args.matchType) : undefined,
      variation: args.variation ? String(args.variation) : undefined,
      page: args.page ? Number(args.page) : 1,
      size: args.size ? Number(args.size) : 50,
      orderField: args.order && args.order.field ? String(args.order.field) : (args.orderField || 'total_units'),
      orderDesc: args.order && args.order.desc !== undefined ? !!args.order.desc : (args.orderDesc !== undefined ? !!args.orderDesc : true)
    });

    return {
      isError: false,
      structuredContent: data,
      content: [{ type: 'text', text: `competitor_lookup success, total=${data.total}` }]
    };
  }
};
