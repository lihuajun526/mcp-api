const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
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

// Open API 排序字段名 → 第三方 order 整数（与 traffic_extend 的 orderColumn 枚举保持一致）
const ORDER_FIELD_MAP = {
  searches: 5,
  purchases: 6,
  purchaseRate: 7,
  products: 8,
  supplyDemandRatio: 10,
  monopolyClickRate: 11,
  trafficPercentage: 12,
  bid: 13,
  avgPrice: 14,
  updatedTime: 15,
  searchesRank: 2,
  titleDensity: 4,
  top3ClickingRate: 16,
  top3ConversionRate: 17
};

// 官方 order.field 为字符串，第三方 order 为整数编码；无映射时回退默认 12
function resolveOrder(order) {
  if (order === null || order === undefined) {
    return 12;
  }
  const rawField = typeof order === 'object' ? order.field : order;
  if (rawField === null || rawField === undefined || rawField === '') {
    return 12;
  }
  const n = Number(rawField);
  if (Number.isFinite(n) && n > 0) {
    return Math.trunc(n);
  }
  return ORDER_FIELD_MAP[rawField] || 12;
}

function resolveOrderDesc(order) {
  if (order && typeof order === 'object' && order.desc !== undefined) {
    return order.desc !== false;
  }
  return true;
}

async function fetchAsinReversing(request, session) {
  const market = MARKET_CODE_MAP[request.marketplace] || request.marketplace;
  const size = Math.min(Math.max(Number(request.size) || 50, 1), 100);
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
    conversionKeywordTypes: Array.isArray(request.conversionKeywordTypes) && request.conversionKeywordTypes.length > 0
      ? request.conversionKeywordTypes
      : [],
    trafficKeywordTypes: Array.isArray(request.trafficKeywordTypes) && request.trafficKeywordTypes.length > 0
      ? request.trafficKeywordTypes
      : [],
    order: resolveOrder(request.order),
    desc: resolveOrderDesc(request.order),
    exactly: false,
    ac: false,
    keywordBidMatchType: 'exact',
    filterDeletedKeywords: false
  };

  // 关键词过滤（透传给上游）
  if (request.keyword && String(request.keyword).trim()) {
    payload.keyword = String(request.keyword).trim();
  }

  const headers = {
    accept: session.accept || 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh,en;q=0.9',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0'
  };

  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.asinReversingPath}?market=${market}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
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
  const transformed = sanitizeInternalFields(transformAsinReversingResponse(raw, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAsinReversing };
