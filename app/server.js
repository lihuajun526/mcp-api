const express = require('express');
const config = require('./config');
const { BusinessError, UpstreamError } = require('./errors');
const redis = require('./redis');
const db = require('./db');
const httpRoutes = require('./routes/httpRoutes');
const mcpProtocolRoute = require('./routes/mcpProtocolRoute');
const sellerSpriteMcpClient = require('./services/sellerSpriteMcpClient');

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'mcp-api-node', sellerSpriteMcp: sellerSpriteMcpClient.getStatus() });
});

app.use(httpRoutes);
app.use(mcpProtocolRoute);

app.use((err, req, res, next) => {
  if (err instanceof BusinessError) {
    return res.status(err.status || 400).json({ success: false, message: err.message, data: null });
  }
  if (err instanceof UpstreamError) {
    // 不向外暴露 err.url 等第三方/内部实现信息；url 仅记录到服务端日志
    console.error('Upstream error:', err.message, err.url ? `| upstream: ${err.url}` : '');
    const data = { hint: err.hint };
    if (err.upstreamCode !== undefined && err.upstreamCode !== null) data.upstreamCode = err.upstreamCode;
    if (err.httpStatus !== undefined && err.httpStatus !== null) data.httpStatus = err.httpStatus;
    return res.status(502).json({ success: false, message: err.message, data });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, message: 'Internal Server Error', data: null });
});

const server = app.listen(config.port, () => {
  console.log(`mcp-api-node listening on port ${config.port}`);
});

async function shutdown() {
  server.close();
  sellerSpriteMcpClient.stop(); // 停止上游工具列表定时刷新
  await redis.quit().catch(() => {});
  await db.pool.end().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
