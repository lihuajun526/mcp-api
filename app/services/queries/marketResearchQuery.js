const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformMarketResearchResponse } = require('../../transformers/marketResearchTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'MARKET_RESEARCH';

// marketplace 公开代码 → marketId (整数)
const MARKET_ID_MAP = {
  US: 1, UK: 2, DE: 3, FR: 4, ES: 5, IT: 6,
  JP: 7, CA: 8, MX: 9, AU: 13, IN: 14
};

// 非筛选类核心参数（其余 request 字段视为官方维度筛选参数）
const CORE_PARAMS = new Set([
  'marketplace', 'nodeIdPath', 'departmentKeyword', 'month',
  'topNum', 'newProduct', 'sellerLocation',
  'orderField', 'orderDesc', 'page', 'size'
]);

// 官方参数名 → 上游表单参数名（名称不同的才需映射，其余同名直接透传）
const FIELD_ALIAS = {
  minAvgUnits: 'minAvgSales',
  maxAvgUnits: 'maxAvgSales',
  minAvgRatings: 'minAvgReviews',
  maxAvgRatings: 'maxAvgReviews',
  minWeight: 'minAvgWeight',
  maxWeight: 'maxAvgWeight',
  minVolume: 'minAvgVolume',
  maxVolume: 'maxAvgVolume',
  minTopAvgUnits: 'minHeadListingAvgSales',
  maxTopAvgUnits: 'maxHeadListingAvgSales',
  minTopAvgRevenue: 'minHeadListingAvgRevenue',
  maxTopAvgRevenue: 'maxHeadListingAvgRevenue',
  minTopAvgBsr: 'minHeadListingAvgBsr',
  maxTopAvgBsr: 'maxHeadListingAvgBsr',
  minGoodsCount: 'minTotalProducts',
  maxGoodsCount: 'maxTotalProducts',
  minGoodsCrn: 'minHeadListingProductCrn',
  maxGoodsCrn: 'maxHeadListingProductCrn',
  minBrandCrn: 'minHeadListingBrandCrn',
  maxBrandCrn: 'maxHeadListingBrandCrn',
  minSellerCrn: 'minHeadListingSellerCrn',
  maxSellerCrn: 'maxHeadListingSellerCrn',
  minEbcProportion: 'minEbcRatio',
  maxEbcProportion: 'maxEbcRatio',
  minFbaProportion: 'minFbaRatio',
  maxFbaProportion: 'maxFbaRatio',
  minFbmProportion: 'minFbmRatio',
  maxFbmProportion: 'maxFbmRatio',
  minAmazonSelfProportion: 'minAmzRatio',
  maxAmazonSelfProportion: 'maxAmzRatio',
  minNewProportion: 'minNewRatio',
  maxNewProportion: 'maxNewRatio',
  minNewAvgRatings: 'minNewAvgReviews',
  maxNewAvgRatings: 'maxNewAvgReviews',
  minNewAvgUnits: 'minNewAvgSales',
  maxNewAvgUnits: 'maxNewAvgSales'
};

async function fetchMarketResearch(request, session) {
  const marketId = MARKET_ID_MAP[request.marketplace] || 1;

  const params = {
    marketId,
    nodeIdPath: request.nodeIdPath || '',
    sampleNumber: 1,
    topn: Number(request.topNum) || 10,
    newReleaseNum: Number(request.newProduct) || 3,
    departmentKeyword: request.departmentKeyword || '',
    'order.field': request.orderField || 'total_sales',
    'order.desc': request.orderDesc !== false ? 'true' : 'false',
    sellerNations: request.sellerLocation || '',
    page: Number(request.page) || 1,
    size: Number(request.size) || 50
  };

  if (request.month) {
    params.monthName = `bsr_sales_monthly_${request.month}`;
  }

  // 官方维度筛选参数：按上游表单参数名映射后透传
  for (const key of Object.keys(request)) {
    if (CORE_PARAMS.has(key)) continue;
    const value = request[key];
    if (value == null || value === '') continue;
    params[FIELD_ALIAS[key] || key] = value;
  }

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent,
    referer: `${config.sellerSprite.baseUrl}${config.sellerSprite.marketResearchPath}`
  };
  if (session.xToken) {
    headers['x-token'] = session.xToken;
  }

  return upstreamClient.get(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.marketResearchPath}`,
    { params, headers, timeout: config.sellerSprite.timeoutMs },
    { expectHtml: true }
  );
}

async function queryMarketResearch(user, request) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const html = await fetchMarketResearch(request, session);
  const transformed = sanitizeInternalFields(transformMarketResearchResponse(html, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryMarketResearch };
