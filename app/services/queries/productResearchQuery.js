const axios = require('axios');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformCompetitionResponse } = require('../../transformers/competitionTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'PRODUCT_RESEARCH';

// 将 open API month（YYYYMM 或 YYYY-MM）映射为内部 monthName
function toMonthName(month) {
  if (!month) return 'bsr_sales_nearly';
  return String(month).replace('-', '');
}

async function fetchProductResearch(request, session) {
  // 基础 payload
  const payload = {
    market: request.marketplace,
    monthName: toMonthName(request.month),
    page: request.page || 1,
    size: request.size || 50,
    symbolFlag: request.variation === 'Y' ? true : false,
    selectType: '2',
    filterSub: request.filterSub === true || request.filterSub === 'Y',
    weightUnit: request.weightUnit || 'g',
    order: {
      field: request.orderField || 'total_units',
      desc: request.orderDesc !== undefined ? request.orderDesc : true
    },
    productTags: [],
    nodeIdPaths: Array.isArray(request.nodeIdPaths) ? request.nodeIdPaths
      : (request.nodeIdPath ? [request.nodeIdPath] : []),
    sellerTypes: [],
    eligibility: [],
    pkgDimensionTypeList: [],
    sellerNationList: [],
    lowPrice: 'N'
  };

  // 关键词过滤
  if (request.keyword) payload.keywords = request.keyword;
  if (request.matchType !== undefined) payload.matchType = request.matchType;
  if (request.excludeKeywords) payload.excludeKeywords = request.excludeKeywords;

  // 品牌过滤
  if (request.includeBrands) payload.includeBrands = request.includeBrands;
  if (request.excludeBrands) payload.excludeBrands = request.excludeBrands;

  // 卖家过滤
  if (request.includeSellers) payload.includeSellers = request.includeSellers;
  if (request.excludeSellers) payload.excludeSellers = request.excludeSellers;

  // 配送方式 → sellerTypes 数组
  if (request.fulfillment) {
    payload.sellerTypes = String(request.fulfillment).split(',').map((s) => s.trim()).filter(Boolean);
  }

  // 卖家国籍 → sellerNationList 数组
  if (request.sellerNation) {
    payload.sellerNationList = String(request.sellerNation).split(',').map((s) => s.trim()).filter(Boolean);
  }

  // 尺寸类型 → pkgDimensionTypeList 数组
  if (request.dimensionType) {
    payload.pkgDimensionTypeList = String(request.dimensionType).split(',').map((s) => s.trim()).filter(Boolean);
  }

  // 类目精确/模糊查询
  if (request.nodeIdPathEqual !== undefined) payload.nodeIdPathEqual = request.nodeIdPathEqual;

  // Badge 过滤
  const tags = [];
  if (request.badgeBS === 'Y') tags.push('BEST_SELLER');
  if (request.badgeAC === 'Y') tags.push('AMAZON_CHOICE');
  if (request.badgeNR === 'Y') tags.push('NEW_RELEASE');
  if (tags.length) payload.productTags = tags;

  // 上架月份
  if (request.availableMonth !== undefined) payload.availableMonth = request.availableMonth;

  // 范围过滤参数（直接透传）
  const rangeFields = [
    'minPrice', 'maxPrice',
    'minRating', 'maxRating',
    'minRatings', 'maxRatings',
    'minRatingsCv', 'maxRatingsCv',
    'minSellers', 'maxSellers',
    'minProfit', 'maxProfit',
    'minBsr', 'maxBsr',
    'minBsrCv', 'maxBsrCv',
    'minBsrCr', 'maxBsrCr',
    'minUnits', 'maxUnits',
    'minAmzUnit', 'maxAmzUnit',
    'minRevenue', 'maxRevenue',
    'minRevenueCr', 'maxRevenueCr',
    'minUnitsCr', 'maxUnitsCr',
    'minWeights', 'maxWeights',
    'minVariations', 'maxVariations',
    'minSubBsrRank', 'maxSubBsrRank',
    'minFba', 'maxFba',
    'minLqs', 'maxLqs'
  ];
  for (const key of rangeFields) {
    if (request[key] != null && request[key] !== '') {
      payload[key] = request[key];
    }
  }

  const headers = {
    accept: session.accept || 'application/json, text/plain, */*',
    'accept-language': session.acceptLanguage || 'zh-CN,zh;q=0.9',
    'content-type': session.contentType || 'application/json;charset=UTF-8',
    cookie: session.cookie || '',
    'user-agent': session.userAgent || 'Mozilla/5.0'
  };
  const resp = await axios.post(
    `${config.sellerSprite.baseUrl}${config.sellerSprite.productResearchPath}`,
    payload,
    { headers, timeout: config.sellerSprite.timeoutMs }
  );
  return resp.data;
}

async function queryProductResearch(user, request) {
  if (!request || !request.marketplace) {
    throw new BusinessError('marketplace 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchProductResearch(request, session);
  const transformed = transformCompetitionResponse(raw, request);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryProductResearch };
