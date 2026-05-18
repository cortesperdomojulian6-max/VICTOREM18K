const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validators');

const router = express.Router();

const setTokens = (res, tokens) => {
  res.cookie('access_token', tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24h
  });
  res.cookie('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
  });
};

router.post('/register', asyncHandler(async (req, res) => {
  const err = validateRegister(req.body);
  if (err) return res.status(400).json({ error: err });
  const result = await authService.register(req.body);
  setTokens(res, result.tokens);
  delete result.tokens;
  return res.status(201).json(result);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const err = validateLogin(req.body);
  if (err) return res.status(400).json({ error: err });
  const result = await authService.login(req.body);
  setTokens(res, result.tokens);
  delete result.tokens;
  return res.json(result);
}));

router.get('/me', requireAuth, (req, res) => {
  return res.json(authService.getMe(req.user));
});

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.cookies;
  if (!refresh_token) return res.status(401).json({ error: 'No autorizado: falta refresh token' });

  let payload;
  const jwt = require('jsonwebtoken');
  const db = require('../db');
  try {
    payload = jwt.verify(refresh_token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }

  const result = await db.query('SELECT id, name, email, role, registration_date, avatar_url FROM users WHERE id = $1', [payload.id]);
  if (result.rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

  const user = result.rows[0];
  const { signToken } = require('../middleware/auth');
  const tokens = signToken(user);
  setTokens(res, tokens);

  return res.json({ message: 'Tokens actualizados' });
}));

router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  return res.json({ message: 'Sesión cerrada' });
});

module.exports = router;
