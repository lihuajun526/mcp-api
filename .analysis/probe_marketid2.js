'use strict';
const axios = require('axios');
const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });
const { transformMarketResearchResponse } = require('../app/transformers/marketResearchTransformer');

const BASE = process.env.SELLERSPRITE_BASE_URL || 'https://www.sellersprite.com';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0';

(async () => {
  const r = new Redis({ host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT });
  const hk = await r.hkeys('mcp:session:SELLERSPRITE');
  const raw = await r.hget('mcp:session:SELLERSPRITE', hk[0]);
  await r.quit();
  const s = JSON.parse(raw);

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': s.acceptLanguage || 'zh-CN,zh;q=0.9',
    cookie: s.cookie || '', 'user-agent': s.userAgent || UA,
    referer: `${BASE}/v2/market-research`
  };
  if (s.xToken) headers['x-token'] = s.xToken;

  const candidates = [1, 3, 4, 5, 6, 7, 35691, 44551, 44571, 771770,
    526970, 28199, 795831, 806440, 328451, 451660, 450010, 421892, 456340,
    8, 9, 10, 11, 12, 100, 500, 1000, 1001, 1010];
  const base = {
    nodeIdPath: '', sampleNumber: 1, topn: 10, newReleaseNum: 3, departmentKeyword: '',
    'order.field': 'total_sales', 'order.desc': 'true', sellerNations: '',
    page: 1, size: 20, monthName: 'bsr_sales_nearly'
  };

  for (const marketId of candidates) {
    const params = { ...base, marketId, marketplace: 'X' };
    try {
      const resp = await axios.get(`${BASE}/v2/market-research`, { params: (() => { const { marketplace, ...p } = params; return p; })(), headers, timeout: 25000, validateStatus: () => true });
      let out;
      try {
        const t = transformMarketResearchResponse(resp.data, params);
        const it = (t.items || [])[0] || {};
        out = `total=${t.total} items=${(t.items || []).length} first=${it.nodeIdPath || '-'} / ${it.nodeLabelName || '-'}`;
      } catch (e) { out = 'transform-fail: ' + e.message; }
      console.log(String(marketId).padEnd(8), 'status=' + resp.status, out);
    } catch (e) { console.log(String(marketId).padEnd(8), 'ERR', e.message); }
    await new Promise((res) => setTimeout(res, 800));
  }
})().catch((e) => { console.error(e); process.exit(1); });
