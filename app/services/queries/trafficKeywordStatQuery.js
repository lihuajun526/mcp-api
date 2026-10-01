const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformTrafficKeywordStatResponse } = require('../../transformers/trafficKeywordStatTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'TRAFFIC_KEYWORD_STAT';

// marketplace 公开代码 → marketId (整数)
const MARKET_ID_MAP = {
  US: 1, UK: 2, DE: 3, FR: 4, ES: 5, IT: 6,
  JP: 7, CA: 8, MX: 9, AU: 13, IN: 14
};

async function fetchTrafficKeywordStat(request, session) {
  const marketId = MARKET_ID_MAP[request.marketplace] || 1;

  const payload = {
    asin: request.asin,
    marketId,
    month: request.month || '',
    forceReStat: request.forceReStat === true,
    badges: Array.isArray(request.badges) ? request.badges : [],
    limit: Number(request.limit) || 50
  };

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent,
    referer: `${config.sellerSprite.baseUrl}/v3/keyword-reverse/`
  };
  if (session.xToken) {
    headers['x-token'] = session.xToken;
  }

  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.trafficKeywordStatPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryTrafficKeywordStat(user, request) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchTrafficKeywordStat(request, session);

  const rawData = raw && raw.data ? raw.data : raw;
  const transformed = sanitizeInternalFields(transformTrafficKeywordStatResponse(rawData, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryTrafficKeywordStat };
