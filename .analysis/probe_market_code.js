// 探测各上游接口的 market / marketId / station 编码
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

function headers(s, referer, accept) {
  const h = {
    accept: accept || 'application/json, text/plain, */*',
    'accept-language': s.acceptLanguage || 'zh-CN,zh;q=0.9',
    cookie: s.cookie || '',
    'user-agent': s.userAgent || 'Mozilla/5.0',
    referer: BASE + referer
  };
  if (s.xToken) h['x-token'] = s.xToken;
  return h;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probeKeywordMiner(market) {
  const s = await session();
  const payload = {
    keywordList: ['phone stand'],
    market,
    pageNum: 1,
    pageSize: 5,
    historyDate: '',
    orderBy: 21,
    desc: true,
    filterRootWord: 0,
    matchType: 1,
    amazonChoice: false,
    keywordBidMatchType: 'exact'
  };
  try {
    const resp = await axios.post(BASE + '/v3/api/keyword-miner', payload, {
      headers: { ...headers(s, '/v3/keyword-miner/'), 'content-type': 'application/json;charset=UTF-8' },
      timeout: 20000,
      validateStatus: () => true
    });
    const d = resp.data && resp.data.data ? resp.data.data : resp.data;
    const items = (d && d.items) || [];
    const kws = items.slice(0, 3).map((x) => x.keyword || x.keywords).join(' | ');
    console.log(
      String(market).padEnd(8),
      'status=' + resp.status,
      'code=' + (resp.data && resp.data.code),
      'market=' + (d && d.market),
      'total=' + (d && d.total),
      'kw=' + kws
    );
  } catch (e) {
    console.log(String(market).padEnd(8), 'ERR', e.message);
  }
  await sleep(500);
}

(async () => {
  console.log('=== keyword-miner market 编码探测 ===');
  for (const m of [1, 2, 3, 4, 5, 6, 7, 30, 35691, 44551, 44571, 771770, 'US', 'DE', 'BR', 'AU', 'AE', 'SA']) {
    await probeKeywordMiner(m);
  }
})();
