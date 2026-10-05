const { queryAbaResearchMonthly } = require('../../services/queries/abaResearchMonthlyQuery');
const { buildSuccess } = require('../../toolResponse');
const { assertToolMarketplace, toMarketCode } = require('../../utils/marketplace');
const { resolveToolPageSize } = require('../../utils/validation');

function paramError(message) {
  const err = new Error(message);
  err.code = -32602;
  return err;
}

/**
 * 按月 date（yyyyMM）→ 上游 table（ara_yyyyMM）。
 * 未传 date 时返回 null，不发送 table，由上游默认查询最近30天。
 */
function resolveTable(args) {
  const date = args.date == null ? '' : String(args.date).trim();
  if (!date) return null;
  if (!/^\d{4}(0[1-9]|1[0-2])$/.test(date)) {
    throw paramError('date must be in yyyyMM format, e.g. 202608');
  }
  return `ara_${date}`;
}

const RANGE_FIELDS = [
  'minRankGrowthRate', 'maxRankGrowthRate',
  'minSearchRank', 'maxSearchRank',
  'minSearches', 'maxSearches',
  'minMonopolyClickRate', 'maxMonopolyClickRate',
  'minConversionRate', 'maxConversionRate',
  'minWordCount', 'maxWordCount',
  'minSPR', 'maxSPR',
  'minTitleDensity', 'maxTitleDensity',
  'minClicks', 'maxClicks',
  'minImpressions', 'maxImpressions'
];

module.exports = {
  name: 'aba_research_monthly',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const marketplace = assertToolMarketplace('aba_research_monthly', args.marketplace);
    // marketplace 公开代码 → 第三方 market 代码 (US→COM)
    const market = toMarketCode(marketplace);
    const page = Math.max(Number(args.page) || 1, 1);
    const size = resolveToolPageSize('aba_research_monthly', args.size);
    const orderField = (args.order && args.order.field != null ? String(args.order.field) : null) || args.orderField || 'searchfrequencyrank';
    const orderDesc = args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false);

    // 类目多选：入参为 first_category 返回的 category_value 列表
    const departments = Array.isArray(args.departments)
      ? args.departments.map((d) => String(d)).filter(Boolean)
      : [];

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      market,
      reverseType: 'M',
      movementMarket: '',
      page,
      size,
      departments,
      keywordBidMatchType: 'exact',
      order: { field: orderField, desc: orderDesc }
    };

    // 月份 → table（未指定则不传，上游默认最近30天）
    const table = resolveTable(args);
    if (table) params.table = table;
    if (args.includeKeywords) params.q = String(args.includeKeywords);
    if (args.excludeKeywords) params.excludeKeywords = String(args.excludeKeywords);
    if (args.exactFlag != null) params.exactFlag = Boolean(args.exactFlag);

    for (const field of RANGE_FIELDS) {
      if (args[field] != null && args[field] !== '') {
        params[field] = Number(args[field]);
      }
    }
    if (args.searchModel != null) params.searchModel = Number(args.searchModel);

    const data = await queryAbaResearchMonthly(user, params);
    return buildSuccess(args, data);
  }
};
