/**
 * 查询当前用户额度。
 * 直接复用鉴权阶段已加载的账户数据（sdx_user_account.credits / rate_limit_qpm），
 * 不查上游、不写调用记录、不扣积分——额度查询本身不应消耗额度。
 */
function queryUserQuota(user) {
    return {
        credits: Number(user.points || 0),
        rateLimitQpm: Number(user.qpsLimit || 0)
    };
}

module.exports = { queryUserQuota };
