const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const orderService = require('../services/orderService');
const { requireAuth } = require('../middleware/auth');
const { validateOrder } = require('../validators');

const router = express.Router();

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const validationErr = validateOrder(req.body);
  if (validationErr) {
    return res.status(400).json({ error: 'Datos inválidos', details: validationErr });
  }
  const order = await orderService.createOrder(req.user.id, req.body);
  return res.status(201).json(order);
}));

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const orders = await orderService.getOrdersByUser(req.user.id);
  return res.json(orders);
}));

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user.id, req.params.id);
  return res.json(order);
}));

module.exports = router;
