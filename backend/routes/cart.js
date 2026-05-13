const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const cartService = require('../services/cartService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  return res.json(cart);
}));

router.post('/items', requireAuth, asyncHandler(async (req, res) => {
  const { product_id, quantity } = req.body;
  const item = await cartService.addItem(req.user.id, product_id, quantity);
  return res.status(201).json(item);
}));

router.put('/items/:id', requireAuth, asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const result = await cartService.updateItem(req.user.id, req.params.id, quantity);
  return res.json(result);
}));

router.delete('/items/:id', requireAuth, asyncHandler(async (req, res) => {
  const result = await cartService.removeItem(req.user.id, req.params.id);
  return res.json(result);
}));

router.delete('/', requireAuth, asyncHandler(async (req, res) => {
  const result = await cartService.clearCart(req.user.id);
  return res.json(result);
}));

module.exports = router;
