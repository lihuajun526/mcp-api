function toInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toFloat(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function get(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return null;
}

// 将 UPPER_SNAKE_CASE badge 转为 camelCase（与 trafficKeywordTransformer 一致）
function convertBadge(badge) {
  if (!badge || typeof badge !== 'string') return badge;
  return badge.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformPosition(pos) {
  if (!pos || typeof pos !== 'object') return null;
  return {
    page: toInt(pos.page),
    pageSize: toInt(pos.pageSize),
    index: toInt(pos.index),
    position: toInt(pos.position),
    updatedTime: pos.updatedTime != null ? Number(pos.updatedTime) : null
  };
}

function transformRelationVariationItem(item) {
  if (!item) return null;
  return {
    marketplace: item.market || item.marketplace || null,
    asin: item.asin || null,
    imageUrl: item.imageUrl || null,
    trafficPercentage: toFloat(item.trafficPercentage),
    title: item.title || null,
    price: toFloat(item.price),
    reviews: toFloat(item.reviews),
    rating: toFloat(item.rating)
  };
}

function transformItem(item) {
  if (!item) return null;
  return {
    keyword: get(item, 'keywords', 'keyword'),
    keywordCn: get(item, 'keywordCn') || null,
    searches: toInt(get(item, 'searches')),
    products: toInt(get(item, 'products')),
    purchases: toInt(get(item, 'purchases')),
    purchaseRate: toFloat(get(item, 'purchaseRate')),
    bid: toFloat(get(item, 'bid')),
    bidMax: toFloat(get(item, 'bidMax')),
    bidMin: toFloat(get(item, 'bidMin')),
    badges: Array.isArray(item.badges) ? item.badges.map(convertBadge) : [],
    rankPosition: transformPosition(item.rankPosition),
    adPosition: transformPosition(item.adPosition),
    updatedTime: item.updatedTime != null ? Number(item.updatedTime) : null,
    searchesRank: toInt(get(item, 'searchesRank')),
    searchesRankTimeFrom: item.searchesRankTimeFrom != null ? Number(item.searchesRankTimeFrom) : null,
    searchesRankTimeTo: item.searchesRankTimeTo != null ? Number(item.searchesRankTimeTo) : null,
    latest1daysAds: toInt(get(item, 'latest1daysAds')),
    latest7daysAds: toInt(get(item, 'latest7daysAds')),
    latest30daysAds: toInt(get(item, 'latest30daysAds')),
    supplyDemandRatio: toFloat(get(item, 'supplyDemandRatio')),
    trafficPercentage: toFloat(get(item, 'trafficPercentage')),
    calculatedWeeklySearches: toFloat(get(item, 'calculatedWeeklySearches')),
    avgPrice: toFloat(get(item, 'avgPrice')),
    // Open API 规范使用 avgRatings（评分数），原始字段为 avgReviews
    avgRatings: toInt(get(item, 'avgReviews', 'avgRatings')),
    avgRating: toFloat(get(item, 'avgRating')),
    titleDensity: toInt(get(item, 'titleDensityExact', 'titleDensity')),
    spr: toInt(get(item, 'cprExact', 'spr')),
    monopolyClickRate: toFloat(get(item, 'monopolyClickRate')),
    top3ClickingRate: toFloat(get(item, 'top3ClickingRate')),
    top3ConversionRate: toFloat(get(item, 'top3ConversionRate')),
    relationVariationsItems: Array.isArray(item.relationVariationsItems)
      ? item.relationVariationsItems.map(transformRelationVariationItem).filter(Boolean)
      : []
  };
}

/**
 * 将 /v3/api/traffic/extend/asin 返回的 JSON 转换为规范格式。
 * @param {object} raw     - 第三方原始响应 data 字段
 * @param {object} request - 原始请求参数
 */
function transformTrafficExtendResponse(raw, request) {
  const empty = {
    marketplace: (request && request.marketplace) || null,
    asinList: (request && request.asinList) || [],
    pages: 0,
    page: request.page || 1,
    size: request.size || 50,
    total: 0,
    order: {
      field: request.orderField || '',
      desc: request.orderDesc !== false
    },
    items: []
  };

  if (!raw || typeof raw !== 'object') return empty;

  const items = Array.isArray(raw.items)
    ? raw.items.map(transformItem).filter(Boolean)
    : [];

  const total = toInt(raw.total);
  const page = toInt(raw.page) || request.page || 1;
  const size = toInt(raw.size) || request.size || 50;
  const pages = total && size ? Math.ceil(total / size) : 0;

  return {
    marketplace: (request && request.marketplace) || null,
    asinList: Array.isArray(raw.asinList) ? raw.asinList : (request.asinList || []),
    pages,
    page,
    size,
    total,
    order: {
      field: request.orderField || '',
      desc: request.orderDesc !== false
    },
    items
  };
}

module.exports = { transformTrafficExtendResponse };
