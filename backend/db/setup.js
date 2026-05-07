// ============================================================
// VICTOREM - Script de instalación de la BD
// ============================================================
// Ejecuta schema.sql + seed.sql contra Supabase.
//
// Uso:
//   node db/setup.js          -> crea tablas y datos iniciales
//   node db/setup.js --reset  -> alias de lo mismo (DROP + CREATE)
// ============================================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { pool } = require('./index');

async function run() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const seedPath   = path.join(__dirname, 'seed.sql');

  console.log('═══════════════════════════════════════════════════════');
  console.log('  VICTOREM - Configuración de base de datos PostgreSQL');
  console.log('═══════════════════════════════════════════════════════\n');

  const client = await pool.connect();

  try {
    // 1. SCHEMA
    console.log('📐 Aplicando esquema (schema.sql)...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('   ✅ Tablas, índices y triggers creados.\n');

    // 2. SEED (categorías + productos)
    console.log('🌱 Insertando datos iniciales (seed.sql)...');
    let seedSql = fs.readFileSync(seedPath, 'utf8');

    // Reemplazar el hash bcrypt placeholder por uno real generado en runtime
    const adminPassword = 'Admin123!';
    const adminHash = await bcrypt.hash(adminPassword, 10);
    seedSql = seedSql.replace(
      '$2b$10$rQOeJFKZgGNrwQ/7vQ4wGOuxMz4pwPo3oH0MYXQqf8I.k4.6Kz4Iq',
      adminHash
    );

    await client.query(seedSql);
    console.log('   ✅ Categorías, productos y admin insertados.\n');

    // 3. RESUMEN
    const counts = await client.query(`
      SELECT 'users' AS tabla, COUNT(*)::int AS total FROM users
      UNION ALL SELECT 'categories', COUNT(*)::int FROM categories
      UNION ALL SELECT 'products',   COUNT(*)::int FROM products
      ORDER BY tabla;
    `);

    console.log('📊 Estado de la BD:');
    counts.rows.forEach(r => {
      console.log(`   • ${r.tabla.padEnd(12)} ${r.total} registro(s)`);
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  ✅ Base de datos lista para usar');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n👤 Credenciales del administrador:');
    console.log('   Email:    admin@victorem.co');
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  Cámbiala después del primer login.\n');
  } catch (err) {
    console.error('\n❌ Error al configurar la BD:');
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
