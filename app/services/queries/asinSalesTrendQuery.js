const axios = require('axios');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinSalesTrendResponse } = require('../../transformers/asinSalesTrendTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_SALES_TREND';

async function fetchAsinSalesTrend(request, session) {
  const headers = {
    'secret-key': session.secretKey || '',
    accept: 'application/json'
  };
  const url = `${config.sellerSprite.openApiBaseUrl}${config.sellerSprite.asinSalesTrendPath}/${request.marketplace}/${request.asin}/sales-trend`;
  const resp = await axios.get(url, { headers, timeout: config.sellerSprite.timeoutMs });
  return resp.data;
}

async function queryAsinSalesTrend(user, request) {
  if (!request || !request.marketplace || !request.asin) {
    throw new BusinessError('marketplace 和 asin 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinSalesTrend(request, session);
  const transformed = transformAsinSalesTrendResponse(raw, request);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAsinSalesTrend };
