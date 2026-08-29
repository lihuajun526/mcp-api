const { queryKeywordOrder } = require('../../services/queries/keywordOrderQuery');

module.exports = {
  name: 'keyword_order',

  async handle(args, user) {
    if (!args.marketplace || !args.asins ||
        (Array.isArray(args.asins) && args.asins.length === 0)) {
      const err = new Error('marketplace and asins are required');
      err.code = -32602;
      throw err;
    }

    const asins = Array.isArray(args.asins)
      ? args.asins.map(String)
      : [String(args.asins)];

    const data = await queryKeywordOrder(user, {
      marketplace: String(args.marketplace),
      asins,
      reverseType: args.reverseType ? String(args.reverseType) : 'W',
      date: args.date ? String(args.date) : '',
      conversionType: args.conversionType || [],
      variation: args.variation ? String(args.variation) : 'Y',
      page: args.page,
      size: args.size,
      orderField: args.orderField,
      orderDesc: args.orderDesc
    });

    return {
      code: 'OK',
      message: '成功',
      data
    };
  }
};
