const { queryGoogleTrend } = require('../../services/queries/googleTrendQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertToolMarketplace, toMarketCode } = require('../../utils/marketplace');

module.exports = {
  name: 'google_trend',

  async handle(args, user) {
    if (!args.marketplace || !args.keyword) {
      const err = new Error('marketplace and keyword are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertToolMarketplace('google_trend', args.marketplace);
    // marketplace 公开代码 → 第三方 station 代码 (US→COM)
    const station = toMarketCode(marketplace);
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
