/**
 * seed-admin.js — Crea un usuario administrador en la BD.
 * 
 * Uso: node backend/db/seed-admin.js
 * Te pedirá el email y contraseña por terminal.
 * O con variables de entorno: ADMIN_EMAIL=admin@victorem.co ADMIN_PASS=secreta node backend/db/seed-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./index');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin(email, password, name) {
  const hashed = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET role = 'admin', password = $3
     RETURNING id, name, email, role`,
    [name, email.toLowerCase().trim(), hashed]
  );
  return result.rows[0];
}

(async () => {
  try {
    const email = process.env.ADMIN_EMAIL || await new Promise(r => readline.question('Email admin: ', r));
    const password = process.env.ADMIN_PASS || await new Promise(r => readline.question('Contraseña admin: ', r));
    const name = process.env.ADMIN_NAME || 'Admin Victorem';

    if (!email || !password || password.length < 6) {
      console.error('Email válido y contraseña (mín 6 caracteres) requeridos');
      process.exit(1);
    }

    const admin = await createAdmin(email, password, name);
    console.log(`✅ Admin creado/actualizado:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
