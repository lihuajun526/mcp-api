const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinDetailResponse } = require('../../transformers/asinDetailTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'asin_detail';

// marketplace 公开代码 → Amazon 站点域名
const MARKETPLACE_DOMAIN = {
  US: 'www.amazon.com',
  CA: 'www.amazon.ca',
  MX: 'www.amazon.com.mx',
  UK: 'www.amazon.co.uk',
  DE: 'www.amazon.de',
  FR: 'www.amazon.fr',
  IT: 'www.amazon.it',
  ES: 'www.amazon.es',
  JP: 'www.amazon.co.jp',
  IN: 'www.amazon.in',
  AU: 'www.amazon.com.au'
};

async function fetchAsinDetail(params, session) {
  // marketplace 仅供后处理使用，不发往上游
  const { marketplace, ...payload } = params;

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
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

async function queryAsinDetail(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinDetail(params, session);
  const transformed = sanitizeInternalFields(transformAsinDetailResponse(raw));
  if (transformed && !transformed.marketplace) {
    transformed.marketplace = params.marketplace;
  }
  if (transformed && !transformed.asinUrl && transformed.asin) {
    const domain = MARKETPLACE_DOMAIN[transformed.marketplace] || 'www.amazon.com';
    transformed.asinUrl = `https://${domain}/dp/${transformed.asin}`;
  }

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryAsinDetail };
