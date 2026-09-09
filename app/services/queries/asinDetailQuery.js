const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinDetailResponse } = require('../../transformers/asinDetailTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_DETAIL';

async function fetchAsinDetail(request, session) {
  const payload = {
    market: request.marketplace,
    monthName: 'bsr_sales_nearly',
    asins: [request.asin],
    page: 1,
    size: 60,
    symbolFlag: true,
    nodeIdPaths: [],
    order: { field: 'amz_unit', desc: true },
    lowPrice: 'N'
  };
  const headers = {
    accept: session.accept || 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9',
    'content-type': session.contentType || 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0'
  };
  return upstreamClient.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.competingLookupPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryAsinDetail(user, request) {
  if (!request || !request.marketplace || !request.asin) {
    throw new BusinessError('marketplace和asin不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) {
    return cached;
  }

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchAsinDetail(request, session);
  const transformed = sanitizeInternalFields(transformAsinDetailResponse(raw));
  for (const item of transformed.items || []) {
    if (!item.marketplace) {
      item.marketplace = request.marketplace;
    }
    if (!item.asinUrl && item.asin) {
      item.asinUrl = `https://www.amazon.com/dp/${item.asin}`;
    }
  }

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAsinDetail };
