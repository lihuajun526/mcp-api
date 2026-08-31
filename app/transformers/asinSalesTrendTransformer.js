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
 * 将 open API /v1/asin/{marketplace}/{asin}/sales-trend 响应转换为 MCP 输出结构。
 * 输出字段参考 open.sellersprite.com ASIN 销量趋势接口：
 * asin（商品详情对象）/ salesTrendPoints（月度销量趋势点列表）
 */
function transformAsinSalesTrendResponse(root, request) {
  const data = root && root.data ? root.data : root || {};
  const asinObj = data.asin || {};

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

  const badge = asinObj.badge
    ? {
        bestSeller: get(asinObj.badge, 'bestSeller'),
        amazonChoice: get(asinObj.badge, 'amazonChoice'),
        newRelease: get(asinObj.badge, 'newRelease'),
        ebc: get(asinObj.badge, 'ebc'),
        video: get(asinObj.badge, 'video')
      }
    : null;

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
    firstRatingDate: toInt(get(asinObj, 'firstRatingDate')),
    imageUrl: get(asinObj, 'imageUrl'),
    zoomImageUrl: get(asinObj, 'zoomImageUrl'),
    lqs: toInt(get(asinObj, 'lqs')),
    nodeId: get(asinObj, 'nodeId'),
    nodeIdPath: get(asinObj, 'nodeIdPath'),
    nodeLabelPath: get(asinObj, 'nodeLabelPath'),
    nodeLabelPathLocale: get(asinObj, 'nodeLabelPathLocale'),
    parent: get(asinObj, 'parent'),
    price: toFloat(get(asinObj, 'price')),
    primePrice: toFloat(get(asinObj, 'primePrice')),
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
    fulfillment: get(asinObj, 'fulfillment'),
    sellers: toInt(get(asinObj, 'sellers')),
    title: get(asinObj, 'title'),
    updatedTime: toInt(get(asinObj, 'updatedTime')),
    variations: toInt(get(asinObj, 'variations')),
    weight: get(asinObj, 'weight'),
    skuList: Array.isArray(asinObj.skuList) ? asinObj.skuList : [],
    variationList,
    features: Array.isArray(asinObj.features) ? asinObj.features : [],
    overviews: get(asinObj, 'overviews'),
    badge
  };

  const salesTrendPoints = Array.isArray(data.salesTrendPoints)
    ? data.salesTrendPoints.map((p) => ({
        month: p.month,
        price: toFloat(p.price),
        averagePrice: toFloat(p.averagePrice),
        parentUnitSales: toInt(p.parentUnitSales),
        childUnitSales: toInt(p.childUnitSales),
        parentSalesRevenue: toFloat(p.parentSalesRevenue),
        childSalesRevenue: toFloat(p.childSalesRevenue)
      }))
    : [];

  return { asin, salesTrendPoints };
}

module.exports = { transformAsinSalesTrendResponse };
