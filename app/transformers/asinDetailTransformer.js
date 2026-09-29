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

function toLong(value) {
  return toInt(value);
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

function toStringArray(v) {
  if (!v) {
    return [];
  }
  if (Array.isArray(v)) {
    return v.map((it) => String(it || ''));
  }
  const s = String(v).trim();
  return s ? [s] : [];
}

function mapSubcategories(sub) {
  if (!sub) {
    return [];
  }
  const list = Array.isArray(sub) ? sub : [sub];
  return list.map((s) => ({
    rank: toInt(get(s, 'rank')),
    code: get(s, 'code'),
    label: get(s, 'label')
  }));
}

/**
 * 将第三方 /v3/api/competing-lookup 单条 item 转换为官方 ASIN 详情(asin_detail)返回结构。
 * 字段命名与 open.sellersprite.com ASIN 详情接口返回参数一致。
 */
function mapDetail(item) {
  return {
    asin: get(item, 'asin'),
    asinUrl: get(item, 'asinUrl'),
    // 上架日期
    availableDate: toLong(get(item, 'availableDate')),
    badge: {
      bestSeller: toFlag(get(item.badge || item, 'bestSeller', 'best_seller')),
      amazonChoice: toFlag(get(item.badge || item, 'amazonChoice', 'amazon_choice')),
      newRelease: toFlag(get(item.badge || item, 'newRelease', 'new_release')),
      ebc: toFlag(get(item.badge || item, 'ebc')),
      video: toFlag(get(item.badge || item, 'video'))
    },
    brand: get(item, 'brand'),
    brandUrl: get(item, 'brandUrl', 'brand_url'),
    bsrId: get(item, 'bsrId', 'bsr_id'),
    bsrLabel: get(item, 'bsrLabel', 'bsr_label'),
    bsrRank: toInt(get(item, 'bsrRank', 'bsr_rank')),
    createdTime: toLong(get(item, 'createdTime', 'created_time')),
    dimensions: get(item, 'dimensions', 'dimension'),
    firstRatingDate: toLong(get(item, 'firstRatingDate', 'firstReviewDate', 'first_rating_date')),
    imageUrl: get(item, 'imageUrl', 'image_url'),
    lqs: toInt(get(item, 'lqs')),
    nodeId: get(item, 'nodeId', 'node_id'),
    nodeIdPath: get(item, 'nodeIdPath', 'node_id_path'),
    nodeLabelPath: get(item, 'nodeLabelPath'),
    nodeLabelPathLocale: get(item, 'nodeLabelPathLocale'),
    parent: get(item, 'parent'),
    price: toFloat(get(item, 'price')),
    questions: toInt(get(item, 'questions')),
    rating: toFloat(get(item, 'rating')),
    ratings: toInt(get(item, 'ratings', 'reviews')),
    reviews: toInt(get(item, 'reviews')),
    variantRatings: toInt(get(item, 'variantRatings', 'variant_ratings')),
    variantReviews: toInt(get(item, 'variantReviews', 'variant_reviews')),
    sellerId: get(item, 'sellerId', 'seller_id'),
    sellerName: get(item, 'sellerName', 'seller_name'),
    fulfillment: get(item, 'fulfillment'),
    sellers: toInt(get(item, 'sellers')),
    skuList: toStringArray(get(item, 'skuList', 'sku_list', 'sku')),
    marketplace: get(item, 'marketplace', 'market'),
    title: get(item, 'title'),
    features: toStringArray(get(item, 'features')),
    overviews: (() => {
      const v = get(item, 'overviews', 'overview');
      if (v === null || v === undefined) {
        return null;
      }
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
    })(),
    updatedTime: toLong(get(item, 'updatedTime', 'updated_time')),
    variationList: Array.isArray(get(item, 'variationList', 'variation_list'))
      ? get(item, 'variationList', 'variation_list').map((it) => ({
          asin: get(it, 'asin'),
          attribute: get(it, 'attribute', 'attr')
        }))
      : [],
    variations: toInt(get(item, 'variations')),
    weight: get(item, 'weight'),
    zoomImageUrl: get(item, 'zoomImageUrl', 'zoom_image_url'),
    subcategories: mapSubcategories(get(item, 'subcategories', 'subCategory')),
    deliveryPrice: toFloat(get(item, 'deliveryPrice', 'delivery_price')),
    primePrice: toFloat(get(item, 'primePrice', 'prime_price', 'primeExclusivePrice')),
    coupon: get(item, 'coupon')
  };
}

/**
 * 官方 asin_detail 返回 data 为单个商品对象；上游 competing-lookup 为分页结构，
 * 这里取首条 item 并压平为单对象。
 */
function transformAsinDetailResponse(root) {
  const data = root && root.data ? root.data : {};
  const items = Array.isArray(data.items) ? data.items : [];
  if (items.length === 0) {
    return {};
  }
  return mapDetail(items[0]);
}

module.exports = {
  transformAsinDetailResponse
};
