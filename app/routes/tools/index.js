const tools = [
  require('./asinDetailTool'),
  require('./competitorLookupTool'),
  require('./bsrSalesTool'),
  require('./asinSalesTool'),
  require('./asinReversingTool'),
  require('./keywordResearchTool'),
  require('./keywordMinerTool'),
  require('./trafficExtendTool'),
];

module.exports = Object.fromEntries(tools.map((t) => [t.name, t]));
