// ============================================================
// VICTOREM - Migraciones de base de datos
// ============================================================
// Script standalone para migraciones controladas.
// Ejecutar: node backend/db/migrate.js
// ============================================================

require('dotenv').config();
const db = require('./index');

const MIGRATIONS = [
  {
    name: '000_create_contact_messages',
    sql: `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(200) NOT NULL,
        email      VARCHAR(200) NOT NULL,
        message    TEXT NOT NULL,
        read       BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: '001_add_avatar_url',
    sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
  },
  {
    name: '002_fix_category_pulsos',
    sql: `UPDATE categories SET name = 'Pulsos', slug = 'pulsos' WHERE slug = 'pulseras'`,
  },
  {
    name: '003_seed_personalized_product',
    sql: `
      INSERT INTO products (category_id, name, description, price, image_url, stock, active)
      SELECT id, 'Joya Personalizada', 'Joya personalizada creada por ti en nuestro configurador', 0, '/assets/images/personalizado.jpg', 9999, true
      FROM categories WHERE slug = 'pulsos'
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Joya Personalizada')
    `,
  },
  {
    name: '004_create_newsletter_subscribers',
    sql: `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id          SERIAL PRIMARY KEY,
        email       VARCHAR(254) NOT NULL UNIQUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
];

(async () => {
  try {
    await db.query('SELECT 1');
    console.log('BD conectada');

    for (const migration of MIGRATIONS) {
      try {
        await db.query(migration.sql);
        console.log(`✅ ${migration.name}`);
      } catch (err) {
        console.error(`❌ ${migration.name}: ${err.message}`);
      }
    }

    console.log('Migraciones completadas.');
    process.exit(0);
  } catch (e) {
    console.error('Error de conexión:', e.message);
    process.exit(1);
  }
})();
