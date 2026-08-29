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
    competingLookupPath: process.env.SELLERSPRITE_COMPETING_LOOKUP_PATH || '/v3/api/competing-lookup',
    asinSalesPath: process.env.SELLERSPRITE_ASIN_SALES_PATH || '/v2/tools/sales-estimator/asin.json',
    asinReversingPath: process.env.SELLERSPRITE_ASIN_REVERSING_PATH || '/v3/api/relation/reversing',
    bsrSalesPath: process.env.SELLERSPRITE_BSR_SALES_PATH || '/v2/tools/sales-estimator/bsr.json',
    keywordResearchPath: process.env.SELLERSPRITE_KEYWORD_RESEARCH_PATH || '/v2/keyword-research',
    keywordMinerPath: process.env.SELLERSPRITE_KEYWORD_MINER_PATH || '/v3/api/keyword-miner',
    trafficExtendPath: process.env.SELLERSPRITE_TRAFFIC_EXTEND_PATH || '/v3/api/traffic/extend/asin',
    keywordOrderPath: process.env.SELLERSPRITE_KEYWORD_ORDER_PATH || '/v2/aba/reverse/search',
    googleTrendPath: process.env.SELLERSPRITE_GOOGLE_TREND_PATH || '/v2/keyword/google-trends.json',
    keywordConversionPath: process.env.SELLERSPRITE_KEYWORD_CONVERSION_PATH || '/v3/api/keyword-conv',
    abaResearchPath: process.env.SELLERSPRITE_ABA_RESEARCH_PATH || '/v3/api/aba-research',
    timeoutMs: Number(process.env.SELLERSPRITE_TIMEOUT_MS || 10000)
  },
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true' ? true : false,
    readEnabled: process.env.CACHE_READ_ENABLED === 'true' ? true : false,
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
