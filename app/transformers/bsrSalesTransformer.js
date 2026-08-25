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
 * 将第三方 sales-estimator/bsr.json 响应转换为 BSR 销量预测 MCP 输出结构。
 * 输出字段参考 open.sellersprite.com BSR 销量预测接口：
 * marketplace / categoryId / categoryLabel / bsr / dailySales /
 * monthlySales / rankSales
 */
function transformBsrSalesResponse(root, request) {
  const data = root && root.data ? root.data : {};
  const cidCode = data.cidCode && typeof data.cidCode === 'object' ? data.cidCode : {};

  const rankSalesRaw = data.rankSales && typeof data.rankSales === 'object' ? data.rankSales : {};
  const rankSales = [];
  for (const rank of Object.keys(rankSalesRaw).slice(0, 100)) {
    const rankInt = toInt(rank);
    if (rankInt === null) {
      continue;
    }
    rankSales.push({ rank: rankInt, dailySales: toInt(rankSalesRaw[rank]) });
  }
  rankSales.sort((a, b) => a.rank - b.rank);

  const linearParams = Array.isArray(data.linerParams) ? data.linerParams.map(toFloat) : null;

  return {
    marketplace: (request && request.marketplace) || null,
    categoryId: get(cidCode, 'cid'),
    category: get(cidCode, 'categoryLabel', 'category_label'),
    bsr: toInt(data.bsr),
    dailySales: toInt(get(data, 'estDailySales', 'estimated_daily_sales')),
    monthlySales: toInt(get(data, 'estMonSales', 'estimated_monthly_sales')),
    rankSales
  };
}

module.exports = {
  transformBsrSalesResponse
};
