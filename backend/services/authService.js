const bcrypt = require('bcrypt');
const db = require('../db');
const { signToken } = require('../middleware/auth');
const { ValidationError, ConflictError, UnauthorizedError } = require('./errors');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

async function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw new ValidationError('Faltan campos requeridos');
  }
  if (!isValidEmail(email)) {
    throw new ValidationError('Email inválido');
  }
  if (password.length < 6) {
    throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
  }

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    throw new ConflictError('El email ya está registrado');
  }

  const hashed = await bcrypt.hash(password, 10);
  const insert = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, 'user')
     RETURNING id, name, email, role, registration_date`,
    [name.trim(), email.toLowerCase().trim(), hashed]
  );

  const user = insert.rows[0];
  const token = signToken(user);

  return { id: user.id, name: user.name, email: user.email, role: user.role, token };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new ValidationError('Email y contraseña son obligatorios');
  }

  const result = await db.query(
    'SELECT id, name, email, password, role FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Email o contraseña incorrectos');
  }

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    throw new UnauthorizedError('Email o contraseña incorrectos');
  }

  const token = signToken(user);

  return { id: user.id, name: user.name, email: user.email, role: user.role, token };
}

function getMe(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    registrationDate: user.registration_date
  };
}

module.exports = { register, login, getMe };
