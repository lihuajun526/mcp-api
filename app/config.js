const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: process.env.ENV_FILE || '.env' });

module.exports = {
  port: Number(process.env.PORT || 18080),
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE || 'mcp_api',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '12345678',
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONN_LIMIT || 10)
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined
  },
  mcp: {
    apiKeyHeader: process.env.MCP_SECURITY_API_KEY_HEADER || 'X-API-Key',
    toolsPath: path.join(process.cwd(), 'app', 'tools.json')
  },
  sellerSprite: {
    baseUrl: process.env.SELLERSPRITE_BASE_URL || 'https://www.sellersprite.com',
    competingLookupPath: '/v3/api/competing-lookup',
    asinSalesPath: '/v2/tools/sales-estimator/asin.json',
    trafficKeywordPath: '/v3/api/relation/reversing',
    bsrSalesPath: '/v2/tools/sales-estimator/bsr.json',
    keywordResearchPath: '/v2/keyword-research',
    keywordMinerPath: '/v3/api/keyword-miner',
    trafficExtendPath: '/v3/api/traffic/extend/asin',
    keywordOrderPath: '/v2/aba/reverse/search',
    googleTrendPath: '/v2/keyword/google-trends.json',
    keywordConversionPath: '/v3/api/keyword-conv',
    abaResearchPath: '/v3/api/aba-research',
    trafficKeywordStatPath: '/v3/api/relation/stat-keywords',
    trafficListingStatPath: '/v3/api/relation/multi-stat-traffics',
    trafficListingPath: '/v3/api/relation/traffic',
    marketResearchPath: '/v2/market-research',
    productResearchPath: '/v3/api/product-research',
    productNodePath: '/v1/product/node',
    chartMonthlyPath: '/v2/competitor-lookup/chart-monthly.json',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0',
    timeoutMs: Number(process.env.SELLERSPRITE_TIMEOUT_MS || 10000)
  },
  // 卖家精灵官方 MCP 代理转发（补齐本地缺失工具）
  sellerSpriteMcp: {
    enabled: process.env.SELLERSPRITE_MCP_ENABLED !== 'false',
    url: process.env.SELLERSPRITE_MCP_URL || 'https://mcp.sellersprite.com/mcp',
    // 注意：MCP Key 与开放 API Key 不通用，需在开放平台【我的密钥】单独创建 MCP 密钥
    secretKey: process.env.SELLERSPRITE_MCP_SECRET_KEY || '',
    prefix: process.env.SELLERSPRITE_MCP_TOOL_PREFIX || 'ss_',
    // 转发工具白名单：空 = 默认差集（24 个本地缺失工具），* = 全部非 secret 工具，逗号分隔 = 指定子集
    tools: process.env.SELLERSPRITE_MCP_TOOLS || '',
    timeoutMs: Number(process.env.SELLERSPRITE_MCP_TIMEOUT_MS || 30000),
    refreshMs: Number(process.env.SELLERSPRITE_MCP_REFRESH_MS || 600000),
    // 出站代理：'none' 强制直连；显式 URL 用指定代理；默认读取 HTTPS_PROXY/https_proxy 环境变量
    proxy: process.env.SELLERSPRITE_MCP_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || ''
  },
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    readEnabled: process.env.CACHE_READ_ENABLED === 'true',
    ttlSeconds: Number(process.env.CACHE_TTL_SECONDS || 300)
  },
  categoryCrawler: {
    path: process.env.SELLERSPRITE_CATEGORY_PATH || '/v2/competitor-lookup/nodes',
    marketId: Number(process.env.SELLERSPRITE_CATEGORY_MARKET_ID || 1),
    site: process.env.SELLERSPRITE_CATEGORY_SITE || 'US',
    tableName: process.env.SELLERSPRITE_CATEGORY_TABLE || 'bsr_sales_nearly',
    childNodeParam: process.env.SELLERSPRITE_CATEGORY_CHILD_NODE_PARAM || 'nodeIdPath',
    cookie: process.env.SELLERSPRITE_CATEGORY_COOKIE || '',
    referer: process.env.SELLERSPRITE_CATEGORY_REFERER || 'https://www.sellersprite.com/v3/competitor-lookup',
    accept: process.env.SELLERSPRITE_CATEGORY_ACCEPT || 'application/json, text/plain, */*',
    acceptLanguage: process.env.SELLERSPRITE_CATEGORY_ACCEPT_LANGUAGE || 'zh-CN,zh;q=0.9,en;q=0.8',
    userAgent:
      process.env.SELLERSPRITE_CATEGORY_USER_AGENT ||
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
};
