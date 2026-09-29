const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformTrafficExtendResponse } = require('../../transformers/trafficExtendTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'TRAFFIC_EXTEND';

// marketplace 字符串 → 第三方 market 整数
const MARKETPLACE_TO_MARKET_ID = {
  US: 1, UK: 2, DE: 3, FR: 4, JP: 5,
  CA: 6, IT: 7, ES: 8, IN: 9, AU: 10, MX: 11
};

// Open API 排序字段名 → 第三方 orderColumn 整数
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

function resolveOrderColumn(orderField) {
  if (!orderField) return 12; // 默认按流量占比排序
  const n = Number(orderField);
  if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  return ORDER_FIELD_MAP[orderField] || 12;
}

async function fetchTrafficExtend(request, session) {
  const marketId = MARKETPLACE_TO_MARKET_ID[request.marketplace] || 1;
  const page = Math.max(Number(request.page) || 1, 1);
  const size = Math.min(Number(request.size) || 50, 50);

  // queryType: 0 所有变体, 1 畅销变体, 2 当前变体(默认)
  const queryType = request.queryType != null ? Number(request.queryType) : 2;
  const queryVariations = queryType === 0;

  const asinList = Array.isArray(request.asinList) ? request.asinList : [];

  const payload = {
    queryVariations,
    asinList,
    originAsinList: asinList,
    market: marketId,
    page,
    month: request.historyDate || '',
    size,
    orderColumn: resolveOrderColumn(request.orderField),
    desc: request.orderDesc !== false,
    exactly: false,
    ac: request.amazonChoice === true || request.amazonChoice === 'true',
    filterDeletedKeywords: false,
    keywordBidMatchType: request.keywordBidMatchType || 'exact'
  };

  // 范围筛选参数（与 Open API 文档保持一致）
  const rangeFields = [
    'minSearches', 'maxSearches',
    'minSearchRank', 'maxSearchRank',
    'minPurchases', 'maxPurchases',
    'minPurchaseRate', 'maxPurchaseRate',
    'minProducts', 'maxProducts',
    'minSupplyDemandRatio', 'maxSupplyDemandRatio',
    'minBid', 'maxBid',
    'minAdProducts', 'maxAdProducts',
    'minAvgPrice', 'maxAvgPrice',
    'minWordCount', 'maxWordCount',
    'minSPR', 'maxSPR',
    'minTitleDensity', 'maxTitleDensity',
    'minMonopolyClickRate', 'maxMonopolyClickRate',
    'minTrafficPercentage', 'maxTrafficPercentage',
    'minConversionRate', 'maxConversionRate',
    'minCompetitors', 'maxCompetitors'
  ];
  for (const field of rangeFields) {
    if (request[field] != null && request[field] !== '') {
      payload[field] = Number(request[field]);
    }
  }

  // 包含 / 排除词
  if (Array.isArray(request.includeKeywords) && request.includeKeywords.length > 0) {
    payload.includeKeywords = request.includeKeywords;
  }
  if (Array.isArray(request.excludeKeywords) && request.excludeKeywords.length > 0) {
    payload.excludeKeywords = request.excludeKeywords;
  }

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent,
    referer: `${config.sellerSprite.baseUrl}/v3/traffic/extend/asin`
  };
  if (session.xToken) {
    headers['x-token'] = session.xToken;
  }

  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.trafficExtendPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryTrafficExtend(user, request) {
  if (Array.isArray(request.asinList) && request.asinList.length > 20) {
    throw new BusinessError('asinList 最多支持 20 个 ASIN', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchTrafficExtend(request, session);

  const rawData = raw && raw.data ? raw.data : raw;
  const transformed = sanitizeInternalFields(transformTrafficExtendResponse(rawData, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryTrafficExtend };
