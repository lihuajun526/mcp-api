const axios = require('axios');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'COMPETING_LOOKUP';

// 将 open API month（YYYYMM）映射为内部 monthName
function toMonthName(month) {
  if (!month) return 'bsr_sales_nearly';
  return String(month).replace('-', '');
}

async function fetchCompetingLookup(request, session) {
  const asins = Array.isArray(request.asins) ? request.asins : (request.asins ? [request.asins] : []);
  const nodeIdPaths = request.nodeIdPath ? [request.nodeIdPath] : (request.nodeIdPaths || []);

  const payload = {
    market: request.marketplace,
    monthName: toMonthName(request.month),
    asins,
    keywords: request.keyword || request.keywords || '',
    page: request.page || 1,
    size: request.size || 50,
    symbolFlag: false,
    nodeIdPaths,
    order: {
      field: request.orderField || 'total_units',
      desc: request.orderDesc !== undefined ? request.orderDesc : true
    },
    lowPrice: request.lowPrice || 'N'
  };

  // 可选参数
  if (request.brand) payload.brand = request.brand;
  if (request.sellerName) payload.sellerName = request.sellerName;
  if (request.nodeIdPathEqual !== undefined) payload.nodeIdPathEqual = request.nodeIdPathEqual;
  if (request.matchType !== undefined) payload.matchType = request.matchType;
  // variation=Y 不含变体 → symbolFlag=true（仅展示父体/畅销变体）
  if (request.variation === 'Y') payload.symbolFlag = true;

  const headers = {
    accept: session.accept || 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9',
    'content-type': session.contentType || 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0'
  };
  const resp = await axios.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.competingLookupPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
  return resp.data;
}

async function queryCompetingLookup(user, request) {
  if (!request || !request.marketplace) {
    throw new BusinessError('marketplace 不能为空', 400);
  }
  if (request.asins && !Array.isArray(request.asins)) {
    request.asins = [request.asins];
  }
  if (request.asins && request.asins.length > 40) {
    throw new BusinessError('单次查询ASIN数量不能超过40个', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchCompetingLookup(request, session);
  const transformed = transformCompetitionResponse(raw, request);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryCompetingLookup };
