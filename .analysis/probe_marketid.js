'use strict';
const axios = require('axios');
const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

const BASE = process.env.SELLERSPRITE_BASE_URL || 'https://www.sellersprite.com';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0';

function fingerprint(html) {
  if (typeof html !== 'string') return '(non-string)';
  // 抓取前几个类目名（HTML 里的 nodeLabel 区域）
  const m = html.match(/Jeans|Western|Womens|Men|Home|Kitchen|Electronics|Sports|Pet|Toys|Beauty|Toys\s*&\s*Games/gi) || [];
  // 站点痕迹
  const site = (html.match(/amazon\.com\.(au|br|ae|sa|mx|jp|uk|de|fr|it|es|ca|in)/i) || [])[0] || '-';
  const sym = (html.match(/(AU\$|R\$|AED|SAR|﷼|\$|¥|£|€)/) || [])[0] || '-';
  return `len=${html.length} site=${site} sym=${sym} headTokens=${m.slice(0, 6).join('|')}`;
}

(async () => {
  const r = new Redis({ host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT });
  const keys = await r.keys('mcp:session:SELLERSPRITE');
  const raw = await r.hget('mcp:session:SELLERSPRITE', (await r.hkeys('mcp:session:SELLERSPRITE'))[0]);
  await r.quit();
  const s = JSON.parse(raw);

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': s.acceptLanguage || 'zh-CN,zh;q=0.9',
    cookie: s.cookie || '',
    'user-agent': s.userAgent || UA,
    referer: `${BASE}/v2/market-research`
  };
  if (s.xToken) headers['x-token'] = s.xToken;

  const base = {
    nodeIdPath: '', sampleNumber: 1, topn: 10, newReleaseNum: 3, departmentKeyword: '',
    'order.field': 'total_sales', 'order.desc': 'true', sellerNations: '',
    page: 1, size: 20, monthName: 'bsr_sales_nearly'
  };

  const candidates = [1, 'US', 2, 3, 7, 8, 9, 10, 11, 12, 100, 500, 900, 1000, 1001, 1010,
    526970, 28199, 795831, 806440, 328451, 451660, 450010, 421892, 456340,
    'AU', 'AE', 'BR', 'SA', 0, -1];

  for (const marketId of candidates) {
    const t0 = Date.now();
    try {
      const resp = await axios.get(`${BASE}/v2/market-research`, {
        params: { ...base, marketId }, headers, timeout: 25000, validateStatus: () => true
      });
      const d = resp.data;
      const isStr = typeof d === 'string';
      console.log(String(marketId).padEnd(8), 'status=' + resp.status, (Date.now() - t0) + 'ms',
        isStr ? fingerprint(d) : ('json:' + JSON.stringify(d).slice(0, 120)));
    } catch (e) {
      console.log(String(marketId).padEnd(8), 'ERR', e.message);
    }
    await new Promise((res) => setTimeout(res, 700));
  }
})().catch((e) => { console.error(e); process.exit(1); });
