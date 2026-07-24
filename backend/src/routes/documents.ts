import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET /api/documents/metrics
router.get('/metrics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Válido' OR status = 'Aprovado' THEN 1 ELSE 0 END) as valid,
        SUM(CASE WHEN expiry_date <= NOW() + INTERVAL '30 days' AND expiry_date > NOW() AND (status != 'Vencido') THEN 1 ELSE 0 END) as expiring,
        SUM(CASE WHEN expiry_date < NOW() OR status = 'Vencido' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN status = 'Em Análise' OR status = 'Pendente' THEN 1 ELSE 0 END) as pending
      FROM documents
    `);
    const row = result.rows[0];
    const total = parseInt(row.total) || 0;
    const valid = parseInt(row.valid) || 0;
    const expiring = parseInt(row.expiring) || 0;
    const expired = parseInt(row.expired) || 0;
    const pending = parseInt(row.pending) || 0;
    const complianceIndex = total > 0 ? parseFloat(((valid / total) * 100).toFixed(1)) : 0;
    res.json({ totalDocuments: total, validDocuments: valid, expiringDocuments: expiring, expiredDocuments: expired, pendingApproval: pending, complianceIndex });
  } catch (error) {
    console.error('Error fetching document metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/documents/compliance — for pie chart
router.get('/compliance', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        SUM(CASE WHEN status = 'Válido' OR status = 'Aprovado' THEN 1 ELSE 0 END) as valid,
        SUM(CASE WHEN expiry_date <= NOW() + INTERVAL '30 days' AND expiry_date > NOW() AND (status != 'Vencido') THEN 1 ELSE 0 END) as expiring,
        SUM(CASE WHEN expiry_date < NOW() OR status = 'Vencido' THEN 1 ELSE 0 END) as expired
      FROM documents
    `);
    const row = result.rows[0];
    res.json([
      { name: 'Válidos', value: parseInt(row.valid) || 0 },
      { name: 'A Vencer', value: parseInt(row.expiring) || 0 },
      { name: 'Vencidos', value: parseInt(row.expired) || 0 },
    ]);
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/documents/by-category — for bar chart
router.get('/by-category', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category as name, COUNT(*) as value
      FROM documents
      GROUP BY category
      ORDER BY value DESC
    `);
    res.json(result.rows.map(r => ({ name: r.name, value: parseInt(r.value) || 0 })));
  } catch (error) {
    console.error('Error fetching documents by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/documents/expiry-by-month — for expiry forecast chart
router.get('/expiry-by-month', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(expiry_date, 'Mon') as name,
        TO_CHAR(expiry_date, 'MM') as month_num,
        COUNT(*) as value
      FROM documents
      WHERE expiry_date >= NOW() AND expiry_date <= NOW() + INTERVAL '6 months'
      GROUP BY TO_CHAR(expiry_date, 'Mon'), TO_CHAR(expiry_date, 'MM')
      ORDER BY month_num
    `);
    res.json(result.rows.map(r => ({ name: r.name, value: parseInt(r.value) || 0 })));
  } catch (error) {
    console.error('Error fetching expiry by month:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/documents
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, v.plate as vehicle_plate, dr.name as driver_name
      FROM documents d
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/documents
router.post('/', async (req, res) => {
  try {
    const { 
      name, category, related_to, number, issue_date, expiry_date, 
      status, responsible, vehicle_id, driver_id, notes 
    } = req.body;
    
    let realVehicleId = null;
    let realDriverId = null;
    
    if (vehicle_id) {
        const vCheck = await pool.query('SELECT id FROM vehicles LIMIT 1');
        realVehicleId = vCheck.rows[0]?.id;
    }
    
    if (driver_id) {
        const dCheck = await pool.query('SELECT id FROM drivers LIMIT 1');
        realDriverId = dCheck.rows[0]?.id;
    }

    const result = await pool.query(
      `INSERT INTO documents(name, category, related_to, number, issue_date, expiry_date, status, responsible, vehicle_id, driver_id, notes)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, category, related_to, number, issue_date || new Date(), expiry_date || new Date(), status, responsible, realVehicleId, realDriverId, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
