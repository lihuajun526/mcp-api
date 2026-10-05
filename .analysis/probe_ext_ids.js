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
function hdrs(s, referer) {
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
const IDS = [
  ['US', 1], ['DE', 4], ['UK', 3], ['FR', 5], ['JP', 6], ['CA', 7],
  ['IT', 35691], ['ES', 44551], ['IN', 44571], ['MX', 771770],
  ['AU', 111172], ['AE', 9], ['SA', 13], ['BR', 15]
];

(async () => {
  console.log('### relation/traffic (market=int)');
  for (const [code, id] of IDS) {
    const s = await session();
    const resp = await axios.post(
      BASE + '/v3/api/relation/traffic',
      { market: id, pageNum: 1, pageSize: 20, desc: true, orderField: 'relationCount', relations: ['vav'], queryVariations: true, asinList: [ASIN] },
      { headers: hdrs(s, '/v3/traffic/keyword'), timeout: 20000, validateStatus: () => true }
    );
    const d = resp.data && resp.data.data !== undefined ? resp.data.data : resp.data;
    const keys = d && typeof d === 'object' ? Object.keys(d).slice(0, 8).join(',') : typeof d;
    const arr = d && (d.items || d.list || d.relationItems);
    console.log('  ' + code.padEnd(4), String(id).padEnd(8), 'st=' + resp.status, 'code=' + (resp.data && resp.data.code), 'n=' + (Array.isArray(arr) ? arr.length : '-'), 'keys=' + keys);
    await sleep(350);
  }
  console.log('### relation/stat-keywords (marketId=int)');
  for (const [code, id] of IDS) {
    const s = await session();
    const resp = await axios.post(
      BASE + '/v3/api/relation/stat-keywords',
      { asin: ASIN, marketId: id, month: '', forceReStat: false, badges: [], limit: 20 },
      { headers: hdrs(s, '/v3/traffic/keyword'), timeout: 20000, validateStatus: () => true }
    );
    const d = resp.data && resp.data.data !== undefined ? resp.data.data : resp.data;
    const keys = d && typeof d === 'object' ? Object.keys(d).slice(0, 8).join(',') : typeof d;
    console.log('  ' + code.padEnd(4), String(id).padEnd(8), 'st=' + resp.status, 'code=' + (resp.data && resp.data.code), 'keys=' + keys);
    await sleep(350);
  }
})();
