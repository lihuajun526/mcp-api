'use strict';
const axios = require('axios');
const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

const BASE = process.env.SELLERSPRITE_BASE_URL || 'https://www.sellersprite.com';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0';

(async () => {
  const r = new Redis({ host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT });
  const raw = await r.hget('mcp:session:SELLERSPRITE', '17895607097');
  const s = JSON.parse(raw);
  await r.quit();

  const headers = {
    accept: 'application/json, text/plain, */*',
    'accept-language': s.acceptLanguage || 'zh-CN,zh;q=0.9',
    'content-type': 'application/json;charset=UTF-8',
    cookie: s.cookie || '',
    'user-agent': s.userAgent || UA
  };
  if (s.gtk) headers['gtk'] = s.gtk;

  const tests = [
    ['traffic_extend', '/v3/api/traffic/extend/asin', {
      queryVariations: false, asinList: ['B07Z82895W'], originAsinList: ['B07Z82895W'], market: 1,
      page: 1, month: '', size: 20, orderColumn: 12, desc: true, exactly: false, ac: false,
      filterDeletedKeywords: false, keywordBidMatchType: 'exact'
    }, `${BASE}/v3/traffic/extend/asin`],
    ['traffic_listing', '/v3/api/relation/traffic', {
      asinList: ['B098T9ZFB5'], market: 1, page: 1, size: 20, relations: ['VAV'], variations: true,
      orderColumn: 1, desc: true
    }, `${BASE}/v3/relation-keyword`],
  ];

  for (const [name, p, body, referer] of tests) {
    const t0 = Date.now();
    try {
      const resp = await axios.post(BASE + p, body, { headers: { ...headers, referer }, timeout: 60000, validateStatus: () => true });
      console.log(`### ${name} status=${resp.status} time=${Date.now() - t0}ms`);
      const d = resp.data;
      console.log('  code=' + d.code + ' msg=' + d.message);
      const data = d.data || {};
      console.log('  data keys=' + JSON.stringify(Object.keys(data)));
      if (Array.isArray(data.items)) console.log('  items=' + data.items.length + ' total=' + data.total + ' itemKeys=' + JSON.stringify(Object.keys(data.items[0] || {})));
      if (Array.isArray(data)) console.log('  array len=' + data.length);
      console.log('  rawHead=' + JSON.stringify(d).slice(0, 400));
    } catch (e) {
      console.log(`### ${name} ERROR time=${Date.now() - t0}ms msg=${e.message}`);
    }
  }
})();
