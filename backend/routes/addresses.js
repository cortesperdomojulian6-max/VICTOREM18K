const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const addressService = require('../services/addressService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id);
  return res.json(addresses);
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  return res.status(201).json(address);
}));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.user.id, parseInt(req.params.id, 10), req.body);
  return res.json(address);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const result = await addressService.deleteAddress(req.user.id, parseInt(req.params.id, 10));
  return res.json(result);
}));

module.exports = router;
