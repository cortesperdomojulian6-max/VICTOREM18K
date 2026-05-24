const express = require('express');
const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { ValidationError, NotFoundError } = require('../services/errors');

const router = express.Router();

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { order_id, configuracion, tipo_joya, precio_total, talla_cm } = req.body;

  if (!order_id || !configuracion) {
    throw new ValidationError('order_id y configuracion requeridos');
  }

  const existing = await db.query(
    'SELECT id FROM custom_orders WHERE order_id = $1',
    [order_id]
  );
  if (existing.rows.length > 0) {
    await db.query(
      `UPDATE custom_orders SET configuracion = $1, tipo_joya = $2, precio_total = $3, talla_cm = $4 WHERE order_id = $5`,
      [JSON.stringify(configuracion), tipo_joya || null, precio_total || 0, talla_cm || null, order_id]
    );
    return res.json({ ok: true, updated: true });
  }

  const result = await db.query(
    `INSERT INTO custom_orders (order_id, user_id, configuracion, tipo_joya, precio_total, talla_cm)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [order_id, req.user.id, JSON.stringify(configuracion), tipo_joya || null, precio_total || 0, talla_cm || null]
  );

  res.status(201).json({ ok: true, id: result.rows[0].id });
}));

router.get('/:orderId', requireAuth, asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT * FROM custom_orders WHERE order_id = $1 AND user_id = $2',
    [req.params.orderId, req.user.id]
  );
  if (result.rows.length === 0) {
    throw new NotFoundError('No se encontró configuración personalizada para esta orden');
  }
  res.json(result.rows[0]);
}));

module.exports = router;
