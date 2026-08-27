// marketId → marketplace 字符串映射
const MARKET_ID_TO_MARKETPLACE = {
  1: 'US', 2: 'UK', 3: 'DE', 4: 'FR', 5: 'JP',
  6: 'CA', 7: 'IT', 8: 'ES', 9: 'IN', 10: 'AU', 11: 'MX'
};

function toInt(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toFloat(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function transformItem(raw, marketplace) {
  if (!raw) return null;

  // marketId → marketplace 字符串
  const mp = marketplace || MARKET_ID_TO_MARKETPLACE[raw.marketId] || raw.marketId || 'US';

  return {
    marketplace: mp,
    keyword: raw.keyword || null,
    keywordCn: raw.keywordCn || null,
    keywordJp: raw.keywordJp || null,
    departments: Array.isArray(raw.departments) ? raw.departments : [],
    trends: Array.isArray(raw.trends) ? raw.trends : null,
    month: raw.month || null,
    supplement: raw.supplement || null,
    searches: toInt(raw.searches),
    purchases: toInt(raw.purchases),
    purchaseRate: toFloat(raw.purchaseRate),
    monopolyClickRate: toFloat(raw.monopolyClickRate),
    monopolyAsinDtos: Array.isArray(raw.monopolyAsinDtos) ? raw.monopolyAsinDtos : [],
    gkDatas: Array.isArray(raw.gkDatas) ? raw.gkDatas : [],
    products: toInt(raw.products),
    adProducts: toInt(raw.adProducts),
    supplyDemandRatio: toFloat(raw.supplyDemandRatio),
    avgPrice: toFloat(raw.avgPrice),
    // Open API 规范使用 avgRatings（评分数），原始接口字段为 avgReviews
    avgRatings: toInt(raw.avgReviews != null ? raw.avgReviews : raw.avgRatings),
    avgRating: toFloat(raw.avgRating),
    bidMin: toFloat(raw.bidMin),
    bidMax: toFloat(raw.bidMax),
    bid: toFloat(raw.bid),
    cvsShareRate: toFloat(raw.cvsShareRate),
    wordCount: toInt(raw.wordCount),
    titleDensity: toInt(raw.titleDensity),
    spr: toInt(raw.spr),
    relevancy: toFloat(raw.relevancy),
    absoluteRelevancy: toInt(raw.absoluteRelevancy),
    amazonChoice: raw.amazonChoice === true || raw.amazonChoice === 'true',
    searchRank: toInt(raw.searchRank),
    searchWeeklyRank: toInt(raw.searchWeeklyRank),
    clicks: toInt(raw.clicks),
    impressions: toInt(raw.impressions),
    phrasePpcItem: raw.phrasePpcItem || null,
    exactPpcItem: raw.exactPpcItem || null,
    broadPpcItem: raw.broadPpcItem || null
  };
}

/**
 * 将 /v3/api/keyword-miner 返回的 JSON 转换为规范格式。
 * @param {object} raw       - 第三方原始响应 data 字段
 * @param {object} request   - 原始请求参数
 */
function transformKeywordMinerResponse(raw, request) {
  const empty = {
    guestId: null,
    pages: 0,
    page: request.page || 1,
    size: request.size || 50,
    total: 0,
    took: 0,
    url: null,
    order: { field: request.orderField || '', desc: request.orderDesc !== false },
    items: [],
    terminal: null,
    hasNextPage: null,
    guestVisited: false
  };

  if (!raw || typeof raw !== 'object') return empty;

  const marketplace = request.marketplace || 'US';
  const items = Array.isArray(raw.items)
    ? raw.items.map(item => transformItem(item, marketplace)).filter(Boolean)
    : [];

  const total = toInt(raw.total);
  const page = toInt(raw.page) || request.page || 1;
  const size = toInt(raw.size) || request.size || 50;
  const pages = total && size ? Math.ceil(total / size) : 0;

  return {
    guestId: null,
    pages,
    page,
    size,
    total,
    took: 0,
    url: null,
    order: { field: request.orderField || '', desc: request.orderDesc !== false },
    items,
    terminal: null,
    hasNextPage: null,
    guestVisited: false
  };
}

module.exports = { transformKeywordMinerResponse };
