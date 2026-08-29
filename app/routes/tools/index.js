const tools = [
  require('./asinDetailTool'),
  require('./competitorLookupTool'),
  require('./bsrSalesTool'),
  require('./asinSalesTool'),
  require('./asinReversingTool'),
  require('./keywordResearchTool'),
  require('./keywordMinerTool'),
  require('./trafficExtendTool'),
  require('./keywordOrderTool'),
  require('./googleTrendTool'),
  require('./keywordConversionTool'),
  require('./abaResearchWeeklyTool'),
  require('./abaResearchMonthlyTool'),
  require('./trafficKeywordStatTool'),
  require('./trafficListingStatTool'),
  require('./trafficListingTool'),
  require('./marketResearchTool'),
];

module.exports = Object.fromEntries(tools.map((t) => [t.name, t]));
