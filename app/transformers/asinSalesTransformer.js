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

/**
 * 将第三方 sales-estimator/asin.json 响应转换为 ASIN 销量预测 MCP 输出结构。
 * 输出字段参考 open.sellersprite.com BSR 销量预测接口：
 * marketplace / asin / category / categoryId / estMonSales /
 * dailyAmounts / dailyPrices / bsrs / monsAmounts / monStats
 */
function transformAsinSalesResponse(root, request) {
  const data = root && root.data ? root.data : {};

  const dailyAmounts = Array.isArray(data.dailyAmounts)
    ? data.dailyAmounts.slice(-365).map(toFloat)
    : [];

  const dailyPrices = Array.isArray(data.dailyPrices)
    ? data.dailyPrices.slice(-365).map(toFloat)
    : [];

  const bsrs = Array.isArray(data.bsrs)
    ? data.bsrs.slice(-365).map(toInt)
    : [];

  const monsAmounts = Array.isArray(data.monsAmounts)
    ? data.monsAmounts.map(toFloat)
    : [];

  const monStats = data.monStats && typeof data.monStats === 'object'
    ? data.monStats
    : {};

  return {
    marketplace: (request && request.marketplace) || null,
    asin: get(data, 'asin') || (request && request.asin) || null,
    categoryId: get(data, 'cid'),
    category: get(data, 'category'),
    monthlySales: toInt(get(data, 'estMonSales')),
    dailyAmounts,
    dailyPrices,
    bsrs
  };
}

module.exports = {
  transformAsinSalesResponse
};
