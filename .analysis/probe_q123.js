'use strict';
require('dotenv').config({ path: '.env.local' });
const client = require('../app/services/sellerSpriteMcpClient');

(async () => {
  await client.ensureReady();

  async function raw(label, name, args) {
    try {
      const res = await client.callTool(name, args);
      return (res && res.data) || res;
    } catch (e) {
      console.log('\n### ' + label + ' ERR:', (e.message || String(e)).slice(0, 300));
      return null;
    }
  }
  function envelope(label, data) {
    console.log('\n### ' + label);
    if (!data) { console.log('  (null)'); return; }
    if (Array.isArray(data)) {
      console.log('  数组 len=' + data.length, 'first=', JSON.stringify(data[0]).slice(0, 400));
      return;
    }
    const ks = Object.keys(data || {});
    console.log('  顶层字段(' + ks.length + '):', ks.join(','));
    if ('order' in data) console.log('  order =', JSON.stringify(data.order));
    if (Array.isArray(data.items) && data.items[0]) {
      console.log('  item 字段(' + Object.keys(data.items[0]).length + '):', Object.keys(data.items[0]).join(','));
    }
  }

  envelope('keyword_conversion', await raw('keyword_conversion', { request: { marketplace: 'US', keyword: 'socks', timeType: 'WEEK', size: 20, page: 1 } }));

  const n1 = await raw('product_node', { request: { marketplace: 'US', keyword: 'Home & Kitchen', month: '202508' } });
  const n2 = await raw('product_node', { request: { marketplace: 'US', keyword: 'Home & Kitchen', month: '202401' } });
  console.log('\n### product_node month compare');
  console.log('  202508 first=', JSON.stringify(n1 && n1[0]).slice(0, 300));
  console.log('  202401 first=', JSON.stringify(n2 && n2[0]).slice(0, 300));
  console.log('  完全相同?', JSON.stringify(n1) === JSON.stringify(n2));

  envelope('traffic_listing', await raw('traffic_listing', { request: { marketplace: 'US', asinList: ['B07Z82895W'], size: 20, page: 1, relations: ['VAV'] } }));

  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
