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
 * 将第三方 /v3/api/relation/reversing 响应转换为 ASIN 反查关键词 MCP 输出结构。
 * 输出字段参考 open.sellersprite.com ASIN 反查关键词接口：
 * marketplace / asin / total / items(keyword/searches/products/purchases/purchaseRate/bid/exactPpc/phrasePpc/broadPpc/badges/positions)
 */
function transformAsinReversingResponse(root, request) {
  const data = root && root.data ? root.data : {};

  const items = Array.isArray(data.items)
    ? data.items.map((item) => ({
        keyword: get(item, 'keywords'),
        searches: toInt(get(item, 'searches')),
        products: toInt(get(item, 'products')),
        purchases: toInt(get(item, 'purchases')),
        purchaseRate: toFloat(get(item, 'purchaseRate')),
        bid: toFloat(get(item, 'bid')),
        bidMin: toFloat(get(item, 'bidMin')),
        bidMax: toFloat(get(item, 'bidMax')),
        exactPpc: toFloat(get(item, 'exactPpc')),
        phrasePpc: toFloat(get(item, 'phrasePpc')),
        broadPpc: toFloat(get(item, 'broadPpc')),
        badges: Array.isArray(item.badges) ? item.badges : [],
        positions: Array.isArray(item.positions) ? item.positions : []
      }))
    : [];

  return {
    marketplace: (request && request.marketplace) || null,
    asin: get(data, 'asin') || (request && request.asin) || null,
    total: toInt(get(data, 'total')),
    items
  };
}

module.exports = {
  transformAsinReversingResponse
};
