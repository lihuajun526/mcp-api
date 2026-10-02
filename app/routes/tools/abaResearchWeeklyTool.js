const { queryAbaResearchWeekly } = require('../../services/queries/abaResearchWeeklyQuery');
const { buildSuccess } = require('../../toolResponse');
const { nthSaturday } = require('./proxyParamAdapter');

// marketplace 公开代码 → 第三方 market 代码 (US→COM)
const MARKET_CODE_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

// 分页大小取值枚举项为 20/50/100，默认 50
const SIZE_ENUM = [20, 50, 100];
const DEFAULT_SIZE = 50;

function paramError(message) {
  const err = new Error(message);
  err.code = -32602;
  return err;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** 校验 size 枚举（20/50/100），缺省为 50 */
function resolveSize(value) {
  if (value == null || value === '') return DEFAULT_SIZE;
  const size = Number(value);
  if (!SIZE_ENUM.includes(size)) {
    throw paramError('size must be one of: 20, 50, 100');
  }
  return size;
}

/**
 * 将「某年某月第几周」换算为上游 table（ara_yyyyMMdd，取该月第 week 个周六）。
 * 参考 adaptKeywordOrderArgs 的周次计算方式；year/month/week 均未提供时返回 null，
 * 不发送 table，由上游默认查询最近一周。
 */
function resolveTable(args) {
  const hasYear = args.year != null && args.year !== '';
  const hasMonth = args.month != null && args.month !== '';
  const hasWeek = args.week != null && args.week !== '';
  if (!hasYear && !hasMonth && !hasWeek) return null;
  if (!hasYear || !hasMonth || !hasWeek) {
    throw paramError('year, month and week must be provided together');
  }

  const year = Number(args.year);
  const month = Number(args.month);
  const week = Number(args.week);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw paramError('year must be a valid 4-digit year');
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw paramError('month must be between 1 and 12');
  }
  if (!Number.isInteger(week) || week < 1 || week > 5) {
    throw paramError('week must be between 1 and 5');
  }

  const day = nthSaturday(year, month, week);
  if (day == null) {
    throw paramError(`week ${week} does not exist in ${year}-${pad2(month)}`);
  }
  return `ara_${year}${pad2(month)}${pad2(day)}`;
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
  name: 'aba_research_weekly',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const marketplace = String(args.marketplace);
    const market = MARKET_CODE_MAP[marketplace] || marketplace;
    const page = Math.max(Number(args.page) || 1, 1);
    const size = resolveSize(args.size);
    const orderField = (args.order && args.order.field != null ? String(args.order.field) : null) || args.orderField || 'searchfrequencyrank';
    const orderDesc = args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false);

    // 类目多选：入参为 first_category 返回的 category_value 列表
    const departments = Array.isArray(args.departments)
      ? args.departments.map((d) => String(d)).filter(Boolean)
      : [];

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      market,
      reverseType: 'W',
      page,
      size,
      departments,
      keywordBidMatchType: 'exact',
      order: { field: orderField, desc: orderDesc }
    };

    // 几月第几周 → table（未指定则不传，上游默认最近一周）
    const table = resolveTable(args);
    if (table) params.table = table;
    if (args.includeKeywords) params.q = String(args.includeKeywords);
    if (args.excludeKeywords) params.excludeKeywords = String(args.excludeKeywords);
    if (args.exactFlag != null) params.exactFlag = Boolean(args.exactFlag);
    if (args.rankGrowthValue != null) params.rankGrowthValue = Number(args.rankGrowthValue);
    if (args.rankGrowthRate != null) params.rankGrowthRate = Number(args.rankGrowthRate);

    for (const field of RANGE_FIELDS) {
      if (args[field] != null && args[field] !== '') {
        params[field] = Number(args[field]);
      }
    }
    if (args.searchModel != null) params.searchModel = Number(args.searchModel);

    const data = await queryAbaResearchWeekly(user, params);
    return buildSuccess(args, data);
  }
};
