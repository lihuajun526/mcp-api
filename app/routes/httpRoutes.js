const express = require('express');
const config = require('../config');
const authService = require('../services/authService');
const { queryAsinDetail } = require('../services/queries/asinDetailQuery');
const { queryCompetingLookup } = require('../services/queries/competitorLookupQuery');
const { queryAsinCompetitor } = require('../services/queries/asinCompetitorQuery');
const { queryProductResearch } = require('../services/queries/productResearchQuery');
const { queryBsrSales } = require('../services/queries/bsrSalesQuery');
const { queryTrafficKeyword } = require('../services/queries/trafficKeywordQuery');
const { queryAsinPrediction } = require('../services/queries/asinPredictionQuery');
const { queryKeywordResearch } = require('../services/queries/keywordResearchQuery');
const { queryTrafficExtend } = require('../services/queries/trafficExtendQuery');
const { queryKeywordOrder } = require('../services/queries/keywordOrderQuery');
const { queryGoogleTrend } = require('../services/queries/googleTrendQuery');
const { queryKeywordConversion } = require('../services/queries/keywordConversionQuery');
const { queryAbaResearchWeekly } = require('../services/queries/abaResearchWeeklyQuery');
const { queryAbaResearchMonthly } = require('../services/queries/abaResearchMonthlyQuery');
const { queryTrafficKeywordStat } = require('../services/queries/trafficKeywordStatQuery');
const { queryTrafficListingStat } = require('../services/queries/trafficListingStatQuery');
const { queryTrafficListing } = require('../services/queries/trafficListingQuery');
const { queryMarketResearch } = require('../services/queries/marketResearchQuery');
const { queryProductNode } = require('../services/queries/productNodeQuery');
const { queryAsinSalesTrend } = require('../services/queries/asinSalesTrendQuery');
const { queryCategoryFirst } = require('../services/queries/categoryFirstQuery');
const { queryUserQuota } = require('../services/queries/userQuotaQuery');

const router = express.Router();

router.get('/api/v1/mcp/list_tools', async (req, res, next) => {
  try {
    const tools = authService.readTools();
    res.json({ success: true, message: 'OK', data: { tools } });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/asin/detail', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryAsinDetail(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/competing/lookup', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryCompetingLookup(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/bsr/sales', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryBsrSales(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/asin/sales', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryAsinPrediction(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/traffic/keyword', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryTrafficKeyword(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/keyword/research', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryKeywordResearch(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/traffic/extend', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryTrafficExtend(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/keyword/order', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryKeywordOrder(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.get('/api/v1/mcp/google/trend', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryGoogleTrend(user, req.query || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/keyword/conversion', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryKeywordConversion(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/aba/research/weekly', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryAbaResearchWeekly(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/aba/research/monthly', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryAbaResearchMonthly(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/traffic/keyword/stat', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryTrafficKeywordStat(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/traffic/listing/stat', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryTrafficListingStat(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/traffic/listing', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryTrafficListing(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/market/research', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryMarketResearch(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.get('/api/v1/mcp/product/node', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryProductNode(user, req.query || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.get('/api/v1/mcp/asin/competitor', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryAsinCompetitor(user, req.query || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/product/research', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryProductResearch(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.get('/api/v1/mcp/category/first', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryCategoryFirst(user, req.query || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.get('/api/v1/mcp/asin/sales-trend', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryAsinSalesTrend(user, req.query || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.get('/api/v1/mcp/user/quota', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = queryUserQuota(user);
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
