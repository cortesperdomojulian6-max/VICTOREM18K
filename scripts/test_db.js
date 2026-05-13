require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

(async () => {
  try {
    // 1. Basic connectivity
    const r = await pool.query('SELECT 1 as test');
    console.log('1. DB Connection OK:', r.rows);

    // 2. List tables
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
    );
    console.log('2. Tables:', tables.rows.map(r => r.table_name));

    // 3. Check users
    const users = await pool.query('SELECT id, name, email, role, registration_date FROM users ORDER BY id LIMIT 10');
    console.log('3. Users:', users.rows);

    // 4. Test register (insert + delete)
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('Test1234', 10);
    console.log('4. bcrypt OK, hash generated');

    // Try inserting a test user
    try {
      const insert = await pool.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id, name, email, role`,
        ['Test User', 'test_probe_' + Date.now() + '@test.com', hash]
      );
      console.log('5. INSERT OK:', insert.rows[0]);
      // Clean up
      await pool.query('DELETE FROM users WHERE id = $1', [insert.rows[0].id]);
      console.log('6. DELETE OK (cleanup)');
    } catch (e) {
      console.error('5. INSERT ERROR:', e.message);
    }

    // 5. Check if the users route endpoint "GET /users/profile" would work
    // The frontend auth.tsx calls api.get('/users/profile') but the backend
    // only has GET /users/me — let's check the route definitions
    console.log('\n--- Route Analysis ---');
    console.log('Frontend auth.tsx calls: api.get("/users/profile")');
    console.log('Backend routes/users.js has: GET /me, PUT /profile, PUT /password, DELETE /account');
    console.log('Backend routes/auth.js has: GET /me');
    console.log('POTENTIAL ISSUE: Frontend calls /api/users/profile (GET) but backend only has GET /api/users/me');

  } catch (e) {
    console.error('DB Error:', e.message);
    console.error('Stack:', e.stack);
  } finally {
    await pool.end();
  }
})();
