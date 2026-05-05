// ============================================================
// VICTOREM - Servidor principal (Node.js + Express + PostgreSQL)
// ============================================================

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ----------------- Middlewares globales -----------------
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Logger sencillo
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
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


// ----------------- Rutas API -----------------
app.use('/api/auth',      require('./server-auth'));
app.use('/api/admin',     require('./server-admin'));
app.use('/api/products',  require('./server-products'));
app.use('/api/cart',      require('./server-cart'));
app.use('/api/orders',    require('./server-orders'));
app.use('/api/addresses', require('./server-addresses'));
app.use('/api/users',     require('./server-users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API viva', time: new Date().toISOString() });
});

// ----------------- Frontend (archivos estáticos) -----------------
app.use(express.static(path.join(__dirname)));

// ----------------- Manejador de errores -----------------
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ----------------- Iniciar servidor -----------------
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
