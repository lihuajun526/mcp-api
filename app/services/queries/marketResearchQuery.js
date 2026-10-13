const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformMarketResearchResponse } = require('../../transformers/marketResearchTransformer');
const { retryOnUpstreamError } = require('../../utils/retry');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'market_research';

async function fetchMarketResearch(params, session) {
  // marketplace 仅供 transformer 使用，不发往上游
  const { marketplace, ...upstreamParams } = params;

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    cookie: session.cookie || '',
    'user-agent': config.sellerSprite.userAgent,
    // referer: `${config.sellerSprite.baseUrl}${config.sellerSprite.marketResearchPath}`,
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"'
  };

  return upstreamClient.get(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.marketResearchPath}`,
    { params: upstreamParams, headers, timeout: config.sellerSprite.timeoutMs },
    {
      expectHtml: true,
      onSetCookie: (sc) => sessionService.syncSessionCookie(PROVIDER, session.field, session.cookie, sc)
    }
  );
}

async function queryMarketResearch(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) return cached;

  const html = await retryOnUpstreamError(async () => {
    const session = await sessionService.pickSession(PROVIDER);
    return fetchMarketResearch(params, session);
  });
  const transformed = sanitizeInternalFields(transformMarketResearchResponse(html, params));

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryMarketResearch };
