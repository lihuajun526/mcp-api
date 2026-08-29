/**
 * 将 /v3/api/keyword-conv 返回的 JSON 转换为 Open API 标准格式 (keyword_conversion)。
 *
 * 原始响应: { code, message, data: { pager: { total, pageNum, pageSize, items, ... } } }
 * 输出格式: { guestId, pages, page, size, total, took, url, order, items }
 */

function toFloat(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toInt(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function normalizeValueItem(obj) {
  if (!obj || typeof obj !== 'object') return null;
  return {
    value: toFloat(obj.value),
    min: toFloat(obj.min),
    max: toFloat(obj.max)
  };
}

function normalizeTop3Asin(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    asin: raw.asin || null,
    title: raw.asinUrl || raw.asinTitle || raw.title || null,
    imageUrl: raw.asinImage || raw.imageUrl || null,
    price: toFloat(raw.asinPrice != null ? raw.asinPrice : raw.price),
    reviews: toInt(raw.asinReviews != null ? raw.asinReviews : raw.reviews),
    rating: toFloat(raw.asinRating != null ? raw.asinRating : raw.rating),
    rankPage: toInt(raw.rankPage),
    rankIndex: toInt(raw.rankIndex),
    position: toInt(raw.position),
    products: toInt(raw.products)
  };
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    keyword: raw.keyword || null,
    keywordCn: raw.keywordCn || null,
    keywordJp: raw.keywordJp || null,
    searches: toInt(raw.searches),
    clicks: toInt(raw.clicks),
    purchases: toInt(raw.purchases),
    searchConvRate: toFloat(raw.searchConvRate),
    clickConvRate: toFloat(raw.clickConvRate),
    searchesTrend: raw.searchesTrend || null,
    clickTrend: raw.clickTrend || null,
    purchaseTrend: raw.purchaseTrend || null,
    clickingRate: toFloat(raw.clickingRate),
    conversionRate: toFloat(raw.conversionRate),
    phraseCount: toInt(raw.phraseCount),
    phrasePpc: normalizeValueItem(raw.phrasePpc),
    exactPpc: normalizeValueItem(raw.exactPpc),
    broadPpc: normalizeValueItem(raw.broadPpc),
    phraseCpa: normalizeValueItem(raw.phraseCpa),
    exactCpa: normalizeValueItem(raw.exactCpa),
    broadCpa: normalizeValueItem(raw.broadCpa),
    avgProductPrice: normalizeValueItem(raw.avgProductPrice),
    phraseBudget: normalizeValueItem(raw.phraseBudget),
    exactBudget: normalizeValueItem(raw.exactBudget),
    broadBudget: normalizeValueItem(raw.broadBudget),
    phraseAcos: normalizeValueItem(raw.phraseAcos),
    exactAcos: normalizeValueItem(raw.exactAcos),
    broadAcos: normalizeValueItem(raw.broadAcos),
    top3Asins: Array.isArray(raw.top3Asins)
      ? raw.top3Asins.map(normalizeTop3Asin).filter(Boolean)
      : [],
    top10Asins: Array.isArray(raw.top10Asins)
      ? raw.top10Asins.map(normalizeTop3Asin).filter(Boolean)
      : []
  };
}

function transformKeywordConversionResponse(pager, request) {
  const page = Math.max(Number(request.page) || 1, 1);
  const size = Math.min(Number(request.size) || 100, 100);

  const empty = {
    guestId: null,
    pages: 0,
    page,
    size,
    total: 0,
    took: 0,
    url: null,
    order: { field: '', desc: true },
    items: [],
    terminal: null,
    hasNextPage: null,
    guestVisited: false
  };

  if (!pager) return empty;

  const rawItems = Array.isArray(pager.items) ? pager.items : [];
  const total = toInt(pager.total) || 0;
  const respPage = toInt(pager.pageNum != null ? pager.pageNum : pager.page) || page;
  const respSize = toInt(pager.pageSize != null ? pager.pageSize : pager.size) || size;
  const pages = total > 0 && respSize > 0 ? Math.ceil(total / respSize) : 0;

  const items = rawItems.map(normalizeItem).filter(Boolean);

  return {
    guestId: null,
    pages,
    page: respPage,
    size: respSize,
    total,
    took: 0,
    url: null,
    order: { field: '', desc: request.orderDesc !== false },
    items,
    terminal: null,
    hasNextPage: respPage < pages,
    guestVisited: false
  };
}

module.exports = { transformKeywordConversionResponse };
