const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
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

  // 官方参数名 → 上游页面参数名映射；未提供的筛选项传空串
  const params = {
    station,
    'order.field': request.orderField || 'searches',
    // 官方 order.desc 默认 true（降序），与上游语义一致，直接透传
    'order.desc': request.orderDesc !== false ? 'true' : 'false',
    supplement: request.supplement || 'N',
    usestatic: 'R',
    exportGkImages: 'false',
    marketId: '1',
    limitUserStatic: 'true',
    adminDes: 'N',
    presetMode: '',
    itemImageRange: '2',
    keywordBidMatchType: 'exact',
    month: request.month || '',
    departments: Array.isArray(request.departments)
      ? request.departments.join(',')
      : (request.departments || ''),
    minSearches: request.minSearches || '',
    maxSearches: request.maxSearches || '',
    // 月搜索量增长率（官方 minSearchesCr/maxSearchesCr）
    minGrowth: request.minSearchesCr != null ? request.minSearchesCr : '',
    maxGrowth: request.maxSearchesCr != null ? request.maxSearchesCr : '',
    // 近3个月增长值（官方 minSearchNearlyCv/maxSearchNearlyCv）
    minGrowthTrendMin: request.minSearchNearlyCv != null ? request.minSearchNearlyCv : '',
    maxGrowthTrendMin: request.maxSearchNearlyCv != null ? request.maxSearchNearlyCv : '',
    minProducts: request.minProducts || '',
    maxProducts: request.maxProducts || '',
    minPurchases: request.minPurchases || '',
    maxPurchases: request.maxPurchases || '',
    minImpressions: '',
    maxImpressions: '',
    minSPR: '',
    maxSPR: '',
    // 货流值（官方 minGoodsValue/maxGoodsValue）
    minGoodsValue: request.minGoodsValue != null ? request.minGoodsValue : '',
    maxGoodsValue: request.maxGoodsValue != null ? request.maxGoodsValue : '',
    minAvgPrice: request.minAvgPrice || '',
    maxAvgPrice: request.maxAvgPrice || '',
    // 评分数（官方 minRatings/maxRatings）
    minAvgReviews: request.minRatings != null ? request.minRatings : '',
    maxAvgReviews: request.maxRatings != null ? request.maxRatings : '',
    minWordCount: request.minWordCount || '',
    maxWordCount: request.maxWordCount || '',
    // 同比增长值（官方 minSearchMonthCv/maxSearchMonthCv）
    minYearlyGrowth: request.minSearchMonthCv != null ? request.minSearchMonthCv : '',
    maxYearlyGrowth: request.maxSearchMonthCv != null ? request.maxSearchMonthCv : '',
    // 同比增长率（官方 minSearchMonthCr/maxSearchMonthCr）
    minYearlyGrowthRate: request.minSearchMonthCr != null ? request.minSearchMonthCr : '',
    maxYearlyGrowthRate: request.maxSearchMonthCr != null ? request.maxSearchMonthCr : '',
    // 近3个月增长率（官方 minSearchNearlyCr/maxSearchNearlyCr）
    minGrowthRateTrendMin: request.minSearchNearlyCr != null ? request.minSearchNearlyCr : '',
    maxGrowthRateTrendMin: request.maxSearchNearlyCr != null ? request.maxSearchNearlyCr : '',
    marketPeriod: request.marketPeriod || '',
    minSupplyDemandRatio: request.minSupplyDemandRatio || '',
    maxSupplyDemandRatio: request.maxSupplyDemandRatio || '',
    minPurchaseRate: request.minPurchaseRate || '',
    maxPurchaseRate: request.maxPurchaseRate || '',
    minClicks: '',
    maxClicks: '',
    minTitleDensity: '',
    maxTitleDensity: '',
    // 点击集中度（官方 minAraClickRate/maxAraClickRate）
    minMonopolyClickRate: request.minAraClickRate != null ? request.minAraClickRate : '',
    maxMonopolyClickRate: request.maxAraClickRate != null ? request.maxAraClickRate : '',
    minCvsShareRate: '',
    maxCvsShareRate: '',
    minBid: request.minBid || '',
    maxBid: request.maxBid || '',
    // 评分值（官方 minRating/maxRating）
    minAvgRating: request.minRating != null ? request.minRating : '',
    maxAvgRating: request.maxRating != null ? request.maxRating : '',
    includeKeywords: request.keywords || '',
    excludeKeywords: request.excludeKeywords || '',
    page,
    size
  };

  if (request.withYearlyGrowth != null) {
    params.withYearlyGrowth = request.withYearlyGrowth === true || request.withYearlyGrowth === 'true' ? 'true' : 'false';
  }

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent
  };

  return upstreamClient.get(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.keywordResearchPath}`,
    { params, headers, timeout: config.sellerSprite.timeoutMs },
    { expectHtml: true }
  );
}

async function queryKeywordResearch(user, request) {
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
