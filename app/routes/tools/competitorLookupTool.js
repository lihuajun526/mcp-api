const { queryCompetingLookup } = require('../../services/queries/competitorLookupQuery');
const { buildSuccess } = require('../../toolResponse');
const { BusinessError } = require('../../errors');
const {
  assertToolMarketplace,
  assertMonth,
  resolveToolPageSize,
  assertMatchType,
  toSymbolFlag,
  toStringArray
} = require('../../utils/validation');

module.exports = {
  // 查竞品
  name: 'competitor_lookup',

  async handle(args, user) {
    if (args.marketplace == null) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertToolMarketplace('competitor_lookup', args.marketplace);
    const month = args.month != null && args.month !== '' ? assertMonth(args.month) : null;
    const size = resolveToolPageSize('competitor_lookup', args.size);
    const matchType = assertMatchType(args.matchType);
    const asins = toStringArray(args.asins);

    if (asins.length > 40) {
      throw new BusinessError('单次查询ASIN数量不能超过40个', 400);
    }

    const data = await queryCompetingLookup(user, {
      market: marketplace,
      monthName: month ? 'bsr_sales_monthly_' + month : 'bsr_sales_nearly',
      asins,
      ...(args.brand ? { includeBrands: String(args.brand) } : {}),
      ...(args.sellerName ? { includeSellers: String(args.sellerName) } : {}),
      nodeIdPaths: args.nodeIdPath ? [args.nodeIdPath] : [],
      //...(args.nodeIdPathEqual !== undefined ? { nodeIdPathEqual: !!args.nodeIdPathEqual } : {}),
      ...(args.keyword ? { keywords: String(args.keyword) } : {}),
      //...(matchType != null ? { matchType } : {}),
      symbolFlag: toSymbolFlag(args.variation),
      lowPrice: "N",
      page: (args.page && !isNaN(Number(args.page))) ? Number(args.page) : 1,
      size,
      order: {
        field: args.order && args.order.field ? String(args.order.field) : 'total_units',
        desc: args.order && args.order.desc !== undefined ? !!args.order.desc : true
      }
    });

    return buildSuccess(args, data);
  }
};
