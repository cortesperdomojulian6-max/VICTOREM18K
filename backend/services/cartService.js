const db = require('../db');
const { ValidationError, NotFoundError } = require('./errors');

async function getCart(userId) {
  const result = await db.query(
    `SELECT ci.id, ci.product_id, p.name, p.price, ci.cantidad, (p.price * ci.cantidad) as subtotal
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = $1`,
    [userId]
  );
  const items = result.rows;
  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
  return { items, total };
}

async function addItem(userId, product_id, quantity) {
  if (!product_id || quantity <= 0) {
    throw new ValidationError('Datos inválidos');
  }

  const existing = await db.query(
    'SELECT id, cantidad FROM cart_items WHERE user_id = $1 AND product_id = $2',
    [userId, product_id]
  );

  let result;
  if (existing.rows.length > 0) {
    result = await db.query(
      'UPDATE cart_items SET cantidad = cantidad + $1 WHERE id = $2 RETURNING *',
      [quantity, existing.rows[0].id]
    );
  } else {
    result = await db.query(
      'INSERT INTO cart_items (user_id, product_id, cantidad) VALUES ($1, $2, $3) RETURNING *',
      [userId, product_id, quantity]
    );
  }

  return result.rows[0];
}

async function updateItem(userId, itemId, quantity) {
  if (!quantity || quantity < 1) {
    throw new ValidationError('Cantidad debe ser mayor a 0');
  }
  const result = await db.query(
    'UPDATE cart_items SET cantidad = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [quantity, itemId, userId]
  );
  if (result.rowCount === 0) {
    throw new NotFoundError('Item no encontrado');
  }
  return result.rows[0];
}

async function removeItem(userId, itemId) {
  const result = await db.query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
    [itemId, userId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('Item no encontrado');
  }

  return { ok: true };
}

async function clearCart(userId) {
  const result = await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  return { ok: true, count: result.rowCount };
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
