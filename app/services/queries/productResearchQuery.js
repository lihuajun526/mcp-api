const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'PRODUCT_RESEARCH';

// 将 open API month（YYYYMM 或 YYYY-MM）映射为内部 monthName
function toMonthName(month) {
  if (!month) return 'bsr_sales_nearly';
  return String(month).replace('-', '');
}

async function fetchProductResearch(request, session) {
  const headers = {
    accept: 'application/json, text/plain, */*',
    origin: 'https://www.sellersprite.com',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent
  };
  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.productResearchPath}`,
    request,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryProductResearch(user, request) {

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchProductResearch(request, session);
  const transformed = sanitizeInternalFields(transformCompetitionResponse(raw, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryProductResearch };
