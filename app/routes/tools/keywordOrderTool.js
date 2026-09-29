const { queryKeywordOrder } = require('../../services/queries/keywordOrderQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'keyword_order',

  async handle(args, user) {
    // 官方 reverseType 必填（W=周 / M=月）
    if (!args.marketplace || !args.asins || !args.reverseType ||
        (Array.isArray(args.asins) && args.asins.length === 0)) {
      const err = new Error('marketplace, asins and reverseType are required');
      err.code = -32602;
      throw err;
    }

    const asins = Array.isArray(args.asins)
      ? args.asins.map(String)
      : [String(args.asins)];

    // 官方 variation 为 List；兼容字符串写法
    const variation = Array.isArray(args.variation) ? args.variation[0] : args.variation;

    // 官方排序参数为对象 order { field, desc }，兼容历史平铺写法 orderField/orderDesc
    const orderField = (args.order && args.order.field) || args.orderField;
    const orderDesc = args.order && args.order.desc != null ? args.order.desc : args.orderDesc;

    const data = await queryKeywordOrder(user, {
      marketplace: String(args.marketplace),
      asins,
      reverseType: String(args.reverseType),
      date: args.date ? String(args.date) : '',
      conversionType: Array.isArray(args.conversionType)
        ? args.conversionType
        : (args.conversionType ? [String(args.conversionType)] : []),
      variation: variation ? String(variation) : 'Y',
      page: args.page,
      size: args.size,
      orderField,
      orderDesc
    });

    return buildSuccess(args, data);
  }
};
