const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const config = require('../../config');
const { UpstreamError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');
const { transformAsinSalesTrendResponse } = require('../../transformers/asinSalesTrendTransformer');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'ASIN_SALES_TREND';

async function fetchAsinSalesTrend(request, session) {
  const url = `${config.sellerSprite.openApiBaseUrl}${config.sellerSprite.asinSalesTrendPath}/${request.marketplace}/${request.asin}/sales-trend`;
  // 优先使用全局配置的 open API 密钥，回退到会话中的密钥
  const secretKey = config.sellerSprite.openApiSecretKey || session.secretKey;
  if (!secretKey) {
    throw new UpstreamError('当前数据服务会话未配置访问凭证，无法调用该接口', {
      url,
      hint: '请联系管理员配置 SELLERSPRITE_OPEN_API_SECRET_KEY 环境变量后重试'
    });
  }
  const headers = {
    'secret-key': secretKey,
    'content-type': 'application/json;charset=UTF-8',
    accept: 'application/json'
  };
  return upstreamClient.get(url, { headers, timeout: config.sellerSprite.timeoutMs });
}

/**
 * open API 鉴权失败时，降级到 SS MCP 代理获取销量趋势数据。
 * 两者返回结构相同（均遵循官方 asin_sales_trend 格式），无需再次转换。
 */
async function fetchAsinSalesTrendViaMcp(request) {
  const mcpClient = require('../sellerSpriteMcpClient');
  await mcpClient.ensureReady();
  const { data } = await mcpClient.callTool('asin_sales_trend', {
    marketplace: request.marketplace,
    asin: request.asin
  });
  return data;
}

async function queryAsinSalesTrend(user, request) {
  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);

  let transformed;
  try {
    const raw = await fetchAsinSalesTrend(request, session);
    transformed = sanitizeInternalFields(transformAsinSalesTrendResponse(raw, request));
  } catch (e) {
    // open API 鉴权失败（该账号未开通 open API 权限）→ 自动降级到 SS MCP 代理
    const isAuthError = e.upstreamCode === 'ERROR_UNAUTHORIZED'
      || (e.message && e.message.includes('未授权'));
    if (!isAuthError) throw e;
    console.log('[asin_sales_trend] open API 鉴权失败，降级到 SS MCP 代理');
    const data = await fetchAsinSalesTrendViaMcp(request);
    transformed = sanitizeInternalFields(data);
  }

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, transformed);
  return transformed;
}

module.exports = { queryAsinSalesTrend };
