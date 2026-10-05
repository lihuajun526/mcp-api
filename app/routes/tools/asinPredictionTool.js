const { queryAsinPrediction } = require('../../services/queries/asinPredictionQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertToolMarketplace } = require('../../utils/validation');

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
    return buildSuccess(args, detail);
  }
};
