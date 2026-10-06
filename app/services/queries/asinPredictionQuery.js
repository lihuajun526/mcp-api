const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinPredictionResponse } = require('../../transformers/asinPredictionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'asin_prediction';

async function fetchAsinPrediction(params, session) {
  // marketplace 仅供 transformer 使用，不发往上游
  const { marketplace, ...fields } = params;

  const body = new URLSearchParams();
  body.append('station', fields.station);
  body.append('asin', fields.asin);
  if (session.gtk) {
    body.append('gtk', session.gtk);
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

async function queryAsinPrediction(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinPrediction(params, session);
  const transformed = sanitizeInternalFields(transformAsinPredictionResponse(raw, params));

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryAsinPrediction };
