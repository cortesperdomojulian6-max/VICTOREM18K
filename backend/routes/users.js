const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    registration_date: req.user.registration_date
  });
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });

    const result = await db.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role',
      [name.trim(), req.user.id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

router.put('/password', requireAuth, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Contraseñas requeridas' });
    }

    const userResult = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    const isValid = await bcrypt.compare(old_password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);

    return res.json({ ok: true, message: 'Contraseña actualizada' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

router.delete('/account', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    return res.json({ ok: true, message: 'Cuenta eliminada' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar cuenta' });
  }
});

module.exports = router;