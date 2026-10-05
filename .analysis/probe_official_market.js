'use strict';
require('dotenv').config({ path: '.env.local' });
const client = require('../app/services/sellerSpriteMcpClient');

(async () => {
  await client.ensureReady();
  const tools = client.getCachedTools().map((t) => t.name);
  console.log('官方工具数:', tools.length, '| 含 market_research:', tools.includes('market_research'));

  for (const mp of ['US', 'AU', 'AE', 'BR', 'SA', 'JP']) {
    try {
      const res = await client.callTool('market_research', { request: { marketplace: mp, size: 20, page: 1 } });
      // 结果可能是 {code,message,data} 或 MCP content
      const data = (res && res.data) || res;
      const items = (data && data.items) || [];
      const it = items[0] || {};
      console.log(mp.padEnd(4), 'code=' + (data && data.code), 'total=' + (data && data.total),
        'first=' + (it.nodeIdPath || it.nodeId || '-') + ' / ' + (it.nodeLabelName || '-'));
    } catch (e) {
      console.log(mp.padEnd(4), 'ERR', (e.message || String(e)).slice(0, 200));
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  process.exit(0);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
