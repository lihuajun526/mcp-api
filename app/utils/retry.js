const { UpstreamError } = require('../errors');

/**
 * 对 fn 执行最多 maxRetries 次重试，仅在 UpstreamError（上游网络/业务错误）时重试。
 *
 * 使用方式：在 query 层将 pickSession + fetch 包进 fn，
 * 每次重试都会重新调用 pickSession，利用 Redis 游标轮询切换到下一个上游会话，
 * 从而避免单个会话失效导致整条链路失败。
 *
 * 不重试的场景：
 * - BusinessError（如"未找到可用会话"、参数校验错误）—— 重试无意义
 * - 其它非 UpstreamError 错误（编程错误等）—— 直接抛出
 *
 * @param {() => Promise<any>} fn      每次尝试执行的异步函数
 * @param {number}             maxRetries  最大重试次数（默认 3，即最多 4 次尝试）
 * @returns {Promise<any>}
 */
async function retryOnUpstreamError(fn, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof UpstreamError && attempt < maxRetries) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

module.exports = { retryOnUpstreamError };
