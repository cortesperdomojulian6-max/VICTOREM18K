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

// ============ MIDDLEWARES DE SEGURIDAD ============
// Helmet: Protege contra vulnerabilidades comunes
app.use(helmet());

// CORS: Control de origen
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting: Protege contra ataques DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas solicitudes, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos por IP
  message: 'Demasiados intentos de login, intenta en 15 minutos',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Parse JSON con límite
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Logger mejorado
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const method = req.method.padEnd(6);
  const url = req.url.substring(0, 50).padEnd(50);
  console.log(`[${now}] ${method} ${url}`);
  next();
});

// ----------------- Verificar conexión a Supabase -----------------
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Conexión a PostgreSQL (Supabase) verificada.');
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:');
    console.error('   ' + err.message);
    console.error('   Revisa DATABASE_URL en tu archivo .env');
    process.exit(1);
  }
})();


// ============ RUTAS API ============
app.use('/api/auth',      require('./server-auth'));
app.use('/api/admin',     require('./server-admin'));
app.use('/api/products',  require('./server-products'));
app.use('/api/cart',      require('./server-cart'));
app.use('/api/orders',    require('./server-orders'));
app.use('/api/addresses', require('./server-addresses'));
app.use('/api/users',     require('./server-users'));
app.use('/api/wompi',     require('./server-wompi')); // Pasarela de pagos

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API viva', time: new Date().toISOString() });
});

// ----------------- Frontend (archivos estáticos) -----------------
app.use(express.static(path.join(__dirname)));

// ============ MANEJADOR DE ERRORES ============
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  console.error(`❌ [${status}] ${message}`);
  console.error('   URL:', req.url);
  console.error('   IP:', req.ip);
  
  res.status(status).json({
    error: message,
    status: status,
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

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Rechazo de promesa no manejado:', reason);
});

module.exports = { app };
