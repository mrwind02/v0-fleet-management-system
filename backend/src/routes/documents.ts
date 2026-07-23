import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
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
