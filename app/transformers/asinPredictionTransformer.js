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
 * 将 /v2/tools/sales-estimator/asin.json 响应转换为 asin_prediction(ASIN 销量预测)返回结构：
 * asinDetail / dailyItemList / monthItemList
 *
 * 上游响应结构（并行数组，下标对应同一天/月）：
 *   data.dates[]          - "YYYY/MM/DD"
 *   data.dailySales[]     - 日销量（整数）
 *   data.dailyAmounts[]   - 日销售额
 *   data.dailyPrices[]    - 日价格
 *   data.bsrs[]           - 日 BSR
 *   data.mons[]           - "YYYY-MM"
 *   data.monsSales[]      - 月销量（整数）
 *   data.monsAvgPrices[]  - 月均价
 *   data.title/brand/rating/reviews/availableDate/imageUrl/category/cid/estDailySales
 */
function transformAsinPredictionResponse(root, request) {
  const data = root && root.data ? root.data : root || {};

  const asinDetail = {
    asin: (request && request.asin) || null,
    title: get(data, 'title'),
    brand: get(data, 'brand'),
    availableDate: toInt(get(data, 'availableDate')),
    category: get(data, 'category', 'rootCategoryLabel'),
    categoryId: get(data, 'cid'),
    imageUrl: get(data, 'imageUrl'),
    ratings: toInt(get(data, 'reviews')),
    rating: toFloat(get(data, 'rating')),
    estDailySales: toInt(get(data, 'estDailySales'))
  };

  // 日粒度列表：dates / dailySales / dailyAmounts / dailyPrices / bsrs 为等长并行数组
  const dailyItemList = [];
  const dates = Array.isArray(data.dates) ? data.dates : [];
  const dailySales = Array.isArray(data.dailySales) ? data.dailySales : [];
  const dailyAmounts = Array.isArray(data.dailyAmounts) ? data.dailyAmounts : [];
  const dailyPrices = Array.isArray(data.dailyPrices) ? data.dailyPrices : [];
  const bsrs = Array.isArray(data.bsrs) ? data.bsrs : [];

  for (let i = 0; i < dates.length; i++) {
    dailyItemList.push({
      date: dates[i] ? String(dates[i]).replace(/\//g, '-') : null,
      bsr: toInt(bsrs[i]),
      sales: toInt(dailySales[i]),
      amount: toFloat(dailyAmounts[i]),
      price: toFloat(dailyPrices[i])
    });
  }

  // 月度列表：mons / monsSales / monsAvgPrices 为等长并行数组
  const monthItemList = [];
  const mons = Array.isArray(data.mons) ? data.mons : [];
  const monsSales = Array.isArray(data.monsSales) ? data.monsSales : [];
  const monsAvgPrices = Array.isArray(data.monsAvgPrices) ? data.monsAvgPrices : [];

  for (let i = 0; i < mons.length; i++) {
    const sales = toInt(monsSales[i]);
    const price = toFloat(monsAvgPrices[i]);
    const amount = sales !== null && price !== null
      ? Math.round(sales * price * 100) / 100
      : null;
    monthItemList.push({
      date: mons[i] || null,
      sales,
      amount,
      price
    });
  }

  return { asinDetail, dailyItemList, monthItemList };
}

module.exports = {
  transformAsinPredictionResponse
};
