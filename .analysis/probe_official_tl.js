'use strict';
require('dotenv').config({ path: '.env.local' });
const client = require('../app/services/sellerSpriteMcpClient');

(async () => {
  await client.ensureReady();
  const args = { request: { marketplace: 'US', asinList: ['B07Z82895W'], size: 20, page: 1, relations: ['VAV'] } };
  try {
    const res = await client.callTool('traffic_listing', args);
    const data = (res && res.data) || res;
    const items = (data && data.items) || [];
    const first = items[0] || {};
    const keys = Object.keys(first);
    console.log('官方 traffic_listing: total=' + (data && data.total), 'items=' + items.length);
    console.log('官方 item 字段(' + keys.length + '):', keys.join(','));
    console.log('--- 顶层字段 ---', Object.keys(data || {}).join(','));
  } catch (e) {
    console.log('ERR', (e.message || String(e)).slice(0, 300));
  }
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
