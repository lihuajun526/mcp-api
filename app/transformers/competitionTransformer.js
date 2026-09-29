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

function toFlag(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value).toUpperCase() === 'Y') {
    return 'Y';
  }
  if (value === false || value === 0 || String(value).toLowerCase() === 'false' || String(value).toUpperCase() === 'N') {
    return 'N';
  }
  return String(value);
}

function get(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) {
      return obj[k];
    }
  }
  return null;
}

function parseJsonString(v) {
  if (v === null || v === undefined || v === '') {
    return null;
  }
  if (typeof v === 'object') {
    return v;
  }
  try {
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
}

// 子体销售额（官方 amzSales）：上游未直接返回，按 子体近30日销量 × 价格 推导
function toAmzSales(amzUnit, price) {
  if (amzUnit === null || price === null) {
    return null;
  }
  return Math.round(amzUnit * price * 100) / 100;
}

/**
 * 将第三方 competing-lookup / product-research 的 items 转换为官方返回结构。
 * 字段名对齐 open.sellersprite.com 官方文档：
 * - 查竞品(api/1) / 选产品(api/2) / 查ASIN竞品数据(api/62)
 * 官方字段：asin / brand / brandUrl / imageUrl / title / parent / nodeId / nodeIdPath /
 * nodeLabelPath / symbol / bsrId / bsr / bsrCr / bsrCv / units / unitsGr / amzUnit / amzSales /
 * amzUnitDate / revenue / price / primePrice / profit / fba / ratings / ratingsRate / rating /
 * ratingsCv / ratingDelta / lqs / availableDate / fulfillment / variations / sellers /
 * sellerId / sellerName / sellerNation / badge{bestSeller,amazonChoice,newRelease,ebc,video} /
 * weight / dimension / dimensionsType / pkgDimensions / pkgDimensionType / pkgWeight / sku /
 * subcategories / deliveryPrice / averagePrice
 * 另保留若干上游有值且有意义、但官方未列出的额外字段（见文件末尾注释）。
 */
function transformCompetitionItem(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const salesTrendRaw = parseJsonString(get(item, 'salesTrend', 'sales_trend'));
  const salesTrend = [];
  if (salesTrendRaw && typeof salesTrendRaw === 'object') {
    for (const dk of Object.keys(salesTrendRaw).sort()) {
      salesTrend.push({ dk, sales: toFloat(salesTrendRaw[dk]) });
    }
  }

  const amzUnitTrendRaw = parseJsonString(get(item, 'amzUnitTrend', 'amz_unit_trend'));
  const amzUnitTrend = [];
  if (amzUnitTrendRaw && typeof amzUnitTrendRaw === 'object') {
    for (const dk of Object.keys(amzUnitTrendRaw).sort()) {
      amzUnitTrend.push({ dk, units: toInt(amzUnitTrendRaw[dk]) });
    }
  }

  const subcategories = (() => {
    const sub = get(item, 'subcategories', 'subCategory');
    if (!Array.isArray(sub)) {
      return [];
    }
    return sub.map((it) => ({
      rank: toInt(get(it, 'rank')),
      code: get(it, 'code'),
      label: get(it, 'label')
    }));
  })();

  const fulfillment = (() => {
    const t = get(item, 'fulfillment', 'sellerType', 'seller_type');
    if (t === 'AMZ' || t === 'FBA' || t === 'FBM') {
      return t;
    }
    return null;
  })();

  const amzUnit = toInt(get(item, 'amzUnit', 'amz_unit'));
  const price = toFloat(get(item, 'price'));

  return {
    asin: get(item, 'asin'),
    brand: get(item, 'brand'),
    brandUrl: get(item, 'brandUrl', 'brand_url'),
    imageUrl: get(item, 'imageUrl', 'image_url'),
    title: get(item, 'title'),
    parent: get(item, 'parent'),
    nodeId: toInt(get(item, 'nodeId', 'node_id')),
    nodeIdPath: get(item, 'nodeIdPath', 'node_id_path'),
    nodeLabelPath: get(item, 'nodeLabelPath', 'node_label_path'),
    symbol: get(item, 'symbol'),
    bsrId: get(item, 'bsrId', 'bsr_id'),
    bsr: toInt(get(item, 'bsrRank', 'bsr')),
    bsrCr: toFloat(get(item, 'bsrRankCr', 'bsr_growth_rate')),
    bsrCv: toInt(get(item, 'bsrRankCv', 'bsr_growth_count')),
    units: toInt(get(item, 'totalUnits', 'total_units')),
    unitsGr: toFloat(get(item, 'totalUnitsGrowth', 'units_growth')),
    amzUnit,
    amzSales: toAmzSales(amzUnit, price),
    amzUnitDate: toInt(get(item, 'amzUnitDate', 'amz_unit_date')),
    revenue: toFloat(get(item, 'totalAmount', 'total_amount')),
    price,
    primePrice: toFloat(get(item, 'primeExclusivePrice', 'primePrice', 'prime_price')),
    profit: toFloat(get(item, 'profit')),
    fba: toFloat(get(item, 'fba')),
    ratings: toInt(get(item, 'reviews', 'ratings')),
    ratingsRate: toFloat(get(item, 'reviewsRate', 'reviews_rate')),
    rating: toFloat(get(item, 'rating')),
    ratingsCv: toInt(get(item, 'reviewsIncreasement', 'reviews_increasement')),
    ratingDelta: toInt(get(item, 'reviewsDelta', 'reviews_delta')),
    lqs: toFloat(get(item, 'lqs')),
    availableDate: toInt(get(item, 'availableDate', 'available_date')),
    fulfillment,
    variations: toInt(get(item, 'variations', 'variation_num')),
    sellers: toInt(get(item, 'sellers')),
    sellerId: get(item, 'sellerId', 'seller_id'),
    sellerName: get(item, 'sellerName', 'seller_name'),
    sellerNation: get(item, 'sellerNation', 'seller_nation'),
    badge: {
      bestSeller: toFlag(get(item, 'bestSeller', 'best_seller')),
      amazonChoice: toFlag(get(item, 'amazonChoice', 'amazon_choice')),
      newRelease: toFlag(get(item, 'newRelease', 'new_release')),
      ebc: toFlag(get(item, 'ebc')),
      video: toFlag(get(item, 'video'))
    },
    weight: get(item, 'weight'),
    dimension: get(item, 'dimensions', 'dimension'),
    dimensionsType: get(item, 'dimensionType', 'dimensionsType', 'dimension_type'),
    pkgDimensions: get(item, 'pkgDimensions', 'pkg_dimensions'),
    pkgDimensionType: get(item, 'pkgDimensionType', 'pkg_dimension_type'),
    pkgWeight: get(item, 'pkgWeight', 'pkg_weight'),
    sku: get(item, 'sku'),
    subcategories,
    deliveryPrice: toFloat(get(item, 'deliveryPrice', 'delivery_price')),
    averagePrice: toFloat(get(item, 'averagePrice', 'average_price')),
    // ---- 超出官方文档的额外字段（上游有值且有意义）----
    bsrLabel: get(item, 'bsrLabel', 'bsr_label'),
    nodeLabelPathLocale: get(item, 'nodeLabelPathLocale', 'node_label_path_locale'),
    bigImageUrl: get(item, 'bigImageUrl', 'big_image_url'),
    questions: toInt(get(item, 'questions')),
    availableDays: toInt(get(item, 'availableDays', 'available_days')),
    firstReviewDate: toInt(get(item, 'firstReviewDate', 'first_review_date')),
    coupon: get(item, 'coupon'),
    revenueGr: toFloat(get(item, 'totalAmountGrowth', 'revenue_growth')),
    salesTrend,
    amzUnitTrend
  };
}

function transformCompetitionResponse(root, request) {
  const data = root && root.data ? root.data : {};
  const items = Array.isArray(data.items) ? data.items : [];
  const out = items.map(transformCompetitionItem).filter(Boolean);

  const marketplace =
    request && (request.marketplace || request.market)
      ? request.marketplace || request.market
      : null;

  return {
    marketplace,
    page: toInt(data.page) || 0,
    size: toInt(data.size) || 0,
    total: toInt(data.total) || 0,
    pages: toInt(data.pages) || 0,
    hasNextPage: get(data, 'hasNextPage'),
    items: out
  };
}

module.exports = {
  transformCompetitionResponse,
  transformCompetitionItem
};
