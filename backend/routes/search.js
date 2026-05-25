const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const productService = require('../services/productService');

const router = express.Router();

function normalize(str) {
  return str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
}

// Mapa de intenciones (búsqueda semántica heurística)
const semanticRules = [
  { keywords: ['matrimonio', 'boda', 'compromiso', 'aniversario', 'elegante', 'premium'], boost: { category: 'anillos', word: 'premium' } },
  { keywords: ['hombre', 'masculino', 'papa', 'gruesa'], boost: { category: 'pulsos', word: 'diamantada' } },
  { keywords: ['cruz', 'religioso', 'dios', 'virgen', 'santo', 'fe'], boost: { word: 'cruz', word2: 'virgen' } },
  { keywords: ['delgada', 'fina', 'discreta', 'sencilla'], boost: { category: 'tobilleras', word: 'delicada' } },
  { keywords: ['suerte', 'trebol', 'herradura', 'dinero'], boost: { word: 'suerte', word2: 'trebol' } },
  { keywords: ['regalo', 'detalles'], boost: { word: 'manilla' } }
];

router.get('/', asyncHandler(async (req, res) => {
  const { q, tipo, limit } = req.query;
  const query = normalize(q || '');
  const limitNum = parseInt(limit, 10) || 10;
  
  let products = await productService.getAllProducts();
  
  if (!query) {
    return res.json(products.slice(0, limitNum));
  }

  const queryWords = query.split(' ').filter(w => w.length > 2);

  products.forEach(p => {
    p.score = 0;
    const nameNorm = normalize(p.name);
    const descNorm = normalize(p.description);
    const catNorm = normalize(p.category);
    
    // 1. Text match básico
    queryWords.forEach(w => {
      if (nameNorm.includes(w)) p.score += 10;
      if (descNorm.includes(w)) p.score += 5;
      if (catNorm.includes(w)) p.score += 8;
    });

    // 2. Mapeo Semántico
    for (const rule of semanticRules) {
      if (rule.keywords.some(k => query.includes(k))) {
        if (rule.boost.category && catNorm.includes(rule.boost.category)) {
          p.score += 15;
        }
        if (rule.boost.word && (nameNorm.includes(rule.boost.word) || descNorm.includes(rule.boost.word))) {
          p.score += 15;
        }
        if (rule.boost.word2 && (nameNorm.includes(rule.boost.word2) || descNorm.includes(rule.boost.word2))) {
          p.score += 15;
        }
      }
    }
  });

  // Filtrar resultados relevantes y ordenar
  let results = products.filter(p => p.score > 0).sort((a, b) => b.score - a.score);
  
  // Si no hay resultados relevantes semánticos, usar un fallback tolerante
  if (results.length === 0) {
    results = products.filter(p => {
      const nameNorm = normalize(p.name);
      return queryWords.some(w => nameNorm.includes(w));
    });
  }

  res.json(results.slice(0, limitNum));
}));

module.exports = router;
