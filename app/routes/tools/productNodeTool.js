const { queryProductNode } = require('../../services/queries/productNodeQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  // 查产品类目
  name: 'product_node',

  async handle(args, user) {
    if (args.marketplace == null) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const data = await queryProductNode(user, {
      marketplace: String(args.marketplace.toUpperCase()),
      nodeIdPath: args.nodeIdPath != null ? String(args.nodeIdPath) : '',
      keyword: args.keyword != null ? String(args.keyword) : ''
    });

    return buildSuccess(args, data);
  }
};
