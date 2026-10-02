const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinReversingResponse } = require('../../transformers/asinReversingTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_REVERSING';

async function fetchAsinReversing(params, session) {
  // marketplace 及 market 仅供内部使用，不作为 payload 字段（market 用于 URL 参数）
  const { marketplace, market, ...payload } = params;

  const headers = {
    accept: session.accept || 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh,en;q=0.9',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent
  };

  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.asinReversingPath}?market=${market}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryAsinReversing(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinReversing(params, session);
  const transformed = sanitizeInternalFields(transformAsinReversingResponse(raw, params));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryAsinReversing };
