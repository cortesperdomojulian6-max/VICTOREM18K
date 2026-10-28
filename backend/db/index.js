// ============================================================
// VICTOREM - Pool de conexiones PostgreSQL (Optimizado y Corregido)
// ============================================================
require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: La variable DATABASE_URL no está definida en .env');
}

let pool = null;
try {
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  // 1. Limpieza estricta del nombre de la base de datos
  // Eliminamos la '/' inicial y cualquier espacio o carácter invisible
  const dbName = dbUrl.pathname.replace(/^\//, '').trim();
  
  // 2. Ajuste automático de puerto para Supabase Pooler
  // Si el usuario contiene un punto (ej: postgres.id), es un usuario de Pooler -> Puerto 6543
  let port = parseInt(dbUrl.port || '5432');
  if (dbUrl.username && dbUrl.username.includes('.')) {
    port = 6543;
  }

  pool = new Pool({
    user: dbUrl.username,
    password: dbUrl.password,
    host: dbUrl.hostname,
    port: port,
    database: dbName,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  console.log(`🔌 Intentando conectar a DB: ${dbName} en puerto ${port}...`);
} catch (err) {
  console.error('❌ Error crítico al crear pool de PostgreSQL:', err.message);
}

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

/**
 * Ejecuta una consulta SQL contra la base de datos con reintentos.
 */
async function query(text, params) {
  if (!pool) {
    throw new Error('Base de datos no configurada (DATABASE_URL faltante)');
  }
  
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const start = Date.now();
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📊 Query (${duration}ms): ${text.split('\\n')[0].slice(0, 80)}...`);
      }
      return result;
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) throw err;
      console.warn(`⚠️ Query falló (intento ${attempts}/${maxAttempts}), reintentando en ${500 * attempts}ms...`);
      await new Promise(res => setTimeout(res, 500 * attempts));
    }
  }
}

async function getClient() {
  if (!pool) {
    throw new Error('Base de datos no configurada (DATABASE_URL faltante)');
  }
  return pool.connect();
}

module.exports = {
  pool,
  query,
  getClient
};
