const axios = require('axios');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformBsrSalesResponse } = require('../../transformers/bsrSalesTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'BSR_SALES';

async function fetchBsrSales(request, session) {
  const body = new URLSearchParams();
  body.append('station', request.marketplace);
  body.append('cid', request.categoryId);
  body.append('bsr', request.bsr);
  if (request.gtk || session.gtk) {
    body.append('gtk', request.gtk || session.gtk);
  }

  const headers = {
    accept: session.accept || 'application/json, text/javascript, */*; q=0.01',
    'accept-language': session.acceptLanguage || 'zh,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0'
  };

  const resp = await axios.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.bsrSalesPath}`,
    body.toString(),
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
  return resp.data;
}

async function queryBsrSales(user, request) {
  if (!request || !request.marketplace || !request.categoryId || !request.bsr) {
    throw new BusinessError('marketplace、categoryId、bsr不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSellerSpriteSession();
  const raw = await fetchBsrSales(request, session);
  const transformed = transformBsrSalesResponse(raw, request);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryBsrSales };
