const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinSalesResponse } = require('../../transformers/asinSalesTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_SALES';

async function fetchAsinSales(request, session) {
  const body = new URLSearchParams();
  body.append('station', request.marketplace);
  body.append('asin', request.asin);
  if (request.gtk || session.gtk) {
    body.append('gtk', request.gtk || session.gtk);
  }

  const headers = {
    accept: session.accept || 'application/json, text/javascript, */*; q=0.01',
    'accept-language': session.acceptLanguage || 'zh,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent
  };

  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.asinSalesPath}`,
    body.toString(),
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryAsinSales(user, request) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinSales(request, session);
  const transformed = sanitizeInternalFields(transformAsinSalesResponse(raw, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAsinSales };
