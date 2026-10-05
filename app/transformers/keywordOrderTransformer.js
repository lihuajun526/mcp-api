const cheerio = require('cheerio');

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

// 把 "8.00%" 或 "8.00" 转为小数: 0.08
function pctToFloat(str) {
  if (!str) return null;
  const s = String(str).replace(/,/g, '').trim();
  const isPercent = s.endsWith('%');
  const n = toFloat(s.replace(/%$/, ''));
  if (n == null) return null;
  return isPercent ? n / 100 : n;
}

// 解析 hidden input 中的 Java toString 格式 MonopolyAsinDto 列表
// 格式: [MonopolyAsinDto(asin=B0DL8W99LM, ..., click_rate=0.16, conversion_share_rate=0.0, ...)]
function parseMonopolyAsinDtos(str) {
  if (!str || !str.trim()) return [];
  const results = [];
  const itemRegex = /MonopolyAsinDto\(([^)]+)\)/g;
  let match;
  while ((match = itemRegex.exec(str)) !== null) {
    const inner = match[1];
    const get = (key) => {
      const m = inner.match(new RegExp(`${key}=([^,)]+)`));
      return m ? m[1].trim() : null;
    };
    const asin = get('asin');
    if (!asin || asin === 'null') continue;
    const imageUrl = get('image_url') || null;
    const title = get('title') || null;
    const clickRate = toFloat(get('click_rate'));
    const conversionShareRate = toFloat(get('conversion_share_rate'));
    results.push({ asin, title, imageUrl, clickRate, conversionShareRate });
  }
  return results;
}

// 解析单行 <tr>
function parseRow($, $tr) {
  const tds = $tr.find('> td');
  // 有效数据行至少 10 列
  if (tds.length < 10) return null;

  const td = i => tds.eq(i);

  // TD 2 ── 关键词 + 中文翻译
  const $td2 = td(2);
  const keyword = $td2.find('[data-keyword]').first().attr('data-keyword') || null;
  if (!keyword) return null;
  const keywordCn = $td2.find('.keyword-cn-color').first().text().trim() || null;

  // TD 3 ── 转化效果 (conversionType)
  // htmlparser2 lowercases attribute names, so use lowercase selector
  const $convSpan = td(3).find('[data-conversiontype]').first();
  const conversionType = $convSpan.attr('data-conversiontype') || null;

  // TD 4 ── 周搜索量 (searches)
  const searchesText = td(4).find('a[pop-type="search"]').first().text().trim()
    || td(4).text().replace(/\s+/g, ' ').trim();
  const searches = toInt(searchesText);

  // TD 5 ── 排名趋势 (chart, skip)

  // TD 6 ── 排名 (searchRank)
  const searchRankText = td(6).find('a[pop-type="search"]').first().text().trim()
    || td(6).text().replace(/\s+/g, ' ').trim();
  const searchRank = toInt(searchRankText);

  // TD 7 ── 周变化量 (searchRankGv)
  const searchRankGvText = td(7).find('div').first().text().trim();
  const searchRankGv = toInt(searchRankGvText);

  // TD 8 ── 周变化率 (searchRankGr)
  const searchRankGrText = td(8).find('div').first().text().trim();
  const searchRankGr = pctToFloat(searchRankGrText);

  // TD 9 ── 点击占比 (monopolyClickRate — 该 ASIN 的点击共享)
  const monopolyClickRateText = td(9).find('div').first().text().trim();
  const monopolyClickRate = pctToFloat(monopolyClickRateText);

  // TD 10 ── 转化占比 (cvsShareRate — 该 ASIN 的转化共享)
  const cvsShareRateText = td(10).find('div').first().text().trim();
  const cvsShareRate = pctToFloat(cvsShareRateText);

  // TD 11 ── ABA集中度: 前三点击总占比 + 前三转化总占比
  const $td11 = td(11);
  const $td11Divs = $td11.find('a').first().children('div');
  const top3ClickingRateText = $td11Divs.eq(0).text().trim();
  const top3ConversionRateText = $td11Divs.eq(1).text().trim();
  const top3ClickingRate = pctToFloat(top3ClickingRateText);
  const top3ConversionRate = pctToFloat(top3ConversionRateText);

  // TD 12 ── 点击前三ASIN
  const hiddenVal = td(12).find('input[type="hidden"]').attr('value') || '';
  const monopolyAsinDtos = parseMonopolyAsinDtos(hiddenVal);

  // ASIN on <tr data-asin="">
  const asin = $tr.attr('data-asin') || null;

  return {
    asin: asin || null,
    keyword,
    keywordCn,
    keywordJp: null,
    searches,
    searchRank,
    searchRankGv,
    searchRankGr,
    monopolyClickRate,
    cvsShareRate,
    top3ClickingRate,
    top3ConversionRate,
    conversionType: conversionType === 'U' ? null : conversionType,
    monopolyAsinDtos
  };
}

// 解析分页信息
function parseTotal($) {
  const totalText = $('#total-num strong').first().text().trim();
  return toInt(totalText);
}

/**
 * 将 /v2/aba/reverse/search 返回的 HTML 转换为结构化数据。
 * @param {string} html    - 第三方返回的原始 HTML
 * @param {object} request - 原始请求参数
 */
function transformKeywordOrderResponse(html, request) {
  const size = Number(request.size) || 50;
  const page = Math.max(Number(request.page) || 1, 1);

  const empty = {
    guestId: null,
    pages: 0,
    page,
    size,
    total: 0,
    took: 0,
    url: null,
    order: {
      field: request.orderField || 'searchRank',
      desc: request.orderDesc != null ? Boolean(request.orderDesc) : false
    },
    items: [],
    terminal: null,
    hasNextPage: null,
    guestVisited: false
  };

  if (!html || typeof html !== 'string') return empty;

  const $ = cheerio.load(html);

  const total = parseTotal($) || 0;
  const pages = total > 0 ? Math.ceil(total / size) : 0;

  const marketplace = request.marketplace || 'US';
  const items = [];

  $('#table-condition-search tbody tr').each((_, trEl) => {
    const item = parseRow($, $(trEl));
    if (!item) return;
    item.marketplace = marketplace;
    items.push(item);
  });

  return {
    guestId: null,
    pages,
    page,
    size,
    total,
    took: 0,
    url: null,
    order: {
      field: request.orderField || 'searchRank',
      desc: request.orderDesc != null ? Boolean(request.orderDesc) : false
    },
    items,
    terminal: null,
    hasNextPage: page < pages,
    guestVisited: false
  };
}

module.exports = { transformKeywordOrderResponse };
