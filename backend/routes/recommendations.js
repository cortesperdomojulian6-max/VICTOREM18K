const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { getRecommendations } = require('../services/recommendationService');

const router = express.Router();

router.get('/:productId', asyncHandler(async (req, res) => {
  const recs = await getRecommendations(req.params.productId, 3);
  res.json(recs);
}));

module.exports = router;
