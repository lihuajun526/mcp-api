const axios = require('axios');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformKeywordConversionResponse } = require('../../transformers/keywordConversionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'KEYWORD_CONVERSION';

// Open API 时间类型 → 第三方 timeType
// Open API: WEEK | 90D  ；第三方: W | 90D
const TIME_TYPE_MAP = {
  WEEK: 'W',
  W: 'W',
  '90D': '90D'
};

async function fetchKeywordConversion(request, session) {
  const market = request.marketplace || 'US';
  const page = Math.max(Number(request.page) || 1, 1);
  const size = Math.min(Number(request.size) || 100, 100);
  const timeType = TIME_TYPE_MAP[request.timeType] || 'W';

  const payload = {
    pageNum: page,
    pageSize: size,
    market,
    timeType,
    bidMatchType: request.bidMatchType || 'exact',
    desc: request.orderDesc !== false,
    keywordMatchType: 'all',
    matchType: request.matchType != null ? Number(request.matchType) : 1,
    keyword: request.keyword || ''
  };

  // 范围筛选参数 (与 Open API 文档一致)
  const rangeFields = [
    'minSearches', 'maxSearches',
    'minClicks', 'maxClicks',
    'minPurchases', 'maxPurchases',
    'minSearchConvRate', 'maxSearchConvRate',
    'minClickConvRate', 'maxClickConvRate',
    'minPpc', 'maxPpc',
    'minCpa', 'maxCpa',
    'minProductPrice', 'maxProductPrice',
    'minAcos', 'maxAcos',
    'minClickingRate', 'maxClickingRate',
    'minConversionRate', 'maxConversionRate',
    'minPhraseCount', 'maxPhraseCount',
    'minBudget', 'maxBudget'
  ];
  for (const field of rangeFields) {
    if (request[field] != null && request[field] !== '') {
      payload[field] = Number(request[field]);
    }
  }

  // 关键词过滤
  if (Array.isArray(request.includeKeywords) && request.includeKeywords.length > 0) {
    payload.includeKeywords = request.includeKeywords;
  }
  if (Array.isArray(request.excludeKeywords) && request.excludeKeywords.length > 0) {
    payload.excludeKeywords = request.excludeKeywords;
  }
  if (request.customAvgProductPrice != null) {
    payload.customAvgProductPrice = Number(request.customAvgProductPrice);
  }

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0',
    referer: `${config.sellerSprite.baseUrl}/v3/keyword-conversion/`
  };
  if (session.xToken) {
    headers['x-token'] = session.xToken;
  }

  const resp = await axios.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.keywordConversionPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
  return resp.data;
}

async function queryKeywordConversion(user, request) {
  if (!request || !request.marketplace || !request.keyword) {
    throw new BusinessError('marketplace 和 keyword 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchKeywordConversion(request, session);

  // 第三方返回格式: { code, message, data: { pager: { items, ... } } }
  const pager = raw && raw.data && raw.data.pager ? raw.data.pager : (raw && raw.data ? raw.data : raw);
  const transformed = transformKeywordConversionResponse(pager, request);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryKeywordConversion };
