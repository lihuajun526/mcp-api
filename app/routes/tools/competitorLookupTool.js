const { queryCompetingLookup } = require('../../services/queries/competitorLookupQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  // 查竞品
  name: 'competitor_lookup',

  async handle(args, user) {
    if (args.marketplace == null) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    if (args.month != null) {
      const monthStr = String(args.month);
      const parsed = new Date(monthStr.substring(0, 4), parseInt(monthStr.substring(4, 6), 10) - 1);
      if (!/^\d{6}$/.test(monthStr) || isNaN(parsed.getTime())) {
        const err = new Error('month must be a valid date in yyyyMM format');
        err.code = -32602;
        throw err;
      }
    }

    const data = await queryCompetingLookup(user, {
      market: String(args.marketplace.toUpperCase()),
      monthName: args.month ? 'bsr_sales_monthly_' + args.month : 'bsr_sales_nearly',
      asins: Array.isArray(args.asins) ? args.asins.map((a) => String(a)) : [],
      ...(args.brand ? { includeBrands: String(args.brand) } : {}),
      ...(args.sellerName ? { includeSellers: String(args.sellerName) } : {}),
      nodeIdPaths: args.nodeIdPath ? [args.nodeIdPath] : [],
      ...(args.nodeIdPathEqual !== undefined ? { nodeIdPathEqual: !!args.nodeIdPathEqual } : {}),
      ...(args.keyword ? { keywords: String(args.keyword) } : {}),
      ...(args.matchType !== undefined ? { matchType: Number(args.matchType) } : {}),
      symbolFlag: args.variation != null ? !args.variation : false,
      lowPrice: "N",
      page: args.page ? Number(args.page) : 1,
      size: args.size ? Number(args.size) : 60,
      order: {
        field: args.order && args.order.field ? String(args.order.field) : 'amz_unit',
        desc: args.order && args.order.desc !== undefined ? !!args.order.desc : true
      }
    });

    return buildSuccess(args, data);
  }
};
