const { queryProductNode } = require('../../services/queries/productNodeQuery');

module.exports = {
  name: 'product_node',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const data = await queryProductNode(user, {
      marketplace: String(args.marketplace),
      nodeIdPath: args.nodeIdPath ? String(args.nodeIdPath) : '',
      keyword: args.keyword ? String(args.keyword) : '',
      month: args.month ? String(args.month) : ''
    });

    return {
      code: 'OK',
      message: '成功',
      data
    };
  }
};
