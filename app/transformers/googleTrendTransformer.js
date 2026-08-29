/**
 * 将 /v2/keyword/google-trends.json 返回的 JSON 转换为 Open API 标准格式 (google_trend)。
 *
 * 原始响应: { code, message, data: { link, range, station, timeLineData: [...] } }
 * 输出格式: { marketplace, keyword, link, range, items: [{ time, value }] }
 */

function toFloat(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function transformGoogleTrendResponse(raw, request) {
  const marketplace = request.marketplace || 'US';
  const keyword = request.keyword || '';

  const empty = { marketplace, keyword, link: null, range: null, items: [] };

  if (!raw) return empty;

  const link = raw.link || null;

  // range: 各时段搜索热度均值
  const range = raw.range ? {
    week: toFloat(raw.range.week),
    month: toFloat(raw.range.month),
    quarter: toFloat(raw.range.quarter),
    half: toFloat(raw.range.half),
    year: toFloat(raw.range.year),
    threeYear: toFloat(raw.range.threeYear),
    all: toFloat(raw.range.all)
  } : null;

  // 时序数据在 timeLineData 字段（旧接口为 items）
  const rawItems = Array.isArray(raw.timeLineData) ? raw.timeLineData
    : Array.isArray(raw.items) ? raw.items
    : [];

  const items = rawItems.map(item => ({
    time: item.time != null ? Number(item.time) : null,
    value: item.value != null ? Number(item.value) : null
  }));

  return { marketplace, keyword, link, range, items };
}

module.exports = { transformGoogleTrendResponse };
