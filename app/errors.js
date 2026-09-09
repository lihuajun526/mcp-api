class BusinessError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'BusinessError';
    this.errorCode = 'BAD_REQUEST';
    this.status = status;
  }
}

/**
 * 上游（卖家精灵）接口调用错误。
 * 携带结构化信息，便于上层判断下一步处理方式：
 * - upstreamCode: 上游返回的业务错误码
 * - httpStatus:   上游 HTTP 状态码
 * - hint:         下一步处理建议（可透出给调用方/模型）
 * - url:          出错的上游接口地址
 */
class UpstreamError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'UpstreamError';
    this.errorCode = 'UPSTREAM_ERROR';
    this.upstreamCode = options.upstreamCode !== undefined ? options.upstreamCode : null;
    this.httpStatus = options.httpStatus !== undefined ? options.httpStatus : null;
    this.url = options.url || null;
    this.hint = options.hint || null;
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

module.exports = {
  BusinessError,
  UpstreamError
};
