// ============================================================
// VICTOREM - Servidor principal (Node.js + Express + PostgreSQL)
// ============================================================

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const CORS_ORIGIN = process.env.CORS_ORIGIN;
if (!CORS_ORIGIN) {
  console.error('❌ CORS_ORIGIN no está definido en .env');
}

app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login, intenta en 15 minutos',
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Verificar BD y migraciones
(async () => {
  try {
    await db.query('SELECT 1');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT');
    await db.query("UPDATE categories SET name = 'Pulsos', slug = 'pulsos' WHERE slug = 'pulseras'");
    console.log('BD conectada');
  } catch (e) {
    console.error('BD error:', e.message);
  }
})();

// ============ RUTAS API ============
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/cart',      require('./routes/cart'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/wompi',     require('./routes/wompi')); // Pasarela de pagos

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API viva', time: new Date().toISOString() });
});

// ----------------- Frontend (archivos estáticos) -----------------
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use('/components', express.static(path.join(__dirname, '../frontend/components')));

// ============ MANEJADOR DE ERRORES ============
const { AppError } = require('./services/errors');

app.use((err, req, res, next) => {
  const status = err instanceof AppError ? err.status : err.statusCode || 500;
  const message = err instanceof AppError ? err.message : 'Error interno del servidor';

  console.error(`❌ [${status}] ${message}`);
  console.error('   URL:', req.url);
  console.error('   IP:', req.ip);
  if (process.env.NODE_ENV === 'development') {
    console.error('   Stack:', err.stack?.split('\n').slice(0, 3).join('\n'));
  }

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.url,
    method: req.method
  });
});

// ============ INICIAR SERVIDOR ============
// En Vercel no se llama app.listen(), la plataforma lo maneja como serverless
if (!process.env.VERCEL) {
  const server = app.listen(PORT, HOST, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   ✅ VICTOREM - Servidor iniciado');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   🌐 http://localhost:${PORT}`);
    console.log(`   🔌 API: http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════════════════');
  });

  server.on('error', (err) => {
    console.error('Error en el servidor HTTP:', err.message);
    if (err.code === 'EADDRINUSE') {
      console.error(`El puerto ${PORT} está en uso. Cierra el otro proceso o cambia PORT en .env`);
    }
    process.exit(1);
  });
}

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Rechazo de promesa no manejado:', reason);
});

module.exports = app;
