const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformGoogleTrendResponse } = require('../../transformers/googleTrendTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'GOOGLE_TREND';

// marketplace 公开代码 → 第三方 station 代码 (US→COM)
const MARKET_CODE_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

async function fetchGoogleTrend(request, session) {
  const station = MARKET_CODE_MAP[request.marketplace] || request.marketplace;

  // gprop: '' = 网页搜索, 'froogle' = 购物搜索
  const gprop = request.googleProp === 'shoppingCart' ? 'froogle' : '';

  // intervalYear 默认 5 年
  const intervalYear = Number(request.intervalYear) || 5;

  // monthly 默认 false
  const monthly = request.monthly === true || request.monthly === 'true';

  // 按照 curl 顺序拼接参数，与服务端期望一致
  const params = {
    gprop,
    intervalYear,
    gv: false,
    monthly,
    parentModule: ' ',
    dynamic: ' ',
    station,
    keyword: request.keyword || ''
  };

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
    'user-agent': session.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',
    'x-requested-with': 'XMLHttpRequest'
  };

  return upstreamClient.get(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.googleTrendPath}`,
    { params, headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryGoogleTrend(user, request) {
  if (!request || !request.marketplace) {
    throw new BusinessError('marketplace 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchGoogleTrend(request, session);

  const rawData = raw && raw.data ? raw.data : raw;
  const transformed = sanitizeInternalFields(transformGoogleTrendResponse(rawData, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryGoogleTrend };
