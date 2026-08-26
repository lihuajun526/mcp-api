const express = require('express');
const config = require('../config');
const authService = require('../services/authService');
const { queryAsinDetail } = require('../services/queries/asinDetailQuery');
const { queryCompetingLookup } = require('../services/queries/competitorLookupQuery');
const { queryBsrSales } = require('../services/queries/bsrSalesQuery');
const { queryAsinReversing } = require('../services/queries/asinReversingQuery');
const { queryAsinSales } = require('../services/queries/asinSalesQuery');

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
    const data = await queryAsinSales(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

router.post('/api/v1/mcp/asin/reversing', async (req, res, next) => {
  try {
    const apiKey = req.header(config.mcp.apiKeyHeader);
    const user = await authService.authenticate(apiKey);
    await authService.consumeRateLimit(user.userId, user.qpsLimit);
    const data = await queryAsinReversing(user, req.body || {});
    res.json({ success: true, message: 'OK', data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
