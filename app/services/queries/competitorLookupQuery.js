const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'competitor_lookup';

async function fetchCompetingLookup(request, session) {
  const headers = {
    accept: 'application/json, text/plain, */*',
    origin: 'https://www.sellersprite.com',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
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
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchCompetingLookup(request, session);
  const transformed = sanitizeInternalFields(transformCompetitionResponse(raw, request));

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryCompetingLookup };
