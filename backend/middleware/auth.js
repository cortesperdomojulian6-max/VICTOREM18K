// ============================================================
// VICTOREM - Middlewares de autenticación
// ============================================================
// requireAuth  -> exige token JWT válido y carga req.user
// requireAdmin -> además exige que el usuario tenga role='admin'
// ============================================================

const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET no está definido en .env');
  process.exit(1);
}

/**
 * Verifica que el request traiga un token JWT válido.
 * Si todo OK, deja en req.user el registro completo del usuario.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'No autorizado: falta token' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const result = await db.query(
      'SELECT id, name, email, role, registration_date, avatar_url FROM users WHERE id = $1',
      [payload.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = result.rows[0];
    req.userId = result.rows[0].id;
    next();
  } catch (err) {
    console.error('Error en requireAuth:', err);
    return res.status(500).json({ error: 'Error al validar la sesión' });
  }
}

/**
 * Verifica que el usuario autenticado tenga role='admin'.
 * Debe usarse DESPUÉS de requireAuth.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });
  }
  next();
}

/**
 * Genera un token JWT para un usuario.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  requireAuth,
  requireAdmin,
  signToken
};
