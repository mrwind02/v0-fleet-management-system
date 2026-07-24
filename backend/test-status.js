const { Pool } = require('pg');
require('dotenv').config({path: '.env'});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query('SELECT * FROM work_orders LIMIT 1');
    if (res.rows.length === 0) {
      console.log('no wo');
      return;
    }
    const id = res.rows[0].id;
    console.log('Testing with id:', id);
    
    // Testing the first query
    const updateRes = await pool.query(`UPDATE work_orders SET status = $1, closed_at = closed_at, updated_at = NOW() WHERE id = $2 RETURNING *`, ['Aguardando Aprovação', id]);
    console.log('Updated WO');
    
    // Testing the second query
    const histRes = await pool.query(`INSERT INTO work_order_history (work_order_id, event_type, description, old_value, new_value, user_name) VALUES ($1, 'status_change', $2, $3, $4, $5)`, [id, 'Status alterado', 'Aberta', 'Aguardando Aprovação', 'Sistema']);
    console.log('Success');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
}
run();
