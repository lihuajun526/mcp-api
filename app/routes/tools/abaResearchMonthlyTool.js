const { queryAbaResearchMonthly } = require('../../services/queries/abaResearchMonthlyQuery');
const { buildSuccess } = require('../../toolResponse');

// marketplace 公开代码 → 第三方 market 代码 (US→COM)
const MARKET_CODE_MAP = {
  US: 'COM', CA: 'CA', MX: 'MX', UK: 'UK', DE: 'DE',
  FR: 'FR', IT: 'IT', ES: 'ES', JP: 'JP', IN: 'IN', AU: 'AU'
};

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

    const marketplace = String(args.marketplace);
    const market = MARKET_CODE_MAP[marketplace] || marketplace;
    const page = Math.max(Number(args.page) || 1, 1);
    const size = Math.min(Number(args.size) || 15, 15);
    const orderField = (args.order && args.order.field != null ? String(args.order.field) : null) || args.orderField || 'searchfrequencyrank';
    const orderDesc = args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false);

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      market,
      reverseType: 'M',
      movementMarket: '',
      page,
      size,
      departments: Array.isArray(args.departments) ? args.departments : [],
      keywordBidMatchType: 'exact',
      order: { field: orderField, desc: orderDesc }
    };

    if (args.date) params.table = `ara_${String(args.date)}`;
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
