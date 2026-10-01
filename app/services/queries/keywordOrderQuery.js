const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformKeywordOrderResponse } = require('../../transformers/keywordOrderTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'KEYWORD_ORDER';

// marketplace 公开代码 → station 代码 (出单词反查页面使用公开站点代码)
const MARKET_STATION_MAP = {
  US: 'US', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

async function fetchKeywordOrder(request, session) {
  const station = MARKET_STATION_MAP[request.marketplace] || request.marketplace;
  const page = Math.max(Number(request.page) || 1, 1);
  const reverseType = request.reverseType || 'W';
  const date = request.date || '';

  // 根据 reverseType 和 date 构造表名
  let table = '';
  let monthlyTable = '';
  if (reverseType === 'W' && date) {
    table = `ara_${date}`;
  } else if (reverseType === 'M' && date) {
    monthlyTable = `ara_${date}`;
  }

  // ASINs: 支持数组或单个字符串
  const asins = Array.isArray(request.asins) ? request.asins : [request.asins];
  const textareaValue = asins.join(',');

  const params = {
    station,
    table,
    monthlyTable,
    asin: '',
    'order.field': request.orderField || 'searchRank',
    'order.desc': request.orderDesc != null ? String(request.orderDesc) : 'false',
    conversionType: Array.isArray(request.conversionType)
      ? request.conversionType.join(',')
      : (request.conversionType || ''),
    loadVariations: request.variation === 'N' ? 'true' : 'false',
    reverseType,
    textareaValue,
    page
  };

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || config.sellerSprite.userAgent,
    referer: `${config.sellerSprite.baseUrl}${config.sellerSprite.keywordOrderPath}`
  };

  return upstreamClient.get(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.keywordOrderPath}`,
    { params, headers, timeout: config.sellerSprite.timeoutMs },
    { expectHtml: true }
  );
}

async function queryKeywordOrder(user, request) {
  if (Array.isArray(request.asins) && request.asins.length > 20) {
    throw new BusinessError('asins 最多支持 20 个', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const html = await fetchKeywordOrder(request, session);
  const transformed = sanitizeInternalFields(transformKeywordOrderResponse(html, request));

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryKeywordOrder };
