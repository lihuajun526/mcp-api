const tools = [
  require('./asinDetailTool'),
  require('./competitorLookupTool'),
  require('./bsrSalesTool'),
];

module.exports = Object.fromEntries(tools.map((t) => [t.name, t]));
