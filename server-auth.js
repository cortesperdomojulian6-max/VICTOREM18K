// ============================================================
// VICTOREM - Rutas de autenticación
// ============================================================
// POST /api/auth/register  -> crea usuario y devuelve JWT
// POST /api/auth/login     -> valida credenciales y devuelve JWT
// GET  /api/auth/me        -> devuelve datos del usuario autenticado
// ============================================================

const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');
const { requireAuth, signToken } = require('./middleware/auth');

const router = express.Router();

// Validación simple de email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

// ----------------- POST /api/auth/register -----------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // ¿Ya existe?
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear y guardar
    const hashed = await bcrypt.hash(password, 10);
    const insert = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, name, email, role, registration_date`,
      [name.trim(), email.toLowerCase().trim(), hashed]
    );

    const user = insert.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('Error en /register:', err);
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// ----------------- POST /api/auth/login -----------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const result = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = signToken(user);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('Error en /login:', err);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ----------------- GET /api/auth/me -----------------
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    registrationDate: req.user.registration_date
  });
});

module.exports = router;
