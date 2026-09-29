const { queryProductNode } = require('../../services/queries/productNodeQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertMonth } = require('../../utils/validation');

module.exports = {
  // 查产品类目
  name: 'product_node',

  async handle(args, user) {
    if (args.marketplace == null) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const month = args.month != null && args.month !== '' ? assertMonth(args.month) : null;

    const data = await queryProductNode(user, {
      marketplace: String(args.marketplace.toUpperCase()),
      nodeIdPath: args.nodeIdPath != null ? String(args.nodeIdPath) : '',
      keyword: args.keyword != null ? String(args.keyword) : '',
      month
    });

    return buildSuccess(args, data);
  }
};
