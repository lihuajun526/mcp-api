const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError, UpstreamError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinSalesTrendResponse } = require('../../transformers/asinSalesTrendTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_SALES_TREND';

async function fetchAsinSalesTrend(request, session) {
  const url = `${config.sellerSprite.openApiBaseUrl}${config.sellerSprite.asinSalesTrendPath}/${request.marketplace}/${request.asin}/sales-trend`;
  // 优先使用全局配置的 open API 密钥，回退到会话中的密钥
  const secretKey = config.sellerSprite.openApiSecretKey || session.secretKey;
  if (!secretKey) {
    throw new UpstreamError('当前数据服务会话未配置访问凭证，无法调用该接口', {
      url,
      hint: '请联系管理员配置 SELLERSPRITE_OPEN_API_SECRET_KEY 环境变量后重试'
    });
  }
  const headers = {
    'secret-key': secretKey,
    'content-type': 'application/json;charset=UTF-8',
    accept: 'application/json'
  };
  return upstreamClient.get(url, { headers, timeout: config.sellerSprite.timeoutMs });
}

async function queryAsinSalesTrend(user, request) {
  if (!request || !request.marketplace || !request.asin) {
    throw new BusinessError('marketplace 和 asin 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinSalesTrend(request, session);
  const transformed = sanitizeInternalFields(transformAsinSalesTrendResponse(raw, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAsinSalesTrend };
