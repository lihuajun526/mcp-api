const cheerio = require('cheerio');

// ── 类型转换工具 ──────────────────────────────────────────────────────────────

function toInt(value) {
  if (value == null || value === '') return null;
  const n = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toFloat(value) {
  if (value == null || value === '') return null;
  const n = Number(String(value).replace(/,/g, '').replace(/%$/, '').trim());
  return Number.isFinite(n) ? n : null;
}

// 取元素纯文本，去掉多余空白
function text($el) {
  return $el.text().replace(/\s+/g, ' ').trim();
}

// ── PPC hidden input 解析 ────────────────────────────────────────────────────
// value 格式: "bidMin:0.65,bid:0.84,bidMax:1.08,exactPpc:...,..."
function parsePpcObj(str) {
  if (!str) return {};
  const result = {};
  str.split(',').forEach(pair => {
    const idx = pair.indexOf(':');
    if (idx === -1) return;
    const k = pair.substring(0, idx).trim();
    const v = pair.substring(idx + 1).trim();
    result[k] = toFloat(v);
  });
  return result;
}

// ── 搜索量同比/近3月变化块解析 ────────────────────────────────────────────────
// 文本形如 "140 (1.00%)" 或 "-140 (-100%)"
function parseChangeBlock(rawText) {
  const text = rawText.replace(/,/g, '').trim();
  const m = text.match(/(-?\d+(?:\.\d+)?)\s*\((-?\d+(?:\.\d+)?)%\)/);
  if (m) return { cv: toFloat(m[1]), cr: toFloat(m[2]) };
  const m2 = text.match(/(-?\d+(?:\.\d+)?)/);
  return m2 ? { cv: toFloat(m2[1]), cr: null } : { cv: null, cr: null };
}

// ── 搜索量趋势 data-y 解析 ───────────────────────────────────────────────────
// data-y 是单引号 JSON，需转换后解析
function parseTrendDataY(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw.replace(/'/g, '"').replace(/\s+/g, ''));
  } catch (_) {
    return null;
  }
}

// ── TD 3：关联 ASIN 列表（展示10条相关产品）────────────────────────────────────
function parseRelationAsinList($td) {
  const items = [];
  $td.find('a.item-img-preset').each((_, el) => {
    const $a = cheerio.load(el);
    const href = $a('a').attr('href') || '';
    const asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
    if (!asinMatch) return;
    const asin = asinMatch[1];

    // 背景图 URL 来自 .pop-url-imgs-div 的 style
    const style = $a('.pop-url-imgs-div').attr('style') || '';
    const imgMatch = style.match(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/);
    const imageUrl = imgMatch ? imgMatch[1].replace(/_US600_/, '_US200_') : null;

    // 价格
    const priceStr = $a('.currency-value').first().text().trim();
    const price = toFloat(priceStr);

    // 评分数 & 评分值，文本形如 "2,847(4.6)"
    const reviewText = $a('.text-primary').last().text().trim();
    const reviewMatch = reviewText.match(/([\d,]+)\(([\d.]+)\)/);
    const ratings = reviewMatch ? toInt(reviewMatch[1]) : null;
    const rating  = reviewMatch ? toFloat(reviewMatch[2]) : null;

    items.push({ asin, imageUrl, price, ratings, rating });
  });
  return items;
}

// ── TD 10：ARA ASIN 列表（ABA 集中度弹出框）────────────────────────────────────
function parseAraAsinList($td) {
  const items = [];
  // 弹出框在 .smaller-popover-monopoly .popover-item 下
  $td.find('.smaller-popover-monopoly .popover-item').each((_, el) => {
    const $item = cheerio.load(el);

    const href = $item('a.bg-white').attr('href') || '';
    const asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
    if (!asinMatch) return;
    const asin = asinMatch[1];

    // 文本形如 "点击: 13.33%\n转化: 0.00%"
    const labelText = $item('p').text();
    const clickMatch = labelText.match(/点击:\s*([\d.]+)%/);
    const convMatch  = labelText.match(/转化:\s*([\d.]+)%/);

    items.push({
      asin,
      title: null,
      imageUrl: null,
      clickRate:            clickMatch ? toFloat(clickMatch[1]) / 100 : null,
      conversionShareRate:  convMatch  ? toFloat(convMatch[1])  / 100 : null
    });
  });
  return items;
}

// ── 单行 <tr> 解析 ─────────────────────────────────────────────────────────────
function parseRow($, $tr) {
  const tds = $tr.find('> td');
  // 有效数据行至少要有 16 列
  if (tds.length < 16) return null;

  const td = i => tds.eq(i);

  // TD 2 ── 关键词 + 中文翻译
  const $td2  = td(2);
  const keyword   = $td2.find('[data-keyword]').first().attr('data-keyword') || null;
  if (!keyword) return null;
  const keywordCn = $td2.find('.span-keywords-transport, .keyword-cn-color').first().text().trim() || null;

  // TD 3 ── 关联 ASIN 列表
  const relationAsinList = parseRelationAsinList(td(3));

  // TD 4 ── 搜索量历史趋势（data-y 属性）
  const trendRaw     = td(4).find('[data-y]').attr('data-y');
  const searchesTrend = parseTrendDataY(trendRaw);

  // TD 5 ── 月搜索量（第一个 div）
  const searches = toInt(td(5).find('div').first().text());

  // TD 6 ── 月购买量 / 购买率
  const $td6Divs  = td(6).find('> div, .pr-4');
  const purchases = toInt($td6Divs.eq(0).text());
  const purchaseRateRaw = $td6Divs.eq(1).text().replace('%', '').trim();
  const purchaseRate    = toFloat(purchaseRateRaw) != null ? toFloat(purchaseRateRaw) / 100 : null;

  // TD 7 ── 展示量 / 点击量（不在目标输出字段中，跳过）

  // TD 8 ── 月增长率
  const growthRaw = td(8).find('div').first().text().replace('%', '').trim();
  const growth    = toFloat(growthRaw);

  // TD 9 ── 同比增长 & 近3月增长
  const $td9Divs   = td(9).find('> div');
  const yoy        = parseChangeBlock(text($td9Divs.eq(0)));
  const nearly     = parseChangeBlock(text($td9Divs.eq(1)));

  // TD 10 ── ABA 集中度（整体点击率 + 前3 ARA ASIN）
  const $td10 = td(10);
  const araClickRateRaw = $td10.find('[pop-type="click_rate"]').first().text().replace('%', '').trim();
  const araClickRate    = toFloat(araClickRateRaw) != null ? toFloat(araClickRateRaw) / 100 : null;
  const araAsinList     = parseAraAsinList($td10);

  // ARA 转化份额（紧跟弹出框之后的 .text-muted，若有数值则解析）
  const araShareRateRaw = $td10.find('.text-muted').last().text().replace('%', '').trim();
  const araShareRate    = (araShareRateRaw && araShareRateRaw !== 'N/A')
    ? toFloat(araShareRateRaw) / 100
    : null;

  // TD 11 ── ABA 排名（跳过，不在目标输出字段中）

  // TD 12 ── 货流值（goodsValue）
  const goodsValueRaw = td(12).find('div').first().text().replace('%', '').trim();
  const goodsValue    = toFloat(goodsValueRaw) != null ? toFloat(goodsValueRaw) / 100 : null;

  // TD 13 ── PPC 竞价（读取 hidden input: ppc-item-obj）
  const ppcStr = td(13).find('[ppc-item-obj]').attr('value') || '';
  const ppc    = parsePpcObj(ppcStr);
  const bid    = ppc.bid    != null ? ppc.bid    : null;
  const bidMin = ppc.bidMin != null ? ppc.bidMin : null;
  const bidMax = ppc.bidMax != null ? ppc.bidMax : null;

  // TD 15 ── 需供比 / 商品数
  const $td15     = td(15);
  const $td15Rows = $td15.find('> div');
  const sdrText   = text($td15Rows.eq(0).find('.pr-2').length ? $td15Rows.eq(0).find('.pr-2') : $td15Rows.eq(0));
  const prodText  = text($td15Rows.eq(1).find('span').length  ? $td15Rows.eq(1).find('span')  : $td15Rows.eq(1));
  const supplyDemandRatio = (sdrText && sdrText !== 'N/A') ? toFloat(sdrText) : null;
  const products          = toInt(prodText);

  // TD 16 ── 市场分析：均价 / 评分数 / 评分值
  const $td16    = td(16);
  const avgPrice   = toFloat($td16.find('.currency-value').first().text());
  const avgRatings = toInt($td16.find('[pop-type="reviews"]').first().text());
  const ratingText = $td16.find('[pop-type="rating"]').first().text().replace(/[()]/g, '').trim();
  const avgRating  = toFloat(ratingText);

  return {
    keyword,
    keywordCn,
    searches,
    purchases,
    purchaseRate,
    growth,
    searchMonthlyCv: yoy.cv,
    searchMonthlyCr: yoy.cr,
    searchNearlyCv:  nearly.cv,
    searchNearlyCr:  nearly.cr,
    supplyDemandRatio,
    products,
    araClickRate,
    araShareRate,
    araAsinList,
    goodsValue,
    bid,
    bidMin,
    bidMax,
    avgPrice,
    avgRatings,
    avgRating,
    relationAsinList,
    searchesTrend,
    // HTML 中不可见的字段，给出默认值，由上层按需填充
    searchDepartments: [],
    month:             null,
    supplement:        null,
    marketplace:       null,
    currency:          null,
    marketPeriod:      null,
    brand:             null,
    hasBrandWord:      false,
    brands:            [],
    categories:        [],
    titleDensityExact: null
  };
}

// ── 分页信息 ──────────────────────────────────────────────────────────────────
function parsePagination($) {
  // 用 .pager-def-inputs 定位到正确的分页 nav，避免与顶部导航混淆
  const $pagerInput = $('.pager-def-inputs');
  const $pagerNav   = $pagerInput.closest('nav');

  // 每页条数：data-size（如 100）
  const size = toInt($pagerInput.attr('data-size')) || 100;

  // 最大页码：max 属性（如 max="15"）
  const totalPages = toInt($pagerInput.attr('max'));

  // 当前页：active page-item
  const currentPage = toInt($pagerNav.find('.page-item.active .page-link').first().text()) || 1;

  // 范围显示：如 "1-100/1000+"，取 .text-primary 文本 + 其后兄弟文本
  const $rangeSiblings = $pagerNav.find('.text-primary').first();
  const rangeText      = $rangeSiblings.text().trim();            // "1-100"
  // 取 text-primary 父节点的完整文本，从中解析 "1-100/1000+"
  const parentText     = $rangeSiblings.parent().text().replace(/\s+/g, '').trim(); // "1-100/1000+"
  const totalM         = parentText.match(/[\d]+-[\d]+\/([\d+,]+)/);
  const totalStr       = totalM ? totalM[1].replace(/,/g, '') : null;

  let total = null;
  if (totalStr) {
    if (totalStr.includes('+')) {
      // "1000+" 表示超过阈值，用最大页 × 每页估算
      total = totalPages ? totalPages * size : null;
    } else {
      total = toInt(totalStr);
    }
  }

  return { page: currentPage, size, pages: totalPages, total };
}

// ── 排序信息 ──────────────────────────────────────────────────────────────────
function parseOrder($) {
  // 从分页链接里取 order.field 和 order.desc
  const href = $('nav a.page-link').first().attr('href') || '';
  const fieldM = href.match(/order\.field=([^&]+)/);
  const descM  = href.match(/order\.desc=(true|false)/);
  return {
    field: fieldM ? fieldM[1] : '',
    desc:  descM  ? descM[1] === 'true' : true
  };
}

// ── 市场货币映射 ──────────────────────────────────────────────────────────────
const MARKET_CURRENCY = {
  US: '$', CA: 'CA$', MX: 'MX$', UK: '£', DE: '€',
  FR: '€', IT: '€',  ES: '€',   JP: '円', IN: '₹', AU: 'A$'
};

// ── 主入口 ────────────────────────────────────────────────────────────────────

/**
 * 将 /v2/keyword-research 返回的 HTML 转换为结构化数据。
 * @param {string} html    - 第三方返回的原始 HTML
 * @param {object} request - 原始请求参数
 */
function transformKeywordResearchResponse(html, request) {
  const empty = {
    guestId: null,
    pages: 0,
    page: 1,
    size: request.size || 100,
    total: 0,
    took: 0,
    url: null,
    order: { field: '', desc: true },
    items: [],
    terminal: null,
    hasNextPage: null,
    guestVisited: false
  };

  if (!html || typeof html !== 'string') return empty;

  const $ = cheerio.load(html);

  const pagination = parsePagination($);
  const order      = parseOrder($);

  const marketplace = request.marketplace || 'US';
  const currency    = MARKET_CURRENCY[marketplace] || '$';
  const monthRaw    = request.month || '';
  // 支持 "202607" 或 "2026-07" 两种格式，统一输出 "2026.07"
  const month = monthRaw
    ? monthRaw.replace('-', '').replace(/^(\d{4})(\d{2})$/, '$1.$2')
    : null;
  const supplement = request.supplement || 'N';

  const items = [];

  // 结果表格只有一个 tbody
  $('tbody tr').each((_, trEl) => {
    const $tr  = $(trEl);
    const item = parseRow($, $tr);
    if (!item) return;

    item.marketplace = marketplace;
    item.currency    = currency;
    item.month       = month;
    item.supplement  = supplement;

    items.push(item);
  });

  return {
    guestId:      null,
    pages:        pagination.pages,
    page:         pagination.page,
    size:         pagination.size,
    total:        pagination.total,
    took:         0,
    url:          null,
    order,
    items,
    terminal:     null,
    hasNextPage:  null,
    guestVisited: false
  };
}

module.exports = { transformKeywordResearchResponse };
