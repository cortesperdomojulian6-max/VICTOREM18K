
import db from '../backend/db/index.js';
import bcrypt from 'bcryptjs';

async function setupTestUser() {
  const roles = ['customer', 'client', 'user', 'admin'];
  let success = false;

  for (const role of roles) {
    try {
      const password = await bcrypt.hash('Password123!', 10);
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, password = EXCLUDED.password',
        ['Test User', 'test@victorem.co', password, role]
      );
      console.log(`✅ Usuario configurado con rol: ${role}`);
      success = true;
      break;
    } catch (err) {
      console.log(`❌ Rol ${role} falló: ${err.message}`);
    }
  }

  if (!success) console.error('❌ Ningún rol común funcionó.');
  process.exit();
}

setupTestUser();
