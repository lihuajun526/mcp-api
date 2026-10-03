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

// 官方 badge 为固定 5 个子字段的对象，统一归一化，避免上游额外字段泄漏
const BADGE_FIELDS = ['bestSeller', 'amazonChoice', 'newRelease', 'ebc', 'video'];

function normalizeBadge(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const badge = {};
  for (const field of BADGE_FIELDS) {
    badge[field] = raw[field] != null ? raw[field] : null;
  }
  return badge;
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    asin: raw.asin || null,
    brand: raw.brand || null,
    brandUrl: raw.brandUrl || null,
    imageUrl: raw.imageUrl || null,
    title: raw.title || null,
    parent: raw.parent || null,
    nodeId: toInt(raw.nodeId),
    nodeIdPath: raw.nodeIdPath || null,
    nodeLabelPath: raw.nodeLabelPath || null,
    bsrId: raw.bsrId || null,
    bsr: toInt(raw.bsr),
    units: toInt(raw.units),
    unitsCr: toFloat(raw.unitsCr != null ? raw.unitsCr : raw.unitsGr),
    revenue: toFloat(raw.revenue),
    price: toFloat(raw.price),
    profit: toFloat(raw.profit),
    fba: toFloat(raw.fba),
    ratings: toInt(raw.ratings),
    ratingsRate: toFloat(raw.ratingsRate),
    rating: toFloat(raw.rating),
    ratingsCv: toInt(raw.ratingsCv),
    ratingDelta: toInt(raw.ratingDelta),
    availableDate: raw.availableDate || null,
    fulfillment: raw.fulfillment || null,
    variations: toInt(raw.variations),
    sellers: toInt(raw.sellers),
    sellerId: raw.sellerId || null,
    sellerName: raw.sellerName || null,
    sellerNation: raw.sellerNation || null,
    badge: normalizeBadge(raw.badge),
    weight: raw.weight || null,
    dimension: raw.dimension || raw.dimensions || null,
    dimensionType: raw.dimensionType || raw.dimensionsType || null,
    sku: raw.sku || null
  };
}

/**
 * 将 /v3/api/relation/traffic 返回的分页 JSON 转换为 Open API 标准格式。
 * @param {object} rawData - 第三方响应 data 字段 (含 pagerDto 或直接含 items)
 * @param {object} request - 原始请求参数
 */
function transformTrafficListingResponse(rawData, request) {
  const page = Number(request.page) || 1;
  const size = Number(request.size) || 50;

  const empty = {
    page,
    size,
    total: 0,
    pages: 0,
    items: [],
    order: {
      field: request.orderField || 'relationCount',
      desc: request.orderDesc !== false
    }
  };

  if (!rawData) return empty;

  // 第三方响应可能将分页信息放在 pagerDto 中
  const pager = rawData.pagerDto || rawData;
  const rawItems = Array.isArray(pager.items)
    ? pager.items
    : (Array.isArray(rawData.items) ? rawData.items : []);

  const total = toInt(pager.total) || 0;
  const respPage = toInt(pager.page || pager.pageNum) || page;
  const respSize = toInt(pager.size || pager.pageSize) || size;
  const pages = total > 0 && respSize > 0 ? Math.ceil(total / respSize) : 0;

  return {
    page: respPage,
    size: respSize,
    total,
    pages,
    items: rawItems.map(normalizeItem).filter(Boolean),
    order: {
      field: request.orderField || 'relationCount',
      desc: request.orderDesc !== false
    }
  };
}

module.exports = { transformTrafficListingResponse };
