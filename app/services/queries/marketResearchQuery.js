const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError } = require('../../errors');
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

async function fetchMarketResearch(request, session) {
  const marketId = MARKET_ID_MAP[request.marketplace] || 1;

  const params = {
    marketId,
    nodeIdPath: request.nodeIdPath || '',
    sampleNumber: 1,
    topn: Number(request.topNum) || 10,
    newReleaseNum: Number(request.newProduct) || 6,
    departmentKeyword: request.departmentKeyword || '',
    'order.field': request.orderField || 'total_sales',
    'order.desc': request.orderDesc !== false ? 'true' : 'false',
    sellerNations: request.sellerLocation || '',
    page: Number(request.page) || 1,
    size: Number(request.size) || 20
  };

  // 附加可选筛选参数
  const optionalFilters = [
    'minAvgSales', 'maxAvgSales',
    'minAvgBsr', 'maxAvgBsr',
    'minAvgWeight', 'maxAvgWeight',
    'minHeadListingAvgBsr', 'maxHeadListingAvgBsr',
    'minTotalProducts', 'maxTotalProducts',
    'minAvgRevenue', 'maxAvgRevenue',
    'minAvgPrice', 'maxAvgPrice'
  ];
  for (const key of optionalFilters) {
    if (request[key] != null && request[key] !== '') {
      params[key] = request[key];
    }
  }

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0',
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
  if (!request || !request.marketplace) {
    throw new BusinessError('marketplace 不能为空', 400);
  }

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
