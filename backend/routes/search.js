const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const productService = require('../services/productService');

const router = express.Router();

function normalize(str) {
  return str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
}

router.get('/', asyncHandler(async (req, res) => {
  const { q, limit } = req.query;
  const query = normalize(q || '');
  const limitNum = parseInt(limit, 10) || 10;
  
  let products = await productService.getAllProducts();
  
  if (!query) {
    return res.json(products.slice(0, limitNum));
  }

  const queryWords = query.split(' ').filter(w => w.length > 2);

  const results = products.filter(p => {
    const normName = normalize(p.name);
    const normDesc = normalize(p.description || '');
    const normCat = normalize(p.category || '');
    return queryWords.some(w =>
      normName.includes(w) || normDesc.includes(w) || normCat.includes(w)
    );
  });

  // Ordenar: primero los que tienen match en nombre
  results.sort((a, b) => {
    const aName = queryWords.some(w => normalize(a.name).includes(w)) ? 1 : 0;
    const bName = queryWords.some(w => normalize(b.name).includes(w)) ? 1 : 0;
    return bName - aName;
  });

  res.json(results.slice(0, limitNum));
}));

module.exports = router;
