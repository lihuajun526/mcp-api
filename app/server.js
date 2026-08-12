const express = require('express');
const config = require('./config');
const { BusinessError } = require('./errors');
const redis = require('./redis');
const db = require('./db');
const httpRoutes = require('./routes/httpRoutes');
const mcpProtocolRoute = require('./routes/mcpProtocolRoute');

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'mcp-api-node' });
});

app.use(httpRoutes);
app.use(mcpProtocolRoute);

app.use((err, req, res, next) => {
  if (err instanceof BusinessError) {
    return res.status(err.status || 400).json({ success: false, message: err.message, data: null });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, message: err.message || 'Internal Server Error', data: null });
});

const server = app.listen(config.port, () => {
  console.log(`mcp-api-node listening on port ${config.port}`);
});

async function shutdown() {
  server.close();
  await redis.quit().catch(() => {});
  await db.pool.end().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
