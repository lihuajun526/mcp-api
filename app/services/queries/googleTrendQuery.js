const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformGoogleTrendResponse } = require('../../transformers/googleTrendTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'GOOGLE_TREND';

async function fetchGoogleTrend(params, session) {
  // marketplace 仅供 transformer 使用，不发往上游
  const { marketplace, ...upstreamParams } = params;

  const headers = {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    cookie: session.cookie || '',
    priority: 'u=1, i',
    referer: `${config.sellerSprite.baseUrl}/v2/keyword-research`,
    'sec-ch-ua': '"Not=A?Brand";v="99", "Microsoft Edge";v="151", "Chromium";v="151"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': session.userAgent || config.sellerSprite.userAgent,
    'x-requested-with': 'XMLHttpRequest'
  };

  return upstreamClient.get(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.googleTrendPath}`,
    { params: upstreamParams, headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryGoogleTrend(user, params) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, params);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchGoogleTrend(params, session);

  const rawData = raw && raw.data ? raw.data : raw;
  const transformed = sanitizeInternalFields(transformGoogleTrendResponse(rawData, params));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, params, transformed);
  return transformed;
}

module.exports = { queryGoogleTrend };
