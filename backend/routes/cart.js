const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT ci.id, ci.product_id, p.name, p.price, ci.cantidad, (p.price * ci.cantidad) as subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );
    const items = result.rows;
    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
    return res.json({ items, total });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener carrito' });
  }
});

router.post('/items', requireAuth, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;
    if (!product_id || quantity <= 0) return res.status(400).json({ error: 'Datos inválidos' });
    
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
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error al agregar al carrito' });
  }
});

router.delete('/items/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item no encontrado' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar' });
  }
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    return res.json({ ok: true, count: result.rowCount });
  } catch (err) {
    return res.status(500).json({ error: 'Error al vaciar carrito' });
  }
});

module.exports = router;