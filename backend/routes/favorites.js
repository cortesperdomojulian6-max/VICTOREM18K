const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const favoriteService = require('../services/favoriteService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const favorites = await favoriteService.getFavorites(req.user.id);
  return res.json({ favorites, ids: favorites.map(f => f.product_id) });
}));

router.post('/:productId', requireAuth, asyncHandler(async (req, res) => {
  const result = await favoriteService.toggleFavorite(req.user.id, req.params.productId);
  return res.json(result);
}));

router.get('/check/:productId', requireAuth, asyncHandler(async (req, res) => {
  const favorited = await favoriteService.isFavorited(req.user.id, req.params.productId);
  return res.json({ favorited });
}));

module.exports = router;
