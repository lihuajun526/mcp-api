const { queryCategoryFirst } = require('../../services/queries/categoryFirstQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertToolMarketplace } = require('../../utils/validation');

module.exports = {
  // 获取站点一级类目
  name: 'first_category',

  async handle(args, user) {
    if (args.marketplace == null) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertToolMarketplace('first_category', args.marketplace);
    const data = await queryCategoryFirst(user, { marketplace });

    return buildSuccess(args, data);
  }
};
