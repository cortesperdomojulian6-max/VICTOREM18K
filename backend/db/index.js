// ============================================================
// VICTOREM - Pool de conexiones PostgreSQL
// ============================================================
// Centraliza la conexión a la BD usando 'pg' (node-postgres).
// La URL viene de la variable de entorno DATABASE_URL.
// ============================================================

require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: La variable DATABASE_URL no está definida en .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requiere SSL
  max: 10,                             // máximo de conexiones simultáneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

/**
 * Ejecuta una consulta SQL contra la base de datos.
 * @param {string} text - SQL con placeholders ($1, $2, ...).
 * @param {Array} params - Valores para los placeholders.
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📊 Query (${duration}ms): ${text.split('\n')[0].slice(0, 80)}...`);
  }
  return result;
}

/**
 * Obtiene un cliente del pool (para transacciones).
 * Recordar siempre llamar a client.release() al terminar.
 */
async function getClient() {
  return pool.connect();
}

module.exports = {
  pool,
  query,
  getClient
};
