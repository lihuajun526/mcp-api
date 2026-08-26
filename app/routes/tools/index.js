const tools = [
  require('./asinDetailTool'),
  require('./competitorLookupTool'),
  require('./bsrSalesTool'),
  require('./asinSalesTool'),
  require('./asinReversingTool'),
];

module.exports = Object.fromEntries(tools.map((t) => [t.name, t]));
