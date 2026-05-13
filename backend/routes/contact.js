const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const result = await db.query(
    `INSERT INTO contact_messages (name, email, message)
     VALUES ($1, $2, $3)
     RETURNING id, created_at`,
    [name.trim(), email.trim(), message.trim()]
  );

  res.status(201).json({ ok: true, id: result.rows[0].id });
});

module.exports = router;
