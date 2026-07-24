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
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

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

    let totalCostQuery = `
      SELECT SUM(cost) as total_cost
      FROM (
        SELECT cost, maintenance_date as date FROM maintenance_records
        UNION ALL
        SELECT cost, fuel_date as date FROM fuel_records
      ) combined
    `;
    let totalCostParams = [];
    if (startDate && endDate) {
      totalCostQuery += ' WHERE date >= $1 AND date <= $2';
      totalCostParams.push(startDate, endDate);
    }
    const totalCostResult = await pool.query(totalCostQuery, totalCostParams);
    const totalCost = parseFloat(totalCostResult.rows[0].total_cost) || 0;

    const costsHistoryResult = await pool.query(`
      SELECT 
        TO_CHAR(date, 'Mon') as month,
        TO_CHAR(date, 'MM') as month_num,
        SUM(cost) as total,
        category
      FROM (
        SELECT maintenance_date as date, cost, 'Manutenção' as category FROM maintenance_records
        UNION ALL
        SELECT fuel_date as date, cost, 'Abastecimento' as category FROM fuel_records
      ) combined
      WHERE date >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(date, 'Mon'), TO_CHAR(date, 'MM'), category
      ORDER BY month_num
    `);
    
    // Group history by month to have both total, manutencao and abastecimento
    const historyMap = new Map();
    costsHistoryResult.rows.forEach(r => {
      if (!historyMap.has(r.month)) {
        historyMap.set(r.month, { month: r.month, total: 0, manutencao: 0, abastecimento: 0 });
      }
      const item = historyMap.get(r.month);
      const cost = parseFloat(r.total) || 0;
      item.total += cost;
      if (r.category === 'Manutenção') item.manutencao += cost;
      if (r.category === 'Abastecimento') item.abastecimento += cost;
    });
    const costsHistory = Array.from(historyMap.values());

    let byCategoryQuery = `
      SELECT category, SUM(cost) as value
      FROM (
        SELECT 'Manutenção' as category, cost, maintenance_date as date FROM maintenance_records
        UNION ALL
        SELECT 'Abastecimento' as category, cost, fuel_date as date FROM fuel_records
      ) combined
    `;
    let byCatParams = [];
    if (startDate && endDate) {
      byCategoryQuery += ' WHERE date >= $1 AND date <= $2';
      byCatParams.push(startDate, endDate);
    }
    byCategoryQuery += ' GROUP BY category';
    
    const costsByCategoryResult = await pool.query(byCategoryQuery, byCatParams);
    const costsByCategory = costsByCategoryResult.rows.map(r => ({ name: r.category, value: parseFloat(r.value) || 0 }));

    res.json({
      vehicles: { total: totalVehicles, active: activeVehicles, maintenance: 0, inactive: totalVehicles - activeVehicles },
      drivers: { total: totalDrivers, active: activeDrivers, onRoute: 0, inactive: totalDrivers - activeDrivers },
      fines: { pendingValue: pendingFinesValue },
      documents: { expiring: expiringDocuments },
      costs: { 
        maintenance: totalCost, 
        totalMonthly: totalCost + pendingFinesValue,
        history: costsHistory,
        byCategory: costsByCategory
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
