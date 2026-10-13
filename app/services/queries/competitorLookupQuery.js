const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');
const { retryOnUpstreamError } = require('../../utils/retry');

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
    'user-agent': session.userAgent,
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"'
  };
  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.competingLookupPath}`,
    request,
    { headers, timeout: config.sellerSprite.timeoutMs },
    { onSetCookie: (sc) => sessionService.syncSessionCookie(PROVIDER, session.field, session.cookie, sc) }
  );
}

async function queryCompetingLookup(user, request) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const raw = await retryOnUpstreamError(async () => {
    const session = await sessionService.pickSession(PROVIDER);
    return fetchCompetingLookup(request, session);
  });
  const transformed = sanitizeInternalFields(transformCompetitionResponse(raw, request));

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryCompetingLookup };
