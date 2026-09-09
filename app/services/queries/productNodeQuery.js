const upstreamClient = require('../upstreamClient');
const { sanitizeInternalFields } = require('../../toolResponse');
const { UpstreamError } = require('../../errors');
const config = require('../../config');
const { BusinessError } = require('../../errors');
const cacheService = require('../cacheService');
const billingService = require('../billingService');
const sessionService = require('../sessionService');

const PROVIDER = 'SELLERSPRITE';
const ENDPOINT_CODE = 'PRODUCT_NODE';

async function fetchProductNode(request, session) {
  if (!session.secretKey) {
    throw new UpstreamError('当前数据服务会话未配置访问凭证，无法调用该接口', {
      url: `${config.sellerSprite.openApiBaseUrl}${config.sellerSprite.productNodePath}`,
      hint: '请联系管理员补充数据服务凭证后重试'
    });
  }

  const params = { marketplace: request.marketplace };
  if (request.nodeIdPath) params.nodeIdPath = request.nodeIdPath;
  if (request.keyword) params.keyword = request.keyword;
  if (request.month) params.month = request.month;

  const headers = {
    'secret-key': session.secretKey || '',
    accept: 'application/json'
  };

  return upstreamClient.get(
    `${config.sellerSprite.openApiBaseUrl}${config.sellerSprite.productNodePath}`,
    { params, headers, timeout: config.sellerSprite.timeoutMs }
  );
}

async function queryProductNode(user, request) {
  if (!request || !request.marketplace) {
    throw new BusinessError('marketplace 不能为空', 400);
  }

  const cached = await cacheService.get(PROVIDER, ENDPOINT_CODE, request);
  if (cached) return cached;

  const session = await sessionService.pickSession(PROVIDER);
  const raw = await fetchProductNode(request, session);

  // Open API returns { code, message, data: [...] }; extract the items array
  const data = raw && Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);

  const cost = await billingService.getCostPoints(ENDPOINT_CODE);
  await billingService.deductAndRecord(user.userId, ENDPOINT_CODE, cost, PROVIDER);

  await cacheService.set(PROVIDER, ENDPOINT_CODE, request, data);
  return data;
}

module.exports = { queryProductNode };
