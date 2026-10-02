const { queryGoogleTrend } = require('../../services/queries/googleTrendQuery');
const { buildSuccess } = require('../../toolResponse');

// marketplace 公开代码 → 第三方 station 代码 (US→COM)
const MARKET_CODE_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

module.exports = {
  name: 'google_trend',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const marketplace = String(args.marketplace);
    const station = MARKET_CODE_MAP[marketplace] || marketplace;
    // gprop: '' = 网页搜索, 'froogle' = 购物搜索
    const gprop = args.googleProp === 'shoppingCart' ? 'froogle' : '';
    const intervalYear = Number(args.intervalYear) || 5;
    const monthly = args.monthly === true || args.monthly === 'true';

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      gprop,
      intervalYear,
      gv: false,
      monthly,
      parentModule: ' ',
      dynamic: ' ',
      station,
      keyword: args.keyword ? String(args.keyword) : ''
    };

    const data = await queryGoogleTrend(user, params);
    return buildSuccess(args, data);
  }
};
