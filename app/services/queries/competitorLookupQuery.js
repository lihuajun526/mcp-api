const axios = require('axios');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'COMPETING_LOOKUP';

async function fetchCompetingLookup(request, session) {
  const payload = {
    market: request.marketplace,
    monthName: request.monthName || 'bsr_sales_nearly',
    asins: request.asins,
    page: request.page || 1,
    size: request.size || 60,
    symbolFlag: request.symbolFlag !== undefined ? request.symbolFlag : true,
    nodeIdPaths: request.nodeIdPaths || [],
    order: { field: request.orderField || 'amz_unit', desc: request.orderDesc !== undefined ? request.orderDesc : true },
    lowPrice: request.lowPrice || 'N'
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

async function queryCompetingLookup(user, request) {
  if (!request || !request.marketplace || !request.asins || !request.asins.length) {
    throw new BusinessError('marketplace和asins不能为空', 400);
  }
  if (!Array.isArray(request.asins)) {
    request.asins = [request.asins];
  }
  if (request.asins.length > 100) {
    throw new BusinessError('单次查询ASIN数量不能超过100个', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSellerSpriteSession();
  const raw = await fetchCompetingLookup(request, session);
  const transformed = transformCompetitionResponse(raw, request);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryCompetingLookup };
