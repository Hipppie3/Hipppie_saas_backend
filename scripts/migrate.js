import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Allow AWS SSL
});

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to AWS RDS PostgreSQL");

    const res = await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      );
    `);
    
    console.log("✅ Table created successfully!");
    
    await client.end();
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
})();
