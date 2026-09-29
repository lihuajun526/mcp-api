/**
 * 将 /v3/api/aba-research 返回的 JSON 转换为 Open API 标准格式。
 * 按周 (aba_research_weekly) 和按月 (aba_research_monthly) 共用此转换器。
 *
 * 原始响应: { code, message, data: { page, size, total, items, ... } }
 * 输出格式: { guestId, pages, page, size, total, took, url, order, items, ... }
 */

function toInt(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toFloat(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeTop3Asin(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    asin: raw.asin || null,
    imageUrl: raw.imageUrl || raw.asinImage || null,
    clickRate: toFloat(raw.clickRate),
    conversionRate: toFloat(raw.conversionRate)
  };
}

// 官方返回 top3Brands 为 List<String>（品牌名列表）；兼容上游返回对象结构
function normalizeTop3Brand(raw) {
  if (raw == null) return null;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') return raw.brand || null;
  return null;
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    marketplace: raw.marketplace || null,
    date: raw.date || null,
    keyword: raw.keyword || null,
    keywordCn: raw.keywordCn || null,
    keywordJp: raw.keywordJp || null,
    departments: Array.isArray(raw.departments) ? raw.departments : [],
    searchRank: toInt(raw.searchRank),
    searchRankCv: toInt(raw.searchRankCv),
    searchRankCr: toInt(raw.searchRankCr),
    searches: toInt(raw.searches),
    purchaseRate: toFloat(raw.purchaseRate),
    purchases: toInt(raw.purchases),
    clicks: toInt(raw.clicks),
    impressions: toInt(raw.impressions),
    searchRankGrowthValue: toInt(raw.searchRankGrowthValue),
    searchRankGrowthRate: toFloat(raw.searchRankGrowthRate),
    cvsShareRate: toFloat(raw.cvsShareRate),
    clickShareRate: toFloat(raw.clickShareRate),
    titleDensityExact: toInt(raw.titleDensityExact),
    cprExact: toFloat(raw.cprExact),
    w1SearchRank: toInt(raw.w1SearchRank),
    w1RankGrowthValue: toInt(raw.w1RankGrowthValue),
    w1RankGrowthRate: toFloat(raw.w1RankGrowthRate),
    w4SearchRank: toInt(raw.w4SearchRank),
    w4RankGrowthValue: toInt(raw.w4RankGrowthValue),
    w4RankGrowthRate: toFloat(raw.w4RankGrowthRate),
    w12SearchRank: toInt(raw.w12SearchRank),
    w12RankGrowthValue: toInt(raw.w12RankGrowthValue),
    w12RankGrowthRate: toFloat(raw.w12RankGrowthRate),
    bid: toFloat(raw.bid),
    bidMax: toFloat(raw.bidMax),
    bidMin: toFloat(raw.bidMin),
    top3Brands: Array.isArray(raw.top3Brands)
      ? raw.top3Brands.map(normalizeTop3Brand).filter(Boolean)
      : [],
    top3AsinDtoList: Array.isArray(raw.top3AsinDtoList)
      ? raw.top3AsinDtoList.map(normalizeTop3Asin).filter(Boolean)
      : []
  };
}

function transformAbaResearchResponse(rawData, request) {
  const page = Math.max(Number(request.page) || 1, 1);
  const size = Math.min(Number(request.size) || 40, 40);

  const empty = {
    guestId: null,
    pages: 0,
    page,
    size,
    total: 0,
    took: 0,
    url: null,
    order: {
      field: request.orderField || 'searchfrequencyrank',
      desc: request.orderDesc !== false
    },
    items: [],
    terminal: null,
    hasNextPage: null,
    guestVisited: false
  };

  if (!rawData) return empty;

  const rawItems = Array.isArray(rawData.items) ? rawData.items : [];
  const total = toInt(rawData.total) || 0;
  const respPage = toInt(rawData.page) || page;
  const respSize = toInt(rawData.size) || size;
  const pages = total > 0 && respSize > 0 ? Math.ceil(total / respSize) : 0;

  const items = rawItems.map(normalizeItem).filter(Boolean);

  return {
    guestId: rawData.guestId || null,
    pages,
    page: respPage,
    size: respSize,
    total,
    took: rawData.took || 0,
    url: rawData.url || null,
    order: rawData.order || {
      field: request.orderField || 'searchfrequencyrank',
      desc: request.orderDesc !== false
    },
    items,
    terminal: rawData.terminal || null,
    hasNextPage: respPage < pages,
    guestVisited: rawData.guestVisited || false
  };
}

module.exports = { transformAbaResearchResponse };
