const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAbaResearchResponse } = require('../../transformers/abaResearchTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ABA_RESEARCH_WEEKLY';

// marketplace 公开代码 → 第三方 market 代码 (US→COM)
const MARKET_CODE_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

async function fetchAbaResearchWeekly(request, session) {
  const market = MARKET_CODE_MAP[request.marketplace] || request.marketplace;
  const page = Math.max(Number(request.page) || 1, 1);
  const size = Math.min(Number(request.size) || 40, 40);

  const payload = {
    market,
    reverseType: 'W',
    page,
    size,
    departments: Array.isArray(request.departments) ? request.departments : [],
    keywordBidMatchType: 'exact',
    order: {
      field: request.orderField || 'searchfrequencyrank',
      desc: request.orderDesc !== false
    }
  };

  // 日期 (按周: yyyMMdd 格式的周六日期, 转为表名 ara_YYYYMMDD)
  if (request.date) {
    payload.table = `ara_${request.date}`;
  }

  // 关键词筛选
  if (request.includeKeywords) payload.q = String(request.includeKeywords);
  if (request.excludeKeywords) payload.excludeKeywords = String(request.excludeKeywords);
  if (request.exactFlag != null) payload.exactFlag = Boolean(request.exactFlag);

  // 搜索增长量/率
  if (request.rankGrowthValue != null) payload.rankGrowthValue = Number(request.rankGrowthValue);
  if (request.rankGrowthRate != null) payload.rankGrowthRate = Number(request.rankGrowthRate);

  // 范围筛选参数
  const rangeFields = [
    'minRankGrowthRate', 'maxRankGrowthRate',
    'minSearchRank', 'maxSearchRank',
    'minSearches', 'maxSearches',
    'minMonopolyClickRate', 'maxMonopolyClickRate',
    'minConversionRate', 'maxConversionRate',
    'minWordCount', 'maxWordCount',
    'minSPR', 'maxSPR',
    'minTitleDensity', 'maxTitleDensity',
    'minClicks', 'maxClicks',
    'minImpressions', 'maxImpressions'
  ];
  for (const field of rangeFields) {
    if (request[field] != null && request[field] !== '') {
      payload[field] = Number(request[field]);
    }
  }

  if (request.searchModel != null) payload.searchModel = Number(request.searchModel);

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent,
    referer: `${config.sellerSprite.baseUrl}/v3/aba-research/`
  };
  if (session.xToken) {
    headers['x-token'] = session.xToken;
  }

  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.abaResearchPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryAbaResearchWeekly(user, request) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAbaResearchWeekly(request, session);

  const rawData = raw && raw.data ? raw.data : raw;
  const transformed = sanitizeInternalFields(transformAbaResearchResponse(rawData, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAbaResearchWeekly };
