'use strict';
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: process.env.ENV_FILE || '.env.local' });

const URL = process.env.SELLERSPRITE_MCP_URL || 'https://mcp.sellersprite.com/mcp';
const KEY = process.env.SELLERSPRITE_MCP_SECRET_KEY;

(async () => {
  let id = 0;
  const post = async (payload) => {
    const resp = await axios.post(URL, payload, {
      timeout: 30000, responseType: 'text',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'secret-key': KEY },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 202
    });
    if (resp.status === 202 || resp.data === '') return {};
    const ct = String(resp.headers['content-type'] || '');
    if (ct.includes('text/event-stream')) {
      const blocks = String(resp.data).split(/\r?\n\r?\n/);
      for (const b of blocks) {
        const dl = b.split(/\r?\n/).filter(l => l.startsWith('data:')).map(l => l.slice(5).trim());
        if (dl.length) { try { return JSON.parse(dl.join('\n')); } catch (e) {} }
      }
      throw new Error('SSE parse failed');
    }
    return JSON.parse(resp.data);
  };
  await post({ jsonrpc: '2.0', id: ++id, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'dump', version: '1' } } });
  await post({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });
  const res = await post({ jsonrpc: '2.0', id: ++id, method: 'tools/list', params: {} });
  const tools = res.result.tools;
  fs.writeFileSync(path.join(__dirname, 'official_tools.json'), JSON.stringify(tools, null, 2));
  console.log('official tool count:', tools.length);
  console.log(tools.map(t => t.name).join('\n'));
})().catch(e => { console.error('ERR', e.message, e.response && e.response.status); process.exit(1); });
