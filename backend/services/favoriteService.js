const db = require('../db');

async function getFavorites(userId) {
  const { rows } = await db.query(
    `SELECT f.id, f.product_id, f.created_at,
            p.name, p.price, p.image_url, p.description
     FROM favorites f
     JOIN products p ON p.id = f.product_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
}

async function toggleFavorite(userId, productId) {
  const existing = await db.query(
    'SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  if (existing.rows.length > 0) {
    await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return { favorited: false };
  }
  await db.query(
    'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)',
    [userId, productId]
  );
  return { favorited: true };
}

async function isFavorited(userId, productId) {
  const { rows } = await db.query(
    'SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  return rows.length > 0;
}

module.exports = { getFavorites, toggleFavorite, isFavorited };
