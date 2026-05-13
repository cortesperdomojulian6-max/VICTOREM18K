const crypto = require('crypto');
const db = require('../db');
const { ValidationError, NotFoundError, ForbiddenError } = require('./errors');

async function createOrder(userId, { address_id, payment_method, keepCart } = {}) {
  if (!address_id || !payment_method) {
    throw new ValidationError('address_id y payment_method requeridos');
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT SUM(p.price * ci.cantidad) as total
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );

    const total = cartResult.rows[0]?.total || 0;
    if (total === 0) {
      throw new ValidationError('Carrito vacío');
    }

    const numero_pedido = 'VM-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');

    const envio = 10000;
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, subtotal, envio, total, address_id, metodo_pago, numero_pedido, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
       RETURNING id, user_id, total, envio, numero_pedido, estado, fecha`,
      [userId, total, envio, total + envio, address_id, payment_method, numero_pedido]
    );

    const orderId = orderResult.rows[0].id;

    await client.query(
      `INSERT INTO order_items (order_id, product_id, nombre_producto, cantidad, precio_unitario, subtotal)
       SELECT $1, ci.product_id, p.name, ci.cantidad, p.price, (p.price * ci.cantidad)
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $2`,
      [orderId, userId]
    );

    if (!keepCart) {
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    }

    await client.query('COMMIT');
    return orderResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getOrdersByUser(userId) {
  const result = await db.query(
    `SELECT id, numero_pedido, total, estado, metodo_pago, fecha
     FROM orders WHERE user_id = $1 ORDER BY fecha DESC`,
    [userId]
  );
  return result.rows;
}

async function getOrderById(userId, orderId) {
  const orderResult = await db.query(
    `SELECT id, total, estado, metodo_pago, fecha FROM orders WHERE id = $1 AND user_id = $2`,
    [orderId, userId]
  );

  if (orderResult.rows.length === 0) {
    throw new NotFoundError('Orden no encontrada');
  }

  const itemsResult = await db.query(
    `SELECT product_id, cantidad, precio_unitario FROM order_items WHERE order_id = $1`,
    [orderId]
  );

  return { ...orderResult.rows[0], items: itemsResult.rows };
}

module.exports = { createOrder, getOrdersByUser, getOrderById };
