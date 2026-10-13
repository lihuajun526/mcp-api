const tools = [
  require('./asinDetailTool'),
  require('./competitorLookupTool'),
  require('./asinCompetitorTool'),
  require('./productResearchTool'),
  require('./bsrSalesTool'),
  // require('./asinPredictionTool'), // 已注销，改由代理转发（对外 ss_asin_prediction）
  require('./trafficKeywordTool'),
  require('./keywordResearchTool'),
  require('./keywordMinerTool'),
  require('./trafficExtendTool'),
  require('./googleTrendTool'),
  require('./keywordConversionTool'),
  require('./abaResearchWeeklyTool'),
  require('./abaResearchMonthlyTool'),
  require('./trafficKeywordStatTool'),
  require('./trafficListingStatTool'),
  require('./trafficListingTool'),
  require('./marketResearchTool'),
  require('./productNodeTool'),
  require('./asinSalesTrendTool'),
  require('./categoryFirstTool'),
  require('./userQuotaTool'),
];

module.exports = Object.fromEntries(tools.map((t) => [t.name, t]));
