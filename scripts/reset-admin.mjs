
import db from '../backend/db/index.js';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  try {
    const password = await bcrypt.hash('VictoremAdmin2026!', 10);
    
    // Buscamos al usuario principal (el primero creado o el que tenga el email del dueño)
    const userRes = await db.query('SELECT id, email FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.error('❌ No se encontró ningún usuario para asignar como admin.');
      process.exit(1);
    }
    
    const userId = userRes.rows[0].id;
    const userEmail = userRes.rows[0].email;

    await db.query(
      'UPDATE users SET role = $1, password = $2 WHERE id = $3',
      ['admin', password, userId]
    );
    
    console.log(`✅ Acceso Admin Restablecido con éxito.`);
    console.log(`📧 Usuario: ${userEmail}`);
    console.log(`🔑 Contraseña: VictoremAdmin2026!`);
  } catch (err) {
    console.error('❌ Error al resetear admin:', err);
  } finally {
    process.exit();
  }
}

resetAdminPassword();
