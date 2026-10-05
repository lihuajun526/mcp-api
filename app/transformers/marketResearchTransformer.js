const cheerio = require('cheerio');
const { resolveOrder, resolvePaging } = require('../utils/validation');

function parseNum(str) {
  if (!str) return null;
  const cleaned = String(str).replace(/,/g, '').replace(/%/g, '').replace(/[$¥£€]/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function parsePercent(str) {
  if (!str) return null;
  const s = String(str).trim();
  const match = s.match(/([\d.]+)%/);
  if (match) return parseFloat(match[1]);
  return parseNum(s);
}

function getNodeIdPathFromOpsCell($, td) {
  // 从收藏按钮的 data-nodeIdPath 属性获取
  const favBtn = td.find('a.favorite-b');
  if (favBtn.length) {
    const v = favBtn.attr('data-nodeIdPath') || favBtn.attr('data-nodeidpath');
    if (v) return v;
  }
  // 备用：从市场分析详情链接中解析
  const mrHref = td.find('a[href*="/v2/market-research/"]').attr('href') || '';
  const match = mrHref.match(/\/v2\/market-research\/\d+\/([^?]+)/);
  return match ? match[1] : null;
}

function parseDataRow($, row) {
  const tds = $(row).find('> td');
  if (tds.length < 14) return null;

  // TD[0]: 序号
  const ranking = parseNum($(tds.eq(0)).find('.td').text().trim());

  // TD[1]: 类目名称 & 中文翻译
  const td1 = tds.eq(1);
  const nodeLabelName = td1.find('span.eg-asin.market').text().trim() || null;
  const rawLocale = td1.find('.text-left.text-muted').first().text().trim();
  const nodeLabelLocale = rawLocale.replace(/^\(|\)$/g, '').trim() || null;

  // TD[2]: 样本数量 (商品/品牌/卖家)
  const td2 = tds.eq(2);
  const td2Texts = td2.find('.text-left').map((i, el) => $(el).text().trim()).get();
  const findVal = (arr, prefix) => {
    const t = arr.find(s => s.startsWith(prefix));
    return t ? parseNum(t.replace(prefix, '')) : null;
  };
  const topProducts = findVal(td2Texts, '商品: ');
  const brands = findVal(td2Texts, '品牌: ');
  const sellers = findVal(td2Texts, '卖家: ');

  // TD[3]: 月总销量
  const totalUnits = parseNum($(tds.eq(3)).find('.mr-2.text-center').first().text().trim());

  // TD[4]: 月均销量 / 头部商品月均销量 (含垄断度)
  const td4 = tds.eq(4);
  const td4Main = td4.find('.mr-2.text-center');
  const avgUnits = parseNum(td4Main.first().text().trim());
  const td4SecondText = td4Main.eq(1).text().trim();
  // 格式: "1,378 (5.3)"
  const dominanceMatch = td4SecondText.match(/([\d,]+)\s*\(([\d.]+)\)/);
  const topAvgUnits = dominanceMatch ? parseNum(dominanceMatch[1]) : parseNum(td4SecondText);
  const monopolyRatio = dominanceMatch ? parseFloat(dominanceMatch[2]) : null;

  // TD[5]: 月均销售额 / 头部商品月均销售额
  const td5 = tds.eq(5);
  const td5Main = td5.find('.mr-2.text-center');
  const avgRevenue = parseNum(td5Main.first().text().trim());
  const topAvgRevenue = parseNum(td5Main.eq(1).text().trim());

  // TD[6]: 平均评分数 / 平均星级
  const td6 = tds.eq(6);
  const td6Main = td6.find('.mr-2.text-center');
  const avgRatings = parseNum(td6Main.first().text().trim());
  const avgRating = parseNum(td6Main.eq(1).text().trim());

  // TD[7]: 平均BSR / 头部商品平均BSR
  const td7 = tds.eq(7);
  const td7Main = td7.find('.mr-2.text-center');
  const avgBsr = parseNum(td7Main.first().text().trim());
  const topAvgBsr = parseNum(td7Main.eq(1).text().trim());

  // TD[8]: 平均卖家数 / 平均价格
  const td8 = tds.eq(8);
  const avgSellers = parseNum(td8.find('.mr-2.text-center').first().text().trim());
  const avgPrice = parseNum(td8.find('.currency-value').text().trim());

  // TD[9]: 卖家类型 (FBA / AMZ / FBM)
  const td9 = tds.eq(9);
  const td9Texts = td9.find('.text-left').map((i, el) => $(el).text().trim()).get();
  const findPct = (arr, label) => {
    const t = arr.find(s => s.includes(label));
    return t ? parsePercent(t.replace(label, '')) : null;
  };
  const fbaProportion = findPct(td9Texts, 'FBA:');
  const amazonSelfProportion = findPct(td9Texts, 'AMZ:');
  const fbmProportion = findPct(td9Texts, 'FBM:');

  // TD[10]: 集中度指标 (商品 / 品牌 / 卖家)
  const td10 = tds.eq(10);
  const td10Texts = td10.find('.text-left').map((i, el) => $(el).text().trim()).get();
  const splitPct = (arr, label) => {
    const t = arr.find(s => s.includes(label));
    if (!t) return null;
    const parts = t.split(':');
    return parts.length > 1 ? parsePercent(parts[1]) : null;
  };
  const goodsCrn = splitPct(td10Texts, '商品');
  const brandCrn = splitPct(td10Texts, '品牌');
  const sellerCrn = splitPct(td10Texts, '卖家');

  // TD[11]: 新品数量 / 新品占比
  const td11 = tds.eq(11);
  const newCount = parseNum(td11.find('.mr-2.text-center div:not(.text-muted)').first().text().trim());
  const newProportion = parsePercent(td11.find('.text-muted').first().text().trim());

  // TD[12]: 商品总数 (亚马逊前台)
  const totalProducts = parseNum($(tds.eq(12)).find('.mr-2.text-center').first().text().trim());

  // TD[13]: 退货率 / 同类目均值
  const td13 = tds.eq(13);
  const td13Main = td13.find('.mr-2.text-center');
  const returnRatio = parsePercent(td13Main.first().text().trim());
  const avgReturnRatio = parsePercent(td13Main.eq(1).text().trim());

  // TD[14] (操作列): 获取 nodeIdPath
  const nodeIdPath = getNodeIdPathFromOpsCell($, tds.eq(tds.length - 1));
  const nodeIdSegment = nodeIdPath ? String(nodeIdPath).split(':').pop() : '';
  const nodeId = /^\d+$/.test(nodeIdSegment) ? Number(nodeIdSegment) : null;

  return {
    ranking: ranking ? Math.trunc(ranking) : null,
    nodeIdPath,
    nodeId,
    nodeLabelName,
    nodeLabelLocale,
    topProducts,    // 样本数量 - 商品数
    brands,
    sellers,
    totalUnits,
    avgUnits,
    topAvgUnits,
    monopolyRatio,
    avgRevenue,
    topAvgRevenue,
    avgRatings,
    avgRating,
    avgBsr,
    topAvgBsr,
    avgSellers,
    avgPrice,
    fbaProportion,
    amazonSelfProportion,
    fbmProportion,
    goodsCrn,
    brandCrn,
    sellerCrn,
    newCount,
    newProportion,
    totalProducts,  // 亚马逊前台商品总数
    returnRatio,
    avgReturnRatio
  };
}

function parsePagination($) {
  // 找到形如 "21-36/36" 的分页文本
  let total = 0;
  let page = 0;
  let size = 0;

  $('.text-secondary').each((i, el) => {
    const $el = $(el);
    if ($el.find('span.text-primary').length > 0) {
      const text = $el.text().trim().replace(/\s+/g, '');
      // 格式: "21-36/36"
      const m = text.match(/(\d+)-(\d+)\/(\d+)/);
      if (m) {
        const from = parseInt(m[1]);
        const to = parseInt(m[2]);
        total = parseInt(m[3]);
        size = to - from + 1;
        page = Math.ceil(to / size);
        return false; // break
      }
    }
  });

  return { total, page, size };
}

/**
 * 用 Cheerio 解析 /v2/market-research 返回的 HTML，提取市场分析列表数据。
 * @param {string} html - 第三方 HTML 响应
 * @param {object} request - 原始请求参数
 */
function transformMarketResearchResponse(html, request) {
  const { page: reqPage, size: reqSize } = resolvePaging(request, 50);
  const order = resolveOrder(request, 'total_sales');

  if (!html || typeof html !== 'string') {
    return { marketplace: request.marketplace, page: reqPage, size: reqSize, total: 0, pages: 0, items: [], order };
  }

  const $ = cheerio.load(html);

  // 解析分页信息
  const { total, page, size } = parsePagination($);
  const actualPage = page || reqPage;
  const actualSize = size || reqSize;
  const pages = total > 0 && actualSize > 0 ? Math.ceil(total / actualSize) : 0;

  // 解析数据行：排除 colspan 展开行
  const items = [];
  $('tbody tr.bg-white').each((i, row) => {
    if ($(row).find('td[colspan]').length > 0) return; // 跳过展开详情行
    const item = parseDataRow($, row);
    if (item) items.push({ marketplace: request.marketplace || null, ...item });
  });

  return {
    marketplace: request.marketplace || null,
    page: actualPage,
    size: actualSize,
    total,
    pages,
    items,
    order
  };
}

module.exports = { transformMarketResearchResponse };
