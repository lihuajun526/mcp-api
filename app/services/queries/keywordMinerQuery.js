const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformKeywordMinerResponse } = require('../../transformers/keywordMinerTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'keyword_miner';

async function fetchKeywordMiner(params, session) {
  // marketplace / order 仅供 transformer 使用，不发往上游
  const { marketplace, order, ...payload } = params;

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'content-type': 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent,
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

async function queryKeywordMiner(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchKeywordMiner(params, session);

  // 第三方返回格式: { code, message, data: { page, size, total, items } }
  const rawData = raw && raw.data ? raw.data : raw;
  const transformed = sanitizeInternalFields(transformKeywordMinerResponse(rawData, params));

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryKeywordMiner };
