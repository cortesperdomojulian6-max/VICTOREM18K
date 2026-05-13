const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validators');

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const err = validateRegister(req.body);
  if (err) return res.status(400).json({ error: err });
  const result = await authService.register(req.body);
  return res.status(201).json(result);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const err = validateLogin(req.body);
  if (err) return res.status(400).json({ error: err });
  const result = await authService.login(req.body);
  return res.json(result);
}));

router.get('/me', requireAuth, (req, res) => {
  return res.json(authService.getMe(req.user));
});

router.post('/refresh', requireAuth, asyncHandler(async (req, res) => {
  const token = authService.refreshToken(req.user);
  return res.json({ token });
}));

module.exports = router;
