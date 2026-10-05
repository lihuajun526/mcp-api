// 逐个上游接口探测 market / marketId / station 是否接受站点代码字符串
const axios = require('axios');
const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });
const BASE = process.env.SELLERSPRITE_BASE_URL || 'https://www.sellersprite.com';
const ASIN = 'B07Z82895W';

async function session() {
  const r = new Redis({ host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) });
  const hk = await r.hkeys('mcp:session:SELLERSPRITE');
  const s = JSON.parse(await r.hget('mcp:session:SELLERSPRITE', hk[0]));
  await r.quit();
  return s;
}
function hdrs(s, referer, json) {
  const h = {
    accept: 'application/json, text/plain, */*',
    'accept-language': s.acceptLanguage || 'zh-CN,zh;q=0.9',
    cookie: s.cookie || '',
    'user-agent': s.userAgent || 'Mozilla/5.0',
    referer: BASE + referer
  };
  if (json) h['content-type'] = 'application/json;charset=UTF-8';
  if (s.xToken) h['x-token'] = s.xToken;
  return h;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function dig(d, paths) {
  for (const p of paths) {
    const v = p.split('.').reduce((o, k) => (o == null ? o : o[k]), d);
    if (v !== undefined && v !== null) return v;
  }
  return null;
}

const cases = [
  {
    name: 'relation/traffic (market)',
    path: '/v3/api/relation/traffic',
    method: 'post',
    referer: '/v3/traffic/keyword',
    build: (m) => ({ market: m, pageNum: 1, pageSize: 20, desc: true, orderField: 'relationCount', relations: ['vav'], queryVariations: true, asinList: [ASIN] })
  },
  {
    name: 'traffic/extend/asin (market)',
    path: '/v3/api/traffic/extend/asin',
    method: 'post',
    referer: '/v3/traffic/extend/asin',
    build: (m) => ({ queryVariations: false, asinList: [ASIN], originAsinList: [ASIN], market: m, page: 1, month: '', size: 20, orderColumn: 12, desc: true, exactly: false, ac: false, filterDeletedKeywords: false, keywordBidMatchType: 'exact' })
  },
  {
    name: 'relation/stat-keywords (marketId)',
    path: '/v3/api/relation/stat-keywords',
    method: 'post',
    referer: '/v3/traffic/keyword',
    build: (m) => ({ asin: ASIN, marketId: m, month: '', forceReStat: false, badges: [], limit: 20 })
  },
  {
    name: 'aba-research (market)',
    path: '/v3/api/aba-research',
    method: 'post',
    referer: '/v3/aba-research',
    build: (m) => ({ market: m, reverseType: 'W', page: 1, size: 20, departments: [], keywordBidMatchType: 'exact', 'order.field': 'searchfrequencyrank', 'order.desc': 'true' })
  },
  {
    name: 'relation/multi-stat-traffics (station)',
    path: '/v3/api/relation/multi-stat-traffics',
    method: 'post',
    referer: '/v3/traffic/keyword',
    build: (m) => ({ asinList: [ASIN], station: m, queryVariations: true })
  }
];

(async () => {
  for (const c of cases) {
    console.log('\n### ' + c.name);
    for (const m of [1, 'US', 'DE', 4, 'BR', 'AU', 'AE', 'SA']) {
      try {
        const s = await session();
        const url = BASE + c.path;
        const resp =
          c.method === 'post'
            ? await axios.post(url, c.build(m), { headers: hdrs(s, c.referer, true), timeout: 20000, validateStatus: () => true })
            : await axios.get(url, { params: c.build(m), headers: hdrs(s, c.referer), timeout: 20000, validateStatus: () => true });
        const d = resp.data && resp.data.data !== undefined ? resp.data.data : resp.data;
        const total = dig(d, ['total', 'pager.total', 'totalCount']);
        const items = dig(d, ['items', 'list', 'keywords', 'data']);
        const n = Array.isArray(items) ? items.length : Array.isArray(d) ? d.length : '-';
        let sample = '';
        if (Array.isArray(items) && items[0]) {
          const it = items[0];
          sample = [it.asin, it.keyword || it.keywords, it.searches, it.trafficPercentage, it.price].filter((x) => x !== undefined).join(',');
        }
        console.log('  ' + String(m).padEnd(7), 'st=' + resp.status, 'code=' + (resp.data && resp.data.code), 'total=' + total, 'n=' + n, sample ? 'sample=' + sample : '');
      } catch (e) {
        console.log('  ' + String(m).padEnd(7), 'ERR', e.message);
      }
      await sleep(400);
    }
  }
})();
