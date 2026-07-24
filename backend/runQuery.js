require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await pool.query(`ALTER TABLE drivers ADD COLUMN IF NOT EXISTS admission_date DATE;`);
    console.log("Column admission_date added successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
