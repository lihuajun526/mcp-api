function toInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toFloat(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function get(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) {
      return obj[k];
    }
  }
  return null;
}

// Convert UPPER_SNAKE_CASE badge codes to camelCase (e.g. NATURAL_SEARCHING -> naturalSearching)
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

/**
 * 将第三方 /v3/api/relation/reversing 响应转换为 ASIN 反查关键词 MCP 输出结构。
 * 输出字段参考 open.sellersprite.com ASIN 反查关键词接口：
 * marketplace / asin / total / items / stats
 */
function transformAsinReversingResponse(root, request) {
  const data = root && root.data ? root.data : {};

  const items = Array.isArray(data.items)
    ? data.items.map((item) => {
        const top10Asin = get(item, 'top10Asin');
        return {
          keyword: get(item, 'keywords'),
          keywordCn: get(item, 'keywordCn'),
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
          trafficKeywordType: item.trafficKeywordTypes !== undefined ? item.trafficKeywordTypes : null,
          conversionKeywordType: item.conversionKeywordTypes !== undefined ? item.conversionKeywordTypes : null,
          calculatedWeeklySearches: toFloat(get(item, 'calculatedWeeklySearches')),
          titleDensity: toInt(get(item, 'titleDensityExact')),
          spr: toInt(get(item, 'cprExact')),
          monopolyClickRate: toFloat(get(item, 'monopolyClickRate')),
          top3ClickingRate: toFloat(get(item, 'top3ClickingRate')),
          top3ConversionRate: toFloat(get(item, 'top3ConversionRate')),
          clicks: toInt(get(item, 'clicks')),
          impressions: toInt(get(item, 'impressions')),
          naturalRatio: toFloat(get(item, 'naturalRatio')),
          adRatio: toFloat(get(item, 'adRatio')),
          topAsins: typeof top10Asin === 'string' ? top10Asin.split(',').filter(Boolean) : null,
          searchesTrend: Array.isArray(item.searchesTrend) ? item.searchesTrend : null
        };
      })
    : [];

  const rawStats = Array.isArray(data.stats) ? data.stats : null;
  const stats = rawStats
    ? rawStats.map((s) => ({ keywords: s.keywords, total: toInt(s.total) }))
    : null;

  return {
    marketplace: (request && request.marketplace) || null,
    asin: get(data, 'asin') || (request && request.asin) || null,
    total: toInt(get(data, 'total')),
    items,
    stats
  };
}

module.exports = {
  transformAsinReversingResponse
};
