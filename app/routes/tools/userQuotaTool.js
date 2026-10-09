const { queryUserQuota } = require('../../services/queries/userQuotaQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  // 查询当前用户剩余额度（积分）
  name: 'user_quota',

  async handle(args, user) {
    const data = queryUserQuota(user);
    return buildSuccess(args, data);
  }
};
