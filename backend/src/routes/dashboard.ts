import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

router.get('/metrics', async (req, res) => {
  try {
    const vResult = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active FROM vehicles');
    const totalVehicles = parseInt(vResult.rows[0].total) || 0;
    const activeVehicles = parseInt(vResult.rows[0].active) || 0;
    
    const dResult = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active FROM drivers');
    const totalDrivers = parseInt(dResult.rows[0].total) || 0;
    const activeDrivers = parseInt(dResult.rows[0].active) || 0;

    const fResult = await pool.query('SELECT SUM(value) as total_fines FROM fines WHERE status != $1', ['pago']);
    const pendingFinesValue = parseFloat(fResult.rows[0].total_fines) || 0;
    
    const docResult = await pool.query('SELECT COUNT(*) as expiring FROM documents WHERE expiry_date <= NOW() + INTERVAL \'30 days\' AND status != $1', ['vencido']);
    const expiringDocuments = parseInt(docResult.rows[0].expiring) || 0;

    const maintResult = await pool.query('SELECT SUM(cost) as total_maint FROM maintenance_records');
    const maintenanceCost = parseFloat(maintResult.rows[0].total_maint) || 0;

    res.json({
      vehicles: { total: totalVehicles, active: activeVehicles, maintenance: 0, inactive: totalVehicles - activeVehicles },
      drivers: { total: totalDrivers, active: activeDrivers, onRoute: 0, inactive: totalDrivers - activeDrivers },
      fines: { pendingValue: pendingFinesValue },
      documents: { expiring: expiringDocuments },
      costs: { maintenance: maintenanceCost, totalMonthly: maintenanceCost + pendingFinesValue }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
