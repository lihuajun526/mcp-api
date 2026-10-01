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
 * 将爬虫 /v2/competitor-lookup/chart-monthly.json 响应转换为 MCP 输出结构。
 * 爬虫响应：data.asinObj（商品详情）+ data.chartData（按月份分组的历史快照）。
 * 输出字段：asin（商品详情对象）/ salesTrendPoints（月度销量趋势点列表）。
 */
function transformAsinSalesTrendResponse(root, request) {
  const data = root && root.data ? root.data : root || {};
  // 爬虫返回 data.asinObj；保留 data.asin 作为兼容回退
  const asinObj = data.asinObj || data.asin || {};

  const subcategories = Array.isArray(asinObj.subcategories)
    ? asinObj.subcategories.map((s) => ({
        rank: toInt(get(s, 'rank')),
        code: get(s, 'code'),
        label: get(s, 'label')
      }))
    : [];

  const variationList = Array.isArray(asinObj.variationList)
    ? asinObj.variationList.map((v) => ({ asin: v.asin, attribute: v.attribute }))
    : [];

  // 爬虫数据中 badge 字段展开为独立字段，重新组装为对象
  const badge = {
    bestSeller: get(asinObj, 'bestSeller'),
    amazonChoice: get(asinObj, 'amazonChoice'),
    newRelease: get(asinObj, 'newRelease'),
    ebc: get(asinObj, 'ebc'),
    // 爬虫字段名为 videoUrl，open API 字段名为 video
    video: get(asinObj, 'videoUrl', 'video')
  };

  const asin = {
    asin: get(asinObj, 'asin'),
    asinUrl: get(asinObj, 'asinUrl'),
    marketplace: get(asinObj, 'marketplace') || (request && request.marketplace) || null,
    availableDate: toInt(get(asinObj, 'availableDate')),
    brand: get(asinObj, 'brand'),
    brandUrl: get(asinObj, 'brandUrl'),
    bsrId: get(asinObj, 'bsrId'),
    bsrLabel: get(asinObj, 'bsrLabel'),
    bsrRank: toInt(get(asinObj, 'bsrRank')),
    subcategories,
    createdTime: toInt(get(asinObj, 'createdTime')),
    dimensions: get(asinObj, 'dimensions'),
    // 爬虫字段名为 firstReviewDate，open API 字段名为 firstRatingDate
    firstRatingDate: toInt(get(asinObj, 'firstRatingDate', 'firstReviewDate')),
    imageUrl: get(asinObj, 'imageUrl'),
    zoomImageUrl: get(asinObj, 'zoomImageUrl'),
    lqs: toInt(get(asinObj, 'lqs')),
    nodeId: get(asinObj, 'nodeId'),
    nodeIdPath: get(asinObj, 'nodeIdPath'),
    nodeLabelPath: get(asinObj, 'nodeLabelPath'),
    nodeLabelPathLocale: get(asinObj, 'nodeLabelPathLocale'),
    parent: get(asinObj, 'parent'),
    price: toFloat(get(asinObj, 'price')),
    // 爬虫字段名为 primeExclusivePrice，open API 字段名为 primePrice
    primePrice: toFloat(get(asinObj, 'primePrice', 'primeExclusivePrice')),
    deliveryPrice: toFloat(get(asinObj, 'deliveryPrice')),
    coupon: get(asinObj, 'coupon'),
    questions: toInt(get(asinObj, 'questions')),
    rating: toFloat(get(asinObj, 'rating')),
    ratings: toInt(get(asinObj, 'ratings')),
    reviews: toInt(get(asinObj, 'reviews')),
    variantRatings: toInt(get(asinObj, 'variantRatings')),
    variantReviews: toInt(get(asinObj, 'variantReviews')),
    sellerId: get(asinObj, 'sellerId'),
    sellerName: get(asinObj, 'sellerName'),
    // 爬虫字段名为 sellerType（FBA/FBM），open API 字段名为 fulfillment
    fulfillment: get(asinObj, 'fulfillment', 'sellerType'),
    sellers: toInt(get(asinObj, 'sellers')),
    title: get(asinObj, 'title'),
    updatedTime: toInt(get(asinObj, 'updatedTime')),
    variations: toInt(get(asinObj, 'variations')),
    weight: get(asinObj, 'weight'),
    // 爬虫 asinObj.sku 可能是数组，兼容 skuList
    skuList: Array.isArray(asinObj.skuList) ? asinObj.skuList
           : Array.isArray(asinObj.sku) ? asinObj.sku : [],
    variationList,
    features: Array.isArray(asinObj.features) ? asinObj.features : [],
    overviews: get(asinObj, 'overviews'),
    badge
  };

  // 爬虫返回 data.chartData（键为 "YYYY-MM" 的月度快照对象）
  let salesTrendPoints = [];
  if (data.chartData && typeof data.chartData === 'object' && !Array.isArray(data.chartData)) {
    salesTrendPoints = Object.entries(data.chartData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, entry]) => ({
        month: String(entry.monthName || entry.monthId || ''),
        price: toFloat(entry.price),
        averagePrice: toFloat(entry.averagePrice),
        parentUnitSales: toInt(entry.totalUnits),
        childUnitSales: null,
        parentSalesRevenue: toFloat(entry.totalAmount),
        childSalesRevenue: null
      }));
  } else if (Array.isArray(data.salesTrendPoints)) {
    salesTrendPoints = data.salesTrendPoints.map((p) => ({
      month: p.month,
      price: toFloat(p.price),
      averagePrice: toFloat(p.averagePrice),
      parentUnitSales: toInt(p.parentUnitSales),
      childUnitSales: toInt(p.childUnitSales),
      parentSalesRevenue: toFloat(p.parentSalesRevenue),
      childSalesRevenue: toFloat(p.childSalesRevenue)
    }));
  }

  return { asin, salesTrendPoints };
}

module.exports = { transformAsinSalesTrendResponse };
