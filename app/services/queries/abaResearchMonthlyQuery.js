const axios = require('axios');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAbaResearchResponse } = require('../../transformers/abaResearchTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ABA_RESEARCH_MONTHLY';

// marketplace 公开代码 → 第三方 market 代码 (US→COM)
const MARKET_CODE_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

async function fetchAbaResearchMonthly(request, session) {
  const market = MARKET_CODE_MAP[request.marketplace] || request.marketplace;
  const page = Math.max(Number(request.page) || 1, 1);
  const size = Math.min(Number(request.size) || 15, 15);

  const payload = {
    market,
    reverseType: 'M',
    movementMarket: '',
    page,
    size,
    departments: Array.isArray(request.departments) ? request.departments : [],
    keywordBidMatchType: 'exact',
    order: {
      field: request.orderField || 'searchfrequencyrank',
      desc: request.orderDesc !== false
    }
  };

  // 日期 (按月: yyyyMM 格式, 转为表名 ara_YYYYMM)
  if (request.date) {
    payload.table = `ara_${request.date}`;
  }

  // 关键词筛选
  if (request.includeKeywords) payload.q = String(request.includeKeywords);
  if (request.excludeKeywords) payload.excludeKeywords = String(request.excludeKeywords);
  if (request.exactFlag != null) payload.exactFlag = Boolean(request.exactFlag);

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
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0',
    referer: `${config.sellerSprite.baseUrl}/v3/aba-research/`
  };
  if (session.xToken) {
    headers['x-token'] = session.xToken;
  }

  const resp = await axios.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.abaResearchPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
  return resp.data;
}

async function queryAbaResearchMonthly(user, request) {
  if (!request || !request.marketplace) {
    throw new BusinessError('marketplace 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAbaResearchMonthly(request, session);

  const rawData = raw && raw.data ? raw.data : raw;
  const transformed = transformAbaResearchResponse(rawData, request);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAbaResearchMonthly };
