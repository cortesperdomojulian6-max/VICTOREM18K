require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  console.log('Testing connection with URL:', process.env.DATABASE_URL);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ CONNECTION SUCCESSFUL');
    const res = await client.query('SELECT NOW()');
    console.log('Current Time from DB:', res.rows[0]);
  } catch (err) {
    console.error('❌ CONNECTION FAILED');
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    console.error('Detail:', err.detail || 'No detail available');
  } finally {
    await client.end();
  }
}

testConnection();
