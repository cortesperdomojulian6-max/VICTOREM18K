const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_id, payment_method } = req.body;
    
    if (!address_id || !payment_method) {
      return res.status(400).json({ error: 'address_id y payment_method requeridos' });
    }

    const cartResult = await db.query(
      `SELECT SUM(p.price * ci.cantidad) as total
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );

    const total = cartResult.rows[0]?.total || 0;
    if (total === 0) return res.status(400).json({ error: 'Carrito vacío' });

    const orderResult = await db.query(
      `INSERT INTO orders (user_id, total, address_id, metodo_pago, numero_pedido, estado)
       VALUES ($1, $2, $3, $4, 'ORD-' || LPAD(CAST((random() * 1000000) AS INT)::TEXT, 6, '0'), 'pendiente')
       RETURNING id, user_id, total, numero_pedido, estado, fecha`,
      [userId, total, address_id, payment_method]
    );

    const orderId = orderResult.rows[0].id;

    // Copiar items del carrito a order_items
    await db.query(
      `INSERT INTO order_items (order_id, product_id, nombre_producto, cantidad, precio_unitario, subtotal)
       SELECT $1, ci.product_id, p.name, ci.cantidad, p.price, (p.price * ci.cantidad)
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $2`,
      [orderId, userId]
    );

    // Vaciar carrito
    await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    return res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Error al crear orden' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, numero_pedido, total, estado, metodo_pago, fecha FROM orders WHERE user_id = $1 ORDER BY fecha DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const orderResult = await db.query(
      `SELECT id, total, estado, metodo_pago, fecha FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });

    const itemsResult = await db.query(
      `SELECT product_id, cantidad, precio_unitario FROM order_items WHERE order_id = $1`,
      [req.params.id]
    );

    return res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener orden' });
  }
});

module.exports = router;