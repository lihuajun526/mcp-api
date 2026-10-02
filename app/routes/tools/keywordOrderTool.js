const { queryKeywordOrder } = require('../../services/queries/keywordOrderQuery');
const { buildSuccess } = require('../../toolResponse');
const { BusinessError } = require('../../errors');

// marketplace 公开代码 → station 代码 (出单词反查页面使用公开站点代码)
const MARKET_STATION_MAP = {
  US: 'US', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

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

    if (asins.length > 20) {
      throw new BusinessError('asins 最多支持 20 个', 400);
    }

    // 官方 variation 为 List；兼容字符串写法
    const variation = Array.isArray(args.variation) ? args.variation[0] : args.variation;

    // 官方排序参数为对象 order { field, desc }，兼容历史平铺写法 orderField/orderDesc
    const orderField = (args.order && args.order.field) || args.orderField;
    const orderDesc = args.order && args.order.desc != null ? args.order.desc : args.orderDesc;

    const station = MARKET_STATION_MAP[String(args.marketplace)] || String(args.marketplace);
    const reverseType = String(args.reverseType);
    const date = args.date ? String(args.date) : '';

    // 根据 reverseType 和 date 构造表名
    let table = '';
    let monthlyTable = '';
    if (reverseType === 'W' && date) {
      table = `ara_${date}`;
    } else if (reverseType === 'M' && date) {
      monthlyTable = `ara_${date}`;
    }

    const variationStr = variation ? String(variation) : 'Y';
    const conversionType = Array.isArray(args.conversionType)
      ? args.conversionType.join(',')
      : (args.conversionType ? String(args.conversionType) : '');

    const params = {
      marketplace: String(args.marketplace), // 供 transformer 使用，不发往上游
      station,
      table,
      monthlyTable,
      asin: '',
      'order.field': orderField || 'searchRank',
      'order.desc': orderDesc != null ? String(orderDesc) : 'false',
      conversionType,
      loadVariations: variationStr === 'N' ? 'true' : 'false',
      reverseType,
      textareaValue: asins.join(','),
      page: Math.max(Number(args.page) || 1, 1)
    };

    const data = await queryKeywordOrder(user, params);
    return buildSuccess(args, data);
  }
};
