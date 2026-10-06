const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformKeywordOrderResponse } = require('../../transformers/keywordOrderTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'keyword_order';

async function fetchKeywordOrder(params, session) {
  // marketplace 仅供 transformer 使用，不发往上游
  const { marketplace, ...upstreamParams } = params;

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent,
    referer: `${config.sellerSprite.baseUrl}${config.sellerSprite.keywordOrderPath}`
  };

  return upstreamClient.get(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.keywordOrderPath}`,
    { params: upstreamParams, headers, timeout: config.sellerSprite.timeoutMs },
    { expectHtml: true }
  );
}

async function queryKeywordOrder(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const html = await fetchKeywordOrder(params, session);
  const transformed = sanitizeInternalFields(transformKeywordOrderResponse(html, params));

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryKeywordOrder };
