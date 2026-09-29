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

// 上游日期为 2025/07/01，官方返回为 2025-07-01
function formatDate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return String(value).replace(/\//g, '-');
}

/**
 * 将第三方 sales-estimator/asin.json 响应转换为官方 asin_prediction(ASIN 销量预测)返回结构：
 * asinDetail / dailyItemList / monthItemList
 */
function transformAsinSalesResponse(root, request) {
  const data = root && root.data ? root.data : {};

  const dates = Array.isArray(data.dates) ? data.dates : [];
  const dailySales = Array.isArray(data.dailySales) ? data.dailySales : [];
  const dailyAmounts = Array.isArray(data.dailyAmounts) ? data.dailyAmounts : [];
  const dailyPrices = Array.isArray(data.dailyPrices) ? data.dailyPrices : [];
  const bsrs = Array.isArray(data.bsrs) ? data.bsrs : [];

  const dailyLen = Math.max(dates.length, dailySales.length, dailyAmounts.length, dailyPrices.length, bsrs.length);
  const dailyItemList = [];
  for (let i = 0; i < dailyLen; i += 1) {
    dailyItemList.push({
      date: formatDate(dates[i]),
      bsr: toInt(bsrs[i]),
      sales: toInt(dailySales[i]),
      amount: toFloat(dailyAmounts[i]),
      price: toFloat(dailyPrices[i])
    });
  }

  const mons = Array.isArray(data.mons) ? data.mons : [];
  const monsSales = Array.isArray(data.monsSales) ? data.monsSales : [];
  const monsAmounts = Array.isArray(data.monsAmounts) ? data.monsAmounts : [];
  const monsAvgPrices = Array.isArray(data.monsAvgPrices) ? data.monsAvgPrices : [];

  const monthLen = Math.max(mons.length, monsSales.length, monsAmounts.length, monsAvgPrices.length);
  const monthItemList = [];
  for (let i = 0; i < monthLen; i += 1) {
    monthItemList.push({
      date: mons[i] !== undefined && mons[i] !== null ? String(mons[i]) : null,
      sales: toInt(monsSales[i]),
      amount: toFloat(monsAmounts[i]),
      price: toFloat(monsAvgPrices[i])
    });
  }

  const asinDetail = {
    asin: get(data, 'asin') || (request && request.asin) || null,
    title: get(data, 'title'),
    brand: get(data, 'brand'),
    availableDate: toInt(get(data, 'availableDate')),
    category: get(data, 'category'),
    categoryId: get(data, 'cid'),
    imageUrl: get(data, 'zoomImageUrl', 'imageUrl'),
    ratings: toInt(get(data, 'ratings', 'reviews')),
    rating: toFloat(get(data, 'rating'))
  };

  return { asinDetail, dailyItemList, monthItemList };
}

module.exports = {
  transformAsinSalesResponse
};
