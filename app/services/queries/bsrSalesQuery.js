const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformBsrSalesResponse } = require('../../transformers/bsrSalesTransformer');
const { retryOnUpstreamError } = require('../../utils/retry');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'bsr_prediction';

async function fetchBsrSales(params, session) {
  // marketplace 仅供 transformer 使用，不发往上游
  const { marketplace, ...fields } = params;

  const body = new URLSearchParams();
  body.append('station', fields.station);
  body.append('cid', fields.cid);
  body.append('bsr', fields.bsr);
  if (session.gtk) {
    body.append('gtk', session.gtk);
  }

  const headers = {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest',
    cookie: session.cookie || '',
    'user-agent': config.sellerSprite.userAgent,
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"'
  };

  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.bsrSalesPath}`,
    body.toString(),
    { headers, timeout: config.sellerSprite.timeoutMs },
    { onSetCookie: (sc) => sessionService.syncSessionCookie(PROVIDER, session.field, session.cookie, sc) }
  );
}

async function queryBsrSales(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) {
    return cached;
  }

  const raw = await retryOnUpstreamError(async () => {
    const session = await sessionService.pickSession(PROVIDER);
    return fetchBsrSales(params, session);
  });
  const transformed = sanitizeInternalFields(transformBsrSalesResponse(raw, params));

  const pricing = await billingService.getPricing(ENDPOINT_CODE);
  await billingService.deductAndRecord(user, pricing, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryBsrSales };
