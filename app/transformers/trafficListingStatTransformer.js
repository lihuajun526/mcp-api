function toInt(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/**
 * 将 /v3/api/relation/multi-stat-traffics 返回的 JSON 转换为 Open API 标准格式。
 * @param {object} rawData - 第三方响应 data 字段
 * @param {object} request - 原始请求参数
 */
function transformTrafficListingStatResponse(rawData, request) {
  if (!rawData) {
    return {
      marketplace: request.marketplace || null,
      asin: null,
      relations: null,
      freeRelations: null,
      paidRelations: null,
      calcTime: null,
      items: []
    };
  }

  const rawItems = Array.isArray(rawData.items) ? rawData.items : [];
  const items = rawItems.map(item => ({
    relation: item.relation ? String(item.relation).toLowerCase() : null,
    count: toInt(item.nums != null ? item.nums : item.count)
  }));

  return {
    marketplace: request.marketplace || null,
    asin: rawData.asin || null,
    relations: toInt(rawData.relations),
    freeRelations: toInt(rawData.freeRelations),
    paidRelations: toInt(rawData.paidRelations),
    calcTime: rawData.lastCalcTime || null,
    items
  };
}

module.exports = { transformTrafficListingStatResponse };
