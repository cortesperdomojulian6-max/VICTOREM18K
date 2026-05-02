const express = require('express');
const db = require('./db');
const { requireAuth } = require('./middleware/auth');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, street, city, zip, phone FROM addresses WHERE user_id = $1`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener direcciones' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { street, city, zip, phone } = req.body;
    if (!street || !city || !zip || !phone) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await db.query(
      `INSERT INTO addresses (user_id, street, city, zip, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, street, city, zip, phone`,
      [req.user.id, street, city, zip, phone]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear dirección' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { street, city, zip, phone } = req.body;
    const result = await db.query(
      `UPDATE addresses SET street = $1, city = $2, zip = $3, phone = $4
       WHERE id = $5 AND user_id = $6
       RETURNING id, street, city, zip, phone`,
      [street, city, zip, phone, req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Dirección no encontrada' });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar dirección' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Dirección no encontrada' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar dirección' });
  }
});

module.exports = router;