const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const adminService = require('../services/adminService');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/users', asyncHandler(async (req, res) => {
  const users = await adminService.getUsers();
  return res.json(users);
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  const result = await adminService.deleteUser(req.params.id, req.user.id);
  return res.json(result);
}));

router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();
  return res.json(stats);
}));

module.exports = router;
