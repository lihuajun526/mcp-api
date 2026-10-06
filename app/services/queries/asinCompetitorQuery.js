const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'asin_competitor';

async function fetchAsinCompetitor(params, session) {
  // marketplace 仅供 transformer 使用，不发往上游
  const { marketplace, ...payload } = params;

  const headers = {
    accept: 'application/json, text/plain, */*',
    origin: 'https://www.sellersprite.com',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
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

async function queryAsinCompetitor(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinCompetitor(params, session);
  // 官方 /api/62 返回结构为数组（非分页信封），仅取 items 字段
  const paged = transformCompetitionResponse(raw, params);
  const transformed = sanitizeInternalFields(paged.items || []);

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryAsinCompetitor };
