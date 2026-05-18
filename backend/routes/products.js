const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const productService = require('../services/productService');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateProduct } = require('../validators');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  const withViewCount = products.map(p => ({
    ...p,
    view_count: Math.floor(Math.random() * (50 - 5 + 1)) + 5
  }));
  return res.json(withViewCount);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return res.json(product);
}));

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const err = validateProduct(req.body);
  if (err) return res.status(400).json({ error: 'Datos inválidos', details: err });
  const product = await productService.createProduct(req.body);
  return res.status(201).json(product);
}));

router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return res.json(product);
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  return res.json(result);
}));

module.exports = router;
