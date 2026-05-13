const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const userService = require('../services/userService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  return res.json(userService.getProfile(req.user));
});

// GET /profile — alias used by the frontend (auth.tsx, miperfil, checkout)
router.get('/profile', requireAuth, (req, res) => {
  return res.json(userService.getProfile(req.user));
});

router.put('/profile', requireAuth, asyncHandler(async (req, res) => {
  const result = await userService.updateProfile(req.user.id, req.body);
  return res.json(result);
}));

router.put('/password', requireAuth, asyncHandler(async (req, res) => {
  const result = await userService.changePassword(req.user.id, req.body);
  return res.json(result);
}));

router.delete('/account', requireAuth, asyncHandler(async (req, res) => {
  const result = await userService.deleteAccount(req.user.id);
  return res.json(result);
}));

module.exports = router;
