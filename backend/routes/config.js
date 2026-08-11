const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    shipping: 10000
  });
});

module.exports = router;
