const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformKeywordMinerResponse } = require('../../transformers/keywordMinerTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'KEYWORD_MINER';

// marketplace 字符串 → 第三方 market 整数
const MARKETPLACE_TO_MARKET_ID = {
  US: 1, UK: 2, DE: 3, FR: 4, JP: 5,
  CA: 6, IT: 7, ES: 8, IN: 9, AU: 10, MX: 11
};

// Open API 排序字段名 → 第三方 orderBy 整数
const ORDER_FIELD_MAP = {
  searches: 5,
  purchases: 6,
  purchaseRate: 7,
  products: 8,
  adProducts: 9,
  supplyDemandRatio: 10,
  monopolyClickRate: 11,
  spr: 12,
  bid: 13,
  avgPrice: 14,
  avgRating: 15,
  avgRatings: 16,
  cvsShareRate: 17,
  relevancy: 1,
  searchRank: 2,
  wordCount: 3,
  titleDensity: 4,
  clicks: 18,
  impressions: 19
};

function resolveOrderBy(orderField) {
  if (!orderField) return 5; // 默认按搜索量排序
  const n = Number(orderField);
  if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  return ORDER_FIELD_MAP[orderField] || 5;
}

async function fetchKeywordMiner(request, session) {
  const marketId = MARKETPLACE_TO_MARKET_ID[request.marketplace] || 1;
  const page = Math.max(Number(request.page) || 1, 1);
  const size = Math.min(Number(request.size) || 50, 100);

  const payload = {
    keyword: request.keyword || '',
    market: marketId,
    pageNum: page,
    pageSize: size,
    historyDate: request.historyDate || '',
    orderBy: resolveOrderBy(request.orderField),
    desc: request.orderDesc !== false,
    filterRootWord: request.filterRootWord != null ? Number(request.filterRootWord) : 0,
    matchType: request.matchType != null ? Number(request.matchType) : 0,
    amazonChoice: request.amazonChoice === true || request.amazonChoice === 'true',
    keywordBidMatchType: request.keywordBidMatchType || 'exact'
  };

  // 批量关键词
  if (Array.isArray(request.keywordList) && request.keywordList.length > 0) {
    payload.keywordList = request.keywordList;
  }
  // 包含 / 排除词
  if (Array.isArray(request.includeKeywords) && request.includeKeywords.length > 0) {
    payload.includeKeywords = request.includeKeywords;
  }
  if (Array.isArray(request.excludeKeywords) && request.excludeKeywords.length > 0) {
    payload.excludeKeywords = request.excludeKeywords;
  }

  // 各项范围筛选（undefined 不传）
  const rangeFields = [
    'minSearch', 'maxSearch',
    'minPurchases', 'maxPurchases',
    'minPurchasesRate', 'maxPurchasesRate',
    'minSPR', 'maxSPR',
    'minTitleDensity', 'maxTitleDensity',
    'minRelevancy', 'maxRelevancy',
    'minSearchRank', 'maxSearchRank',
    'minProducts', 'maxProducts',
    'minSupplyDemandRatio', 'maxSupplyDemandRatio',
    'minAdProducts', 'maxAdProducts',
    'minMonopolyClickRate', 'maxMonopolyClickRate',
    'minBid', 'maxBid',
    'minWordCount', 'maxWordCount',
    'minPrice', 'maxPrice',
    'minRatings', 'maxRatings',
    'minRating', 'maxRating',
    'minImpressions', 'maxImpressions',
    'minClicks', 'maxClicks'
  ];
  for (const field of rangeFields) {
    if (request[field] != null && request[field] !== '') {
      payload[field] = Number(request[field]);
    }
  }

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0',
    referer: `${config.sellerSprite.baseUrl}/v3/keyword-miner/`
  };
  if (session.xToken) {
    headers['x-token'] = session.xToken;
  }

  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.keywordMinerPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryKeywordMiner(user, request) {
  if (!request || !request.marketplace || !request.keyword) {
    throw new BusinessError('marketplace 和 keyword 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchKeywordMiner(request, session);

  // 第三方返回格式: { code, message, data: { page, size, total, items } }
  const rawData = raw && raw.data ? raw.data : raw;
  const transformed = sanitizeInternalFields(transformKeywordMinerResponse(rawData, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryKeywordMiner };
