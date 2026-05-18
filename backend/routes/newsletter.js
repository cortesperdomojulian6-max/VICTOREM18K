const express = require('express');
const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const existing = await db.query(
    'SELECT id FROM newsletter_subscribers WHERE email = $1',
    [email.trim().toLowerCase()]
  );

  if (existing.rows.length > 0) {
    return res.json({ ok: true, message: 'Ya estás suscrito' });
  }

  const result = await db.query(
    `INSERT INTO newsletter_subscribers (email) VALUES ($1) RETURNING id, created_at`,
    [email.trim().toLowerCase()]
  );

  res.status(201).json({ ok: true, id: result.rows[0].id, message: 'Suscripción exitosa' });
}));

router.get('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT id, email, created_at FROM newsletter_subscribers ORDER BY created_at DESC'
  );
  res.json(result.rows);
}));

module.exports = router;
