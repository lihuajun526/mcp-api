const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformKeywordResearchResponse } = require('../../transformers/keywordResearchTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'KEYWORD_RESEARCH';

// marketplace public code → sellersprite station code
const MARKET_STATION_MAP = {
  US: 'US', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

async function fetchKeywordResearch(request, session) {
  const station = MARKET_STATION_MAP[request.marketplace] || request.marketplace;
  const size = Math.min(Number(request.size) || 100, 200);
  const page = Math.max(Number(request.page) || 1, 1);

  const params = {
    station,
    'order.field': request.orderField || 'searches',
    'order.desc': request.orderDesc !== false ? 'false' : 'true',
    supplement: request.supplement || 'N',
    usestatic: 'R',
    exportGkImages: 'false',
    marketId: '1',
    limitUserStatic: 'true',
    adminDes: 'N',
    presetMode: '',
    itemImageRange: '2',
    keywordBidMatchType: request.keywordBidMatchType || 'exact',
    month: request.month || '',
    minSearches: request.minSearches || '',
    maxSearches: request.maxSearches || '',
    minYearlyGrowth: request.minYearlyGrowth || '',
    maxYearlyGrowth: request.maxYearlyGrowth || '',
    minGrowthTrendMin: '',
    maxGrowthTrendMin: '',
    minProducts: request.minProducts || '',
    maxProducts: request.maxProducts || '',
    minPurchases: request.minPurchases || '',
    maxPurchases: request.maxPurchases || '',
    minImpressions: '',
    maxImpressions: '',
    minSPR: '',
    maxSPR: '',
    minGoodsValue: '',
    maxGoodsValue: '',
    minAvgPrice: request.minAvgPrice || '',
    maxAvgPrice: request.maxAvgPrice || '',
    minAvgReviews: '',
    maxAvgReviews: '',
    minWordCount: request.minWordCount || '',
    maxWordCount: request.maxWordCount || '',
    minGrowth: request.minGrowth || '',
    maxGrowth: request.maxGrowth || '',
    minYearlyGrowthRate: '',
    maxYearlyGrowthRate: '',
    minGrowthRateTrendMin: '',
    maxGrowthRateTrendMin: '',
    marketPeriod: request.marketPeriod || '',
    minSupplyDemandRatio: request.minSupplyDemandRatio || '',
    maxSupplyDemandRatio: request.maxSupplyDemandRatio || '',
    minPurchaseRate: request.minPurchaseRate || '',
    maxPurchaseRate: request.maxPurchaseRate || '',
    minClicks: '',
    maxClicks: '',
    minTitleDensity: '',
    maxTitleDensity: '',
    minMonopolyClickRate: '',
    maxMonopolyClickRate: '',
    minCvsShareRate: '',
    maxCvsShareRate: '',
    minBid: request.minBid || '',
    maxBid: request.maxBid || '',
    minAvgRating: '',
    maxAvgRating: '',
    includeKeywords: request.includeKeywords || '',
    excludeKeywords: request.excludeKeywords || '',
    page,
    size
  };

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0',
    referer: `${config.sellerSprite.baseUrl}${config.sellerSprite.keywordResearchPath}`
  };

  return upstreamClient.get(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.keywordResearchPath}`,
    { params, headers, timeout: config.sellerSprite.timeoutMs },
    { expectHtml: true }
  );
}

async function queryKeywordResearch(user, request) {
  if (!request || !request.marketplace || !request.includeKeywords) {
    throw new BusinessError('marketplace、includeKeywords不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const html = await fetchKeywordResearch(request, session);
  const transformed = sanitizeInternalFields(transformKeywordResearchResponse(html, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryKeywordResearch };
