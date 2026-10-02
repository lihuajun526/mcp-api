const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinSalesTrendResponse } = require('../../transformers/asinSalesTrendTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_SALES_TREND';

async function fetchAsinSalesTrend(params, session) {
  // marketplace 仅供 transformer 使用，不发往上游
  const { marketplace, ...fields } = params;
  const body = new URLSearchParams({ asin: fields.asin, marketId: fields.marketId }).toString();

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent
  };
  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.chartMonthlyPath}`,
    body,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryAsinSalesTrend(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinSalesTrend(params, session);
  const transformed = sanitizeInternalFields(transformAsinSalesTrendResponse(raw, params));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryAsinSalesTrend };
