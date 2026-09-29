const { queryAbaResearchWeekly } = require('../../services/queries/abaResearchWeeklyQuery');
const { buildSuccess } = require('../../toolResponse');

module.exports = {
  name: 'aba_research_weekly',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }

    const data = await queryAbaResearchWeekly(user, {
      marketplace: String(args.marketplace),
      date: args.date ? String(args.date) : '',
      departments: Array.isArray(args.departments) ? args.departments : [],
      includeKeywords: args.includeKeywords,
      excludeKeywords: args.excludeKeywords,
      exactFlag: args.exactFlag,
      page: args.page,
      size: args.size,
      orderField: args.order && args.order.field != null ? String(args.order.field) : args.orderField,
      orderDesc: args.order && args.order.desc !== undefined ? args.order.desc : args.orderDesc,
      rankGrowthValue: args.rankGrowthValue,
      rankGrowthRate: args.rankGrowthRate,
      minRankGrowthRate: args.minRankGrowthRate,
      maxRankGrowthRate: args.maxRankGrowthRate,
      minSearchRank: args.minSearchRank,
      maxSearchRank: args.maxSearchRank,
      minSearches: args.minSearches,
      maxSearches: args.maxSearches,
      minMonopolyClickRate: args.minMonopolyClickRate,
      maxMonopolyClickRate: args.maxMonopolyClickRate,
      minConversionRate: args.minConversionRate,
      maxConversionRate: args.maxConversionRate,
      minWordCount: args.minWordCount,
      maxWordCount: args.maxWordCount,
      minSPR: args.minSPR,
      maxSPR: args.maxSPR,
      minTitleDensity: args.minTitleDensity,
      maxTitleDensity: args.maxTitleDensity,
      minClicks: args.minClicks,
      maxClicks: args.maxClicks,
      minImpressions: args.minImpressions,
      maxImpressions: args.maxImpressions,
      searchModel: args.searchModel
    });

    return buildSuccess(args, data);
  }
};
