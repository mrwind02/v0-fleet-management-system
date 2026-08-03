const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id = '91557946-3060-4f0a-bf7e-3fd3e4464064';
    const status = 'Aprovada';
    const user_name = 'Gestor';

    const current = await client.query('SELECT status FROM expenses WHERE id = $1', [id]);
    console.log('Current status:', current.rows[0]);
    const oldStatus = current.rows[0].status;

    const result = await client.query(`
      UPDATE expenses
      SET status = $1, 
          reimbursement_status = CASE WHEN $1 = 'Reembolsada' THEN 'Pago' ELSE reimbursement_status END,
          updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [status, id]);
    console.log('Updated status:', result.rows[0]?.status);

    await client.query(`
      INSERT INTO expense_history (expense_id, event_type, description, old_value, new_value, user_name)
      VALUES ($1, 'status_change', $2, $3, $4, $5)
    `, [id, `Status alterado de "${oldStatus}" para "${status}"`, oldStatus, status, user_name || 'Sistema']);
    console.log('History inserted');

    await client.query('COMMIT');
    console.log('ALL SUCCESS!');
  } catch(e) {
    await client.query('ROLLBACK');
    console.error('CATCH ERROR:', e);
  } finally {
    client.release();
    pool.end();
  }
})();
