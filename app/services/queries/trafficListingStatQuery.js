const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformTrafficListingStatResponse } = require('../../transformers/trafficListingStatTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'TRAFFIC_LISTING_STAT';

// marketplace 公开代码 → station 代码 (US→COM)
const MARKET_STATION_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

async function fetchTrafficListingStat(request, session) {
  const station = MARKET_STATION_MAP[request.marketplace] || request.marketplace;
  const asinList = Array.isArray(request.asinList) ? request.asinList : [request.asinList];

  const payload = {
    asinList,
    station,
    queryVariations: request.queryVariations !== false
  };

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0',
    referer: `${config.sellerSprite.baseUrl}/v3/relation-keyword`
  };
  if (session.xToken) {
    headers['x-token'] = session.xToken;
  }

  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.trafficListingStatPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryTrafficListingStat(user, request) {
  if (!request || !request.marketplace || !request.asinList ||
      (Array.isArray(request.asinList) && request.asinList.length === 0)) {
    throw new BusinessError('marketplace 和 asinList 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchTrafficListingStat(request, session);

  const rawData = raw && raw.data ? raw.data : raw;
  const transformed = sanitizeInternalFields(transformTrafficListingStatResponse(rawData, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryTrafficListingStat };
