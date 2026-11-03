
import db from '../backend/db/index.js';
import bcrypt from 'bcryptjs';

async function forceAdminAccess() {
  try {
    const password = await bcrypt.hash('VictoremAdmin2026!', 10);
    
    // 1. Buscamos al usuario admin
    const userRes = await db.query('SELECT id, email FROM users WHERE email = $1', ['admin@victorem.co']);
    
    if (userRes.rows.length === 0) {
      console.log('Creando usuario admin desde cero...');
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Super Admin', 'admin@victorem.co', password, 'admin']
      );
    } else {
      const userId = userRes.rows[0].id;
      console.log(`Actualizando permisos para el usuario ${userId}...`);
      await db.query(
        'UPDATE users SET role = $1, password = $2 WHERE id = $3',
        ['admin', password, userId]
      );
    }
    
    console.log('✅ ACCESO MAESTRO CONFIGURADO');
    console.log('📧 Email: admin@victorem.co');
    console.log('🔑 Contraseña: VictoremAdmin2026!');
  } catch (err) {
    console.error('❌ Error crítico al forzar admin:', err);
  } finally {
    process.exit();
  }
}

forceAdminAccess();
