const axios = require('axios');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_COMPETITOR';

async function fetchAsinCompetitor(request, session) {
  const payload = {
    market: request.marketplace,
    monthName: 'bsr_sales_nearly',
    asins: [request.asin],
    page: 1,
    size: request.size || 20,
    symbolFlag: false,
    nodeIdPaths: [],
    order: { field: 'total_units', desc: true },
    lowPrice: 'N'
  };

  const headers = {
    accept: session.accept || 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9',
    'content-type': session.contentType || 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0'
  };
  const resp = await axios.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.competingLookupPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
  return resp.data;
}

async function queryAsinCompetitor(user, request) {
  if (!request || !request.marketplace || !request.asin) {
    throw new BusinessError('marketplace 和 asin 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinCompetitor(request, session);
  const transformed = transformCompetitionResponse(raw, request);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAsinCompetitor };
