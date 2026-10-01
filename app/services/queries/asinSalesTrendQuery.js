const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinSalesTrendResponse } = require('../../transformers/asinSalesTrendTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_SALES_TREND';

// marketplace 公开代码 → marketId (整数)
const MARKET_ID_MAP = {
  US: 1, DE: 4, UK: 3, JP: 6, FR: 5, IT: 35691, ES: 44551,
  CA: 7, IN: 44571, MX: 771770
};

async function fetchAsinSalesTrend(request, session) {
  const marketId = MARKET_ID_MAP[request.marketplace] || 1;
  const body = new URLSearchParams({ asin: request.asin, marketId }).toString();
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

async function queryAsinSalesTrend(user, request) {
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
