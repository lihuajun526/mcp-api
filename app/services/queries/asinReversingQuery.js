const axios = require('axios');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinReversingResponse } = require('../../transformers/asinReversingTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_REVERSING';

// 将 marketplace 公开代码（US/UK/DE 等）映射到 sellersprite 站点代码（COM/UK/DE 等）
const MARKET_CODE_MAP = {
  US: 'COM',
  CA: 'CA',
  MX: 'MX',
  UK: 'UK',
  DE: 'DE',
  FR: 'FR',
  IT: 'IT',
  ES: 'ES',
  JP: 'JP',
  IN: 'IN',
  AU: 'AU'
};

async function fetchAsinReversing(request, session) {
  const market = MARKET_CODE_MAP[request.marketplace] || request.marketplace;
  const size = Math.min(Number(request.size) || 100, 200);
  const page = Math.max(Number(request.page) || 1, 1);
  const skip = (page - 1) * size;

  const payload = {
    asin: request.asin,
    limit: size,
    skip,
    month: request.month || '',
    badges: Array.isArray(request.badges) && request.badges.length > 0
      ? request.badges
      : ['NATURAL_SEARCHING', 'AMAZON_CHOICE', 'EDITORIAL_RECOMMENDATIONS', 'FOUR_STAR', 'SPONSOR_BRAND', 'SPONSOR_VIDEO', 'HIGHLY_RATED', 'ADS'],
    conversionKeywordTypes: [],
    trafficKeywordTypes: [],
    order: 12,
    desc: true,
    exactly: false,
    ac: false,
    keywordBidMatchType: 'exact',
    filterDeletedKeywords: false
  };

  const headers = {
    accept: session.accept || 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh,en;q=0.9',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0'
  };

  const resp = await axios.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.asinReversingPath}?market=${market}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
  return resp.data;
}

async function queryAsinReversing(user, request) {
  if (!request || !request.marketplace || !request.asin) {
    throw new BusinessError('marketplace、asin不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinReversing(request, session);
  const transformed = transformAsinReversingResponse(raw, request);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAsinReversing };
