const express = require('express');
const config = require('../config');
const authService = require('../services/authService');
const toolHandlers = require('./tools');

const router = express.Router();

function ok(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function fail(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

router.post('/mcp', async (req, res) => {
  const body = req.body || {};
  const id = body.id;
  const method = body.method;

  try {
    if (method === 'initialize') {
      return res.json(
        ok(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'mcp-api-node', version: '1.0.0' }
        })
      );
    }

    if (method === 'list_tools' || method === 'tools/list') {
      return res.json(ok(id, { tools: authService.readTools() }));
    }

    if (method === 'tools/call') {
      const apiKey = req.header(config.mcp.apiKeyHeader);
      if (!apiKey) {
        return res.json(fail(id, -32001, 'missing API key'));
      }
      const user = await authService.authenticate(apiKey);
      await authService.consumeRateLimit(user.userId, user.qpsLimit);

      const params = body.params || {};
      const toolName = params.name;
      const args = params.arguments || {};

      const handler = toolHandlers[toolName];
      if (!handler) {
        return res.json(fail(id, -32602, `Unsupported tool: ${toolName}`));
      }

      const result = await handler.handle(args, user);
      return res.json(ok(id, result));
    }

    return res.json(fail(id, -32601, `Method not found: ${method}`));
  } catch (e) {
    const code = e.code && typeof e.code === 'number' ? e.code : -32000;
    return res.json(fail(id, code, e.message || 'internal error'));
  }
});

module.exports = router;
