const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return res.status(201).json(result);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return res.json(result);
}));

router.get('/me', requireAuth, (req, res) => {
  return res.json(authService.getMe(req.user));
});

module.exports = router;
