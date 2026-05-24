const db = require('../db');

async function getRecommendations(productId, limit = 3) {
  const product = await db.query(
    'SELECT id, category_id, price, name FROM products WHERE id = $1 AND active = true',
    [productId]
  );
  if (product.rows.length === 0) return [];

  const { category_id, price } = product.rows[0];

  const priceMin = price * 0.5;
  const priceMax = price * 2;

  let recommendations = await db.query(
    `SELECT id, name, price, image_url, description
     FROM products
     WHERE active = true
       AND id != $1
       AND category_id IS NOT NULL
       AND price BETWEEN $2 AND $3
     ORDER BY
       CASE WHEN category_id = $4 THEN 0 ELSE 1 END,
       ABS(price - $5)
     LIMIT $6`,
    [productId, priceMin, priceMax, category_id, price, limit]
  );

  if (recommendations.rows.length < limit) {
    const existingIds = [productId, ...recommendations.rows.map(r => r.id)];
    const fillers = await db.query(
      `SELECT id, name, price, image_url, description
       FROM products
       WHERE active = true AND id != ALL($1)
       ORDER BY RANDOM()
       LIMIT $2`,
      [existingIds, limit - recommendations.rows.length]
    );
    recommendations.rows.push(...fillers.rows);
  }

  return recommendations.rows;
}

module.exports = { getRecommendations };
