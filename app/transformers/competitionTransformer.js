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

/**
 * 将第三方 competing-lookup 的 items 转换为查竞品 MCP 输出结构。
 * 输出字段参考 open.sellersprite.com 查竞品(Competitor Lookup)接口：
 * asin / title / price / monthlySalesUnits / monthlySalesRevenue / bsr /
 * bsrGrowthRate / bsrGrowthCount / rating / ratings / ratingsGrowth /
 * ratingsRate / brand / sellerName / sellerNation / fulfillment /
 * availableDate / profit / nodeLabelPath / imageUrl / monthlySalesUnitsGrowthRate /
 * listingQualityScore / variationNum / parent / badgeBestSeller /
 * badgeAmazonChoice / badgeEbc / badgeVideo / salesTrend / subcategories
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
  const monthlySalesUnitsTrend = [];
  if (amzUnitTrendRaw && typeof amzUnitTrendRaw === 'object') {
    for (const dk of Object.keys(amzUnitTrendRaw).sort()) {
      monthlySalesUnitsTrend.push({ dk, units: toInt(amzUnitTrendRaw[dk]) });
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

  return {
    asin: get(item, 'asin'),
    asinUrl: `https://www.amazon.com/dp/${get(item, 'asin') || ''}`,
    title: get(item, 'title'),
    price: toFloat(get(item, 'price')),
    imageUrl: get(item, 'imageUrl', 'image_url'),
    bigImageUrl: get(item, 'bigImageUrl', 'big_image_url'),
    rating: toFloat(get(item, 'rating')),
    ratings: toInt(get(item, 'ratings')),
    reviews: toInt(get(item, 'reviews')),
    questions: toInt(get(item, 'questions')),
    monthlySalesUnits: toInt(get(item, 'amzUnit', 'monthly_sales_units')),
    monthlySalesRevenue: toFloat(get(item, 'totalAmount', 'monthly_sales_revenue')),
    monthlySalesUnitsGrowthRate: toFloat(get(item, 'totalUnitsGrowth', 'monthly_sales_units_growth_rate')),
    monthlySalesRevenueGrowthRate: toFloat(get(item, 'totalAmountGrowth', 'monthly_sales_revenue_growth_rate')),
    averagePrice: toFloat(get(item, 'averagePrice', 'average_price')),
    bsr: toInt(get(item, 'bsrRank', 'bsr')),
    bsrLabel: get(item, 'bsrLabel', 'bsr_label'),
    bsrGrowthRate: toFloat(get(item, 'bsrRankCr', 'bsr_growth_rate')),
    bsrGrowthCount: toInt(get(item, 'bsrRankCv', 'bsr_growth_count')),
    brand: get(item, 'brand'),
    sellerName: get(item, 'sellerName', 'seller_name'),
    sellerNation: get(item, 'sellerNation', 'seller_nation'),
    sellerType: get(item, 'sellerType', 'seller_type'),
    fulfillment: (() => {
      const t = get(item, 'sellerType', 'seller_type');
      if (t === 'AMZ') return 'AMZ';
      if (t === 'FBA') return 'FBA';
      if (t === 'FBM') return 'FBM';
      return null;
    })(),
    availableDate: toInt(get(item, 'availableDate', 'available_date')),
    firstReviewDate: toInt(get(item, 'firstReviewDate', 'first_review_date')),
    availableDays: toInt(get(item, 'availableDays', 'available_days')),
    profit: toFloat(get(item, 'profit')),
    fba: toFloat(get(item, 'fba')),
    lqs: toInt(get(item, 'lqs')),
    listingQualityScore: toInt(get(item, 'lqs', 'listing_quality_score')),
    variationNum: toInt(get(item, 'variations', 'variation_num')),
    parent: get(item, 'parent'),
    nodeIdPath: get(item, 'nodeIdPath', 'node_id_path'),
    nodeLabelPath: get(item, 'nodeLabelPath', 'node_label_path'),
    nodeLabelPathLocale: get(item, 'nodeLabelPathLocale', 'node_label_path_locale'),
    badges: {
      bestSeller: toFlag(get(item, 'bestSeller', 'best_seller')),
      amazonChoice: toFlag(get(item, 'amazonChoice', 'amazon_choice')),
      newRelease: toFlag(get(item, 'newRelease', 'new_release')),
      ebc: toFlag(get(item, 'ebc')),
      video: toFlag(get(item, 'video'))
    },
    badgeBestSeller: toFlag(get(item, 'bestSeller', 'best_seller')),
    badgeAmazonChoice: toFlag(get(item, 'amazonChoice', 'amazon_choice')),
    badgeEbc: toFlag(get(item, 'ebc')),
    badgeVideo: toFlag(get(item, 'video')),
    reviewsRate: toFloat(get(item, 'reviewsRate', 'reviews_rate')),
    reviewsIncreasement: toInt(get(item, 'reviewsIncreasement', 'reviews_increasement')),
    reviewsDelta: toInt(get(item, 'reviewsDelta', 'reviews_delta')),
    totalUnits: toInt(get(item, 'totalUnits', 'total_units')),
    totalAmount: toFloat(get(item, 'totalAmount', 'total_amount')),
    salesTrend,
    monthlySalesUnitsTrend,
    subcategories,
    variations: toInt(get(item, 'variations', 'variation_num')),
    coupon: get(item, 'coupon'),
    deliveryPrice: toFloat(get(item, 'deliveryPrice', 'delivery_price')),
    primeExclusivePrice: toFloat(get(item, 'primeExclusivePrice', 'prime_exclusive_price')),
    dimensions: get(item, 'dimensions'),
    weight: get(item, 'weight'),
    sellers: toInt(get(item, 'sellers'))
  };
}

function transformCompetitionResponse(root, request) {
  const data = root && root.data ? root.data : {};
  const items = Array.isArray(data.items) ? data.items : [];
  const out = items.map(transformCompetitionItem).filter(Boolean);

  if (request && request.marketplace) {
    for (const item of out) {
      item.marketplace = request.marketplace;
    }
  }

  return {
    marketplace: request && request.marketplace ? request.marketplace : null,
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
