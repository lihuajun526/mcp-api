const { queryCompetingLookup } = require('../../services/queries/competitorLookupQuery');

module.exports = {
  name: 'competitor_lookup',

  async handle(args, user) {
    if (!args.marketplace || !args.asins || !Array.isArray(args.asins) || !args.asins.length) {
      const err = new Error('marketplace and asins (array) are required');
      err.code = -32602;
      throw err;
    }

    const data = await queryCompetingLookup(user, {
      marketplace: String(args.marketplace),
      asins: args.asins.map((a) => String(a)),
      page: args.page ? Number(args.page) : 1,
      size: args.size ? Number(args.size) : 60,
      orderField: args.orderField || 'amz_unit',
      orderDesc: args.orderDesc !== undefined ? !!args.orderDesc : true
    });

    return {
      isError: false,
      structuredContent: data,
      content: [{ type: 'text', text: `competitor_lookup success, total=${data.total}` }]
    };
  }
};
