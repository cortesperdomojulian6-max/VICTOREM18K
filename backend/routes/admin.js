const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const adminService = require('../services/adminService');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const productService = require('../services/productService');

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

router.get('/orders', asyncHandler(async (req, res) => {
  const orders = await adminService.getAllOrders();
  return res.json(orders);
}));

router.put('/orders/:id/status', asyncHandler(async (req, res) => {
  const { estado } = req.body;
  const result = await adminService.updateOrderStatus(req.params.id, estado);
  return res.json(result);
}));

router.get('/products', asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  return res.json(products);
}));

router.post('/products', asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return res.status(201).json(product);
}));

router.get('/mayoreo-analysis', asyncHandler(async (req, res) => {
  const analysis = await adminService.getMayoreoAnalysis();
  return res.json(analysis);
}));

router.put('/products/:id', asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return res.json(product);
}));

router.delete('/products/:id', asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  return res.json(result);
}));

module.exports = router;
