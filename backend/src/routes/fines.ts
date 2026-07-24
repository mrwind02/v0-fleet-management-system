import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET /api/fines
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, v.plate as vehicle_plate, v.brand as vehicle_brand, v.model as vehicle_model,
             d.name as driver_name, d.cnh_number as driver_cnh
      FROM fines f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN drivers d ON f.driver_id = d.id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fines:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/fines
router.post('/', async (req, res) => {
  try {
    const { 
      auto_number, infraction_date, organ, category, description, 
      vehicle_id, driver_id, value, points, due_date, status, notes 
    } = req.body;

    const result = await pool.query(
      `INSERT INTO fines(auto_number, infraction_date, organ, category, description, vehicle_id, driver_id, value, points, due_date, status, notes)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [auto_number, infraction_date || new Date(), organ, category, description, vehicle_id || null, driver_id || null, value, points, due_date || new Date(), status, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating fine:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/fines/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT f.*, v.plate as vehicle_plate, v.brand as vehicle_brand, v.model as vehicle_model,
             d.name as driver_name, d.cnh_number as driver_cnh
      FROM fines f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN drivers d ON f.driver_id = d.id
      WHERE f.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fine not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching fine:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
