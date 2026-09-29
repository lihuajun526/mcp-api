const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_COMPETITOR';

async function fetchAsinCompetitor(request, session) {
  const payload = {
    market: request.marketplace,  // 上游字段名为 market（与 competitor_lookup 一致）
    monthName: request.month ? 'bsr_sales_monthly_' + request.month : 'bsr_sales_nearly',
    asins: [request.asin],
    page: 1,
    size: request.size || 20,
    symbolFlag: false,
    nodeIdPaths: [],
    order: { field: 'total_units', desc: true },
    lowPrice: 'N'
  };

  const headers = {
    accept: 'application/json, text/plain, */*',
    origin: 'https://www.sellersprite.com',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent
  };
  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.competingLookupPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryAsinCompetitor(user, request) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinCompetitor(request, session);
  // 官方 /api/62 返回结构为数组（非分页信封），仅取 items 字段
  const paged = transformCompetitionResponse(raw, request);
  const transformed = sanitizeInternalFields(paged.items || []);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAsinCompetitor };
