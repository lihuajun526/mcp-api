const { queryAsinPrediction } = require('../../services/queries/asinPredictionQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertToolMarketplace } = require('../../utils/validation');
const { NotFoundError } = require('../../errors');

module.exports = {
  name: 'asin_prediction',

  async handle(args, user) {
    if (!args.marketplace || !args.asin) {
      const err = new Error('marketplace and asin are required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertToolMarketplace('asin_prediction', args.marketplace);

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      station: marketplace,
      asin: String(args.asin)
    };

    const detail = await queryAsinPrediction(user, params);
    if (!detail || (!detail.asinDetail.title && detail.dailyItemList.length === 0)) {
      throw new NotFoundError(`ASIN ${args.asin} not found on marketplace ${marketplace}`, {
        hint: '请确认 ASIN 和站点是否正确，该商品可能未被收录'
      });
    }
    return buildSuccess(args, detail);
  }
};
