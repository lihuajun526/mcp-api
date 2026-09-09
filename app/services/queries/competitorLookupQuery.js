const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'COMPETING_LOOKUP';

async function fetchCompetingLookup(request, session) {
  const asins = Array.isArray(request.asins) ? request.asins : (request.asins ? [request.asins] : []);
  const nodeIdPaths = request.nodeIdPath ? [request.nodeIdPath] : (request.nodeIdPaths || []);
  const headers = {
    accept: 'application/json, text/plain, */*',
    origin: 'https://www.sellersprite.com',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent
  };
  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.competingLookupPath}`,
    request,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryCompetingLookup(user, request) {
  
  if (request.asins && request.asins.length > 40) {
    throw new BusinessError('单次查询ASIN数量不能超过40个', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchCompetingLookup(request, session);
  const transformed = sanitizeInternalFields(transformCompetitionResponse(raw, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryCompetingLookup };
