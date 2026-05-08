const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const wompiService = require('../services/wompiService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/config', (req, res) => {
  const config = wompiService.getConfig();
  return res.json(config);
});

router.post('/create-payment', requireAuth, asyncHandler(async (req, res) => {
  const result = await wompiService.createPayment(req.user.id, req.body);
  return res.json(result);
}));

router.get('/transaction/:id', requireAuth, asyncHandler(async (req, res) => {
  const result = await wompiService.getTransaction(req.params.id);
  return res.json(result);
}));

router.post('/webhook', asyncHandler(async (req, res) => {
  const result = await wompiService.handleWebhook(req.body, req.headers);
  return res.json(result);
}));

module.exports = router;
