const tools = [
  require('./asinDetailTool'),
  require('./competitorLookupTool'),
  require('./bsrSalesTool'),
  require('./asinSalesTool'),
];

module.exports = Object.fromEntries(tools.map((t) => [t.name, t]));
