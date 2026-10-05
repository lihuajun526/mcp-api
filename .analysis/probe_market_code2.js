const axios = require('axios');
const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });
const BASE = process.env.SELLERSPRITE_BASE_URL || 'https://www.sellersprite.com';

async function session() {
  const r = new Redis({ host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) });
  const hk = await r.hkeys('mcp:session:SELLERSPRITE');
  const s = JSON.parse(await r.hget('mcp:session:SELLERSPRITE', hk[0]));
  await r.quit();
  return s;
}
function headers(s, referer) {
  const h = {
    accept: 'application/json, text/plain, */*',
    'accept-language': s.acceptLanguage || 'zh-CN,zh;q=0.9',
    cookie: s.cookie || '',
    'user-agent': s.userAgent || 'Mozilla/5.0',
    'content-type': 'application/json;charset=UTF-8',
    referer: BASE + referer
  };
  if (s.xToken) h['x-token'] = s.xToken;
  return h;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(market, keyword) {
  const s = await session();
  const payload = {
    keywordList: [keyword],
    market,
    pageNum: 1,
    pageSize: 3,
    historyDate: '',
    orderBy: 21,
    desc: true,
    filterRootWord: 0,
    matchType: 1,
    amazonChoice: false,
    keywordBidMatchType: 'exact'
  };
  const resp = await axios.post(BASE + '/v3/api/keyword-miner', payload, {
    headers: headers(s, '/v3/keyword-miner/'),
    timeout: 20000,
    validateStatus: () => true
  });
  const d = resp.data && resp.data.data ? resp.data.data : resp.data;
  const it = ((d && d.items) || [])[0] || {};
  console.log(
    String(market).padEnd(8),
    'searches=' + it.searches,
    'products=' + it.products,
    'avgPrice=' + (it.avgPrice || it.price),
    'bid=' + it.bid,
    'kw=' + (it.keyword || it.keywords)
  );
  await sleep(400);
}

(async () => {
  console.log('=== 用德语关键词区分站点 ===');
  for (const m of [1, 4, 3, 6, 30, 35691, 44551, 44571, 771770, 'DE', 'US', 'BR', 'AU', 'AE', 'SA']) {
    await probe(m, 'schreibtisch');
  }
  console.log('=== 用 US 关键词 + 各编码，看 searches 是否区分 ===');
  for (const m of [1, 4, 6, 30, 35691, 44551, 771770, 'DE', 'JP', 'IN', 'MX']) {
    await probe(m, 'desk lamp');
  }
})();
