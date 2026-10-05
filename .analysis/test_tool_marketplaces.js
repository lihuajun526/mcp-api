// 校验每个工具的 marketplace 枚举是否按权威口径生效
const http = require('http');
const KEY = 'demo-key-001';

function call(name, args) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
    const req = http.request(
      { host: '127.0.0.1', port: 18080, path: '/mcp', method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': KEY, 'Content-Length': Buffer.byteLength(payload) } },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            resolve({ raw: d.slice(0, 200) });
          }
        });
      }
    );
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// [工具, 入参, 期望]
const CASES = [
  ['market_research', { marketplace: 'AU', size: 20 }, '拒绝(AU 不在 10 站)'],
  ['market_research', { marketplace: 'US', size: 20 }, '通过'],
  ['keyword_miner', { marketplace: 'AU', keywordList: ['iphone case'], size: 20 }, '通过(13 站)'],
  ['keyword_miner', { marketplace: 'SA', keywordList: ['iphone case'], size: 20 }, '拒绝(SA 不在 13 站)'],
  ['traffic_listing', { marketplace: 'AE', asinList: ['B07Z82895W'] }, '拒绝(AE 不在 12 站)'],
  ['traffic_listing', { marketplace: 'BR', asinList: ['B07Z82895W'] }, '通过(12 站)'],
  ['keyword_conversion', { marketplace: 'MX', keyword: 'desk lamp' }, '拒绝(MX 不在 9 站)'],
  ['keyword_conversion', { marketplace: 'IN', keyword: 'desk lamp' }, '通过(9 站)'],
  ['first_category', { marketplace: 'SA' }, '通过(14 站)'],
  ['google_trend', { marketplace: 'AE', keyword: 'desk lamp' }, '通过(13 站)'],
  ['asin_detail', { marketplace: 'MX', asin: 'B07Z82895W' }, '通过(10 站)'],
  ['asin_detail', { marketplace: 'BR', asin: 'B07Z82895W' }, '拒绝(BR 不在 10 站)'],
  ['traffic_listing_stat', { marketplace: 'SA', asinList: ['B07Z82895W'] }, '拒绝(SA 不在 12 站)'],
  ['product_node', { marketplace: 'AU' }, '拒绝(AU 不在 10 站)']
];

(async () => {
  for (const [name, args, expect] of CASES) {
    const res = await call(name, args);
    const err = res.error || (res.result && res.result.isError) || (res.result && res.result.content && res.result.content[0] && /error/i.test(res.result.content[0].text || ''));
    const data = res.result && res.result.data;
    let outcome;
    if (res.error || (res.result && res.result.isError)) {
      const msg = (res.error && res.error.message) || (res.result && res.result.content && res.result.content[0] && res.result.content[0].text) || '';
      outcome = 'ERROR: ' + String(msg).slice(0, 90);
    } else if (data) {
      const n = data.items ? data.items.length : data.total !== undefined ? 'total=' + data.total : Object.keys(data).length + '字段';
      outcome = 'OK ' + n;
    } else {
      outcome = 'OK ' + JSON.stringify(res.result).slice(0, 80);
    }
    console.log(name.padEnd(22), String(args.marketplace).padEnd(4), '| 期望:' + expect.padEnd(22), '=> ' + outcome);
    await sleep(500);
  }
})();
