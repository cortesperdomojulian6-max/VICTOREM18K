const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { describeCustomOrder } = require('../services/descriptionService');

const router = express.Router();

router.post('/custom-order', asyncHandler(async (req, res) => {
  const { config } = req.body;
  if (!config) {
    return res.status(400).json({ error: 'config requerido' });
  }
  const description = describeCustomOrder(config);
  res.json({ description });
}));

module.exports = router;
