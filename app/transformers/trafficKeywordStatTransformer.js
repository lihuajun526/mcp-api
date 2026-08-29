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

/**
 * 将 /v3/api/relation/stat-keywords 返回的 JSON 转换为 Open API 标准格式。
 * @param {object} rawData - 第三方响应 data 字段
 * @param {object} request - 原始请求参数
 */
function transformTrafficKeywordStatResponse(rawData, request) {
  if (!rawData) {
    return {
      marketplace: request.marketplace || null,
      asin: request.asin || null,
      keywords: null,
      ranks: null,
      ads: null,
      calcTime: null,
      badgeCount: null,
      status: null
    };
  }

  // 从 statDto 中取数据
  const statDto = rawData.statDto || {};
  const badges = statDto.badges || {};

  return {
    marketplace: request.marketplace || null,
    asin: rawData.asin || request.asin || null,
    keywords: toInt(statDto.keywords),
    ranks: toInt(statDto.ranks),
    ads: toInt(statDto.ads),
    calcTime: rawData.statDto ? statDto.calcTime || null : null,
    badgeCount: {
      ns: toInt(badges.NATURAL_SEARCHING),
      ac: toInt(badges.AMAZON_CHOICE),
      er: toInt(badges.EDITORIAL_RECOMMENDATIONS),
      fs: toInt(badges.FOUR_STAR),
      hr: toInt(badges.HIGHLY_RATED),
      sb: toInt(badges.SPONSOR_BRAND),
      sv: toInt(badges.SPONSOR_VIDEO),
      ad: toInt(badges.ADS)
    },
    status: rawData.status || null
  };
}

module.exports = { transformTrafficKeywordStatResponse };
