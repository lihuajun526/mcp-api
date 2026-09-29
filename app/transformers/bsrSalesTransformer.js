function toInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
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
 * 将第三方 sales-estimator/bsr.json 响应转换为官方 bsr_prediction(BSR销量预测)返回结构：
 * marketplace / bsr / categoryLabel / estDailySales / estMonthSales / categoryId / itemList
 */
function transformBsrSalesResponse(root, request) {
  const data = root && root.data ? root.data : {};
  const cidCode = data.cidCode && typeof data.cidCode === 'object' ? data.cidCode : {};

  const rankSalesRaw = data.rankSales && typeof data.rankSales === 'object' ? data.rankSales : {};
  const itemList = [];
  for (const rank of Object.keys(rankSalesRaw).slice(0, 100)) {
    const bsr = toInt(rank);
    if (bsr === null) {
      continue;
    }
    const estDailySales = toInt(rankSalesRaw[rank]);
    itemList.push({
      bsr,
      estDailySales,
      // 上游 rankSales 仅提供日销量，官方 itemList 的 estMonthSales 按日销量 × 30 估算
      estMonthSales: estDailySales === null ? null : Math.round(estDailySales * 30)
    });
  }
  itemList.sort((a, b) => a.bsr - b.bsr);

  return {
    marketplace: (request && request.marketplace) || null,
    bsr: toInt(data.bsr),
    categoryLabel: get(cidCode, 'categoryLabel', 'category_label'),
    estDailySales: toInt(get(data, 'estDailySales', 'estimated_daily_sales')),
    estMonthSales: toInt(get(data, 'estMonSales', 'estimated_monthly_sales')),
    categoryId: get(cidCode, 'cid') || (request && request.categoryId) || null,
    itemList
  };
}

module.exports = {
  transformBsrSalesResponse
};
