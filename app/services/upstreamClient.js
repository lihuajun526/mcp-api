const axios = require('axios');
const { UpstreamError } = require('../errors');

/**
 * 卖家精灵上游接口统一客户端。
 *
 * 职责：
 * 1. 统一封装网络层错误（超时 / 断网 / HTTP 非 2xx）为 UpstreamError；
 * 2. 校验上游响应包裹 {code, message, data}：
 *    - 成功码：0 / 200 / "OK" / "SUCCESS"（Web 端通道为字符串码）；
 *    - 其余 code 视为业务错误，抛出 UpstreamError（含上游 message 与处理建议）；
 *    - code 为 0 但 data 为 null/undefined（常见于查询配额耗尽、会话权限不足）同样抛错，
 *      避免静默返回空结果；
 * 3. 每个错误都带 hint（下一步处理建议），上层可直接透出给调用方。
 *
 * 用法（替代直接使用 axios）：
 *   const data = await upstreamClient.post(url, payload, { headers, timeout });
 *   const data = await upstreamClient.get(url, { params, headers, timeout });
 *   const html = await upstreamClient.get(url, opts, { expectHtml: true }); // 返回 HTML 的页面型接口
 */

// 对外文案统一脱敏：不出现第三方品牌名、上游域名、内部存储键名等信息
const SESSION_HINT = '数据服务会话已失效，请联系管理员更新会话后重试';
const RATE_LIMIT_HINT = '触发数据服务限流，请稍后重试或降低调用频率';
const TIMEOUT_HINT = '数据服务响应超时，请稍后重试；如持续超时请联系管理员';
const SERVER_HINT = '数据服务暂时不可用，请稍后重试';
const EMPTY_DATA_HINT = '查询异常，请联系管理员处理后重试';
const GENERIC_HINT = '请检查请求参数后重试；如持续失败请联系管理员';

function bodyMessage(data) {
  if (!data || typeof data !== 'object') return '';
  return data.message || data.msg || data.error || '';
}

function hintForUpstreamCode(code, message) {
  const m = String(message || '');
  if ([401, 403].includes(Number(code)) || /登录|未授权|无权限|会话/.test(m)) {
    return SESSION_HINT;
  }
  if (Number(code) === 429 || /频繁|限流|限制|过多/.test(m)) {
    return RATE_LIMIT_HINT;
  }
  if (/余额|配额|点数|积分|到期|套餐|会员/.test(m)) {
    return EMPTY_DATA_HINT;
  }
  return GENERIC_HINT;
}

function wrapAxiosError(e, url) {
  if (e && e.isAxiosError) {
    if (e.code === 'ECONNABORTED') {
      return new UpstreamError('数据服务响应超时', { url, hint: TIMEOUT_HINT, cause: e });
    }
    if (!e.response) {
      return new UpstreamError('数据服务连接失败(网络异常)', { url, hint: '请稍后重试；如持续失败请联系管理员', cause: e });
    }
    const status = e.response.status;
    const msg = bodyMessage(e.response.data) || `HTTP ${status}`;
    let hint = GENERIC_HINT;
    if (status === 401 || status === 403) hint = SESSION_HINT;
    else if (status === 429) hint = RATE_LIMIT_HINT;
    else if (status >= 500) hint = SERVER_HINT;
    return new UpstreamError(`数据服务接口异常: ${msg}`, {
      url, httpStatus: status, hint, cause: e
    });
  }
  return new UpstreamError('数据服务调用失败', { url, hint: GENERIC_HINT, cause: e });
}

/**
 * 校验上游 JSON 包裹格式并返回 data。
 * 仅对“对象且含 code 字段”的响应做校验；HTML/纯文本/数组直接透传。
 */
function checkEnvelope(data, url, options) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }
  if (data.code === undefined || data.code === null) {
    return data;
  }
  // 成功码：数字 0 / 200，或字符串 "OK" / "SUCCESS"（卖家精灵 Web 端通道使用字符串码）
  const raw = data.code;
  const isSuccess = raw === 0 || raw === 200 || raw === '0' || raw === '200'
    || (typeof raw === 'string' && ['OK', 'SUCCESS'].includes(raw.toUpperCase()));
  if (!isSuccess) {
    const msg = bodyMessage(data) || `错误码 ${data.code}`;
    throw new UpstreamError(`数据服务返回错误: ${msg}`, {
      upstreamCode: data.code, httpStatus: 200, url, hint: hintForUpstreamCode(data.code, msg)
    });
  }
  // code 为成功但 data 为空：通常是配额耗尽/权限不足，不能静默返回空
  if (data.data === null || data.data === undefined) {
    if (!options || !options.allowNullData) {
      throw new UpstreamError('数据为空', {
        upstreamCode: data.code, httpStatus: 200, url, hint: EMPTY_DATA_HINT
      });
    }
  }
  return data;
}

async function request(axiosConfig, options) {
  const url = axiosConfig.url;
  let resp;
  try {

    // Debug: 输出等价的 curl 命令便于测试验证
    // console.log(`curl -X ${(axiosConfig.method || 'GET').toUpperCase()} '${url}' ${axiosConfig.headers ? Object.entries(axiosConfig.headers).map(([k,v]) => `-H '${k}: ${v}'`).join(' ') : ''} ${axiosConfig.data ? `-d '${JSON.stringify(axiosConfig.data)}'` : ''}`);

    resp = await axios.request(axiosConfig);
  } catch (e) {
    throw wrapAxiosError(e, url);
  }
  if (options && options.expectHtml) {
    return resp.data;
  }
  return checkEnvelope(resp.data, url, options);
}

async function post(url, data, axiosConfig, options) {
  return request({ ...axiosConfig, method: 'post', url, data }, options);
}

async function get(url, axiosConfig, options) {
  return request({ ...axiosConfig, method: 'get', url }, options);
}

module.exports = { request, post, get, checkEnvelope };
