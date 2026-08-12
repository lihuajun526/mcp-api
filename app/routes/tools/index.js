const tools = [
  require('./asinDetailTool'),
  require('./competitorLookupTool'),
];

module.exports = Object.fromEntries(tools.map((t) => [t.name, t]));
