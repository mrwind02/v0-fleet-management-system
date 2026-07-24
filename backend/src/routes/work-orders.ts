import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ─── GET /api/work-orders/metrics ────────────────────────────────────────────
router.get('/metrics', async (req, res) => {
  try {
    const [totals, costMonth, overdueRes, waitingPartsRes, vehiclesDown] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Em Execução' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'Aguardando Peças' THEN 1 ELSE 0 END) as waiting_parts,
          SUM(CASE WHEN status = 'Aguardando Aprovação' THEN 1 ELSE 0 END) as waiting_approval,
          SUM(CASE WHEN status = 'Pausada' THEN 1 ELSE 0 END) as paused
        FROM work_orders
        WHERE status NOT IN ('Concluída', 'Cancelada')
      `),
      pool.query(`
        SELECT COALESCE(SUM(cost_total), 0) as total
        FROM work_orders
        WHERE DATE_TRUNC('month', opened_at) = DATE_TRUNC('month', NOW())
      `),
      pool.query(`
        SELECT COUNT(*) as total
        FROM work_orders
        WHERE estimated_at < NOW() AND status NOT IN ('Concluída', 'Cancelada')
      `),
      pool.query(`
        SELECT COUNT(*) as total FROM work_orders WHERE status = 'Aguardando Peças'
      `),
      pool.query(`
        SELECT COUNT(DISTINCT vehicle_id) as total
        FROM work_orders
        WHERE status NOT IN ('Concluída', 'Cancelada') AND vehicle_id IS NOT NULL
      `)
    ]);

    const row = totals.rows[0];
    res.json({
      total: parseInt(row.total) || 0,
      inProgress: parseInt(row.in_progress) || 0,
      waitingParts: parseInt(row.waiting_parts) || 0,
      waitingApproval: parseInt(row.waiting_approval) || 0,
      paused: parseInt(row.paused) || 0,
      overdue: parseInt(overdueRes.rows[0].total) || 0,
      costMonth: parseFloat(costMonth.rows[0].total) || 0,
      vehiclesDown: parseInt(vehiclesDown.rows[0].total) || 0,
    });
  } catch (error) {
    console.error('Error fetching work order metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/work-orders/cost-by-month ──────────────────────────────────────
router.get('/cost-by-month', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(opened_at, 'Mon') as name,
        TO_CHAR(opened_at, 'MM') as month_num,
        COALESCE(SUM(cost_total), 0) as value
      FROM work_orders
      WHERE opened_at >= NOW() - INTERVAL '12 months'
        AND status = 'Concluída'
      GROUP BY TO_CHAR(opened_at, 'Mon'), TO_CHAR(opened_at, 'MM')
      ORDER BY month_num
    `);
    res.json(result.rows.map(r => ({ name: r.name, value: parseFloat(r.value) || 0 })));
  } catch (error) {
    console.error('Error fetching cost by month:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/work-orders/by-type ────────────────────────────────────────────
router.get('/by-type', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT type as name, COUNT(*) as value
      FROM work_orders
      GROUP BY type ORDER BY value DESC
    `);
    res.json(result.rows.map(r => ({ name: r.name, value: parseInt(r.value) || 0 })));
  } catch (error) {
    console.error('Error fetching by type:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/work-orders/by-status ──────────────────────────────────────────
router.get('/by-status', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT status as name, COUNT(*) as value
      FROM work_orders
      GROUP BY status ORDER BY value DESC
    `);
    res.json(result.rows.map(r => ({ name: r.name, value: parseInt(r.value) || 0 })));
  } catch (error) {
    console.error('Error fetching by status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/work-orders/insights ───────────────────────────────────────────
router.get('/insights', async (req, res) => {
  try {
    const [workshopRes, vehicleCostRes, avgTimeRes] = await Promise.all([
      pool.query(`
        SELECT workshop_name as name, COUNT(*) as os_count
        FROM work_orders
        WHERE DATE_TRUNC('month', opened_at) = DATE_TRUNC('month', NOW())
          AND workshop_name IS NOT NULL
        GROUP BY workshop_name ORDER BY os_count DESC LIMIT 1
      `),
      pool.query(`
        SELECT v.plate, v.model, v.brand,
               COALESCE(SUM(w.cost_total), 0) as total_cost
        FROM work_orders w
        JOIN vehicles v ON w.vehicle_id = v.id
        GROUP BY v.id, v.plate, v.model, v.brand
        ORDER BY total_cost DESC LIMIT 1
      `),
      pool.query(`
        SELECT AVG(EXTRACT(EPOCH FROM (closed_at - opened_at)) / 86400) as avg_days
        FROM work_orders
        WHERE status = 'Concluída' AND closed_at IS NOT NULL
          AND opened_at >= NOW() - INTERVAL '90 days'
      `)
    ]);

    res.json({
      topWorkshop: workshopRes.rows[0] || null,
      criticalVehicle: vehicleCostRes.rows[0] || null,
      avgExecutionDays: parseFloat(avgTimeRes.rows[0]?.avg_days) || 0,
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/work-orders ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, type, vehicle_id } = req.query;
    let query = `
      SELECT 
        w.*,
        v.plate as vehicle_plate,
        v.brand as vehicle_brand,
        v.model as vehicle_model,
        d.name as driver_name
      FROM work_orders w
      LEFT JOIN vehicles v ON w.vehicle_id = v.id
      LEFT JOIN drivers d ON w.driver_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;
    if (status) { query += ` AND w.status = $${idx++}`; params.push(status); }
    if (type) { query += ` AND w.type = $${idx++}`; params.push(type); }
    if (vehicle_id) { query += ` AND w.vehicle_id = $${idx++}`; params.push(vehicle_id); }
    query += ` ORDER BY w.opened_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/work-orders/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [woRes, servicesRes, partsRes, historyRes] = await Promise.all([
      pool.query(`
        SELECT w.*, 
          v.plate as vehicle_plate, v.brand as vehicle_brand, v.model as vehicle_model, v.year as vehicle_year,
          d.name as driver_name, d.cnh_number as driver_cnh
        FROM work_orders w
        LEFT JOIN vehicles v ON w.vehicle_id = v.id
        LEFT JOIN drivers d ON w.driver_id = d.id
        WHERE w.id = $1
      `, [id]),
      pool.query(`SELECT * FROM work_order_services WHERE work_order_id = $1 ORDER BY created_at`, [id]),
      pool.query(`SELECT * FROM work_order_parts WHERE work_order_id = $1 ORDER BY created_at`, [id]),
      pool.query(`SELECT * FROM work_order_history WHERE work_order_id = $1 ORDER BY created_at DESC`, [id]),
    ]);

    if (woRes.rows.length === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    res.json({
      ...woRes.rows[0],
      services: servicesRes.rows,
      parts: partsRes.rows,
      history: historyRes.rows,
    });
  } catch (error) {
    console.error('Error fetching work order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── POST /api/work-orders ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      type, priority, vehicle_id, driver_id, unit, workshop_name, workshop_type,
      responsible, origin, description, diagnosis, notes, opened_at, estimated_at, km_opening,
      cost_labor, cost_towing, cost_others
    } = req.body;

    const woResult = await client.query(`
      INSERT INTO work_orders (
        type, priority, vehicle_id, driver_id, unit, workshop_name, workshop_type,
        responsible, origin, description, diagnosis, notes, opened_at, estimated_at, km_opening,
        cost_labor, cost_towing, cost_others
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *
    `, [
      type || 'Corretiva', priority || 'Média',
      vehicle_id || null, driver_id || null, unit || null,
      workshop_name || null, workshop_type || 'Externa', responsible || null,
      origin || 'Manual', description || null, diagnosis || null, notes || null,
      opened_at || new Date(), estimated_at || null, km_opening || null,
      cost_labor || 0, cost_towing || 0, cost_others || 0
    ]);

    const wo = woResult.rows[0];

    // Create initial history event
    await client.query(`
      INSERT INTO work_order_history (work_order_id, event_type, description, new_value, user_name)
      VALUES ($1, 'created', 'Ordem de Serviço criada', $2, $3)
    `, [wo.id, 'Aberta', 'Sistema']);

    // Update vehicle status
    if (vehicle_id) {
      await client.query(`UPDATE vehicles SET status = 'manutencao' WHERE id = $1`, [vehicle_id]);
    }

    await client.query('COMMIT');
    res.status(201).json(wo);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating work order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// ─── PUT /api/work-orders/:id ─────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type, priority, vehicle_id, driver_id, unit, workshop_name, workshop_type,
      responsible, origin, description, diagnosis, notes, opened_at, estimated_at, closed_at,
      km_opening, km_closing, cost_parts, cost_labor, cost_towing, cost_others
    } = req.body;

    const result = await pool.query(`
      UPDATE work_orders SET
        type = COALESCE($1, type),
        priority = COALESCE($2, priority),
        vehicle_id = COALESCE($3, vehicle_id),
        driver_id = $4,
        unit = COALESCE($5, unit),
        workshop_name = COALESCE($6, workshop_name),
        workshop_type = COALESCE($7, workshop_type),
        responsible = COALESCE($8, responsible),
        origin = COALESCE($9, origin),
        description = COALESCE($10, description),
        diagnosis = COALESCE($11, diagnosis),
        notes = COALESCE($12, notes),
        estimated_at = $13,
        closed_at = $14,
        km_opening = COALESCE($15, km_opening),
        km_closing = $16,
        cost_parts = COALESCE($17, cost_parts),
        cost_labor = COALESCE($18, cost_labor),
        cost_towing = COALESCE($19, cost_towing),
        cost_others = COALESCE($20, cost_others),
        updated_at = NOW()
      WHERE id = $21
      RETURNING *
    `, [
      type ?? null, priority ?? null, vehicle_id ?? null, driver_id || null, unit ?? null,
      workshop_name ?? null, workshop_type ?? null, responsible ?? null, origin ?? null,
      description ?? null, diagnosis ?? null, notes ?? null,
      estimated_at || null, closed_at || null,
      km_opening ?? null, km_closing || null,
      cost_parts ?? null, cost_labor ?? null, cost_towing ?? null, cost_others ?? null,
      id
    ]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Work order not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating work order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── PATCH /api/work-orders/:id/status ───────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status, user_name } = req.body;

    const current = await client.query('SELECT status FROM work_orders WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Work order not found' });

    const oldStatus = current.rows[0].status;
    const closedAtQueryPart = status === 'Concluída' || status === 'Cancelada' ? 'closed_at = NOW()' : 'closed_at = closed_at';

    const result = await client.query(`
      UPDATE work_orders
      SET status = $1, ${closedAtQueryPart}, updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [status, id]);

    await client.query(`
      INSERT INTO work_order_history (work_order_id, event_type, description, old_value, new_value, user_name)
      VALUES ($1, 'status_change', $2, $3, $4, $5)
    `, [id, `Status alterado de "${oldStatus}" para "${status}"`, oldStatus, status, user_name || 'Sistema']);

    // Auto update vehicle status
    if (result.rows[0].vehicle_id) {
      if (status === 'Concluída' || status === 'Cancelada') {
        const otherOS = await client.query(\`
          SELECT id FROM work_orders 
          WHERE vehicle_id = $1 AND status NOT IN ('Concluída', 'Cancelada') AND id != $2 LIMIT 1
        \`, [result.rows[0].vehicle_id, id]);
        
        if (otherOS.rows.length === 0) {
          await client.query(\`UPDATE vehicles SET status = 'operando' WHERE id = $1\`, [result.rows[0].vehicle_id]);
        }
      } else {
        await client.query(\`UPDATE vehicles SET status = 'manutencao' WHERE id = $1\`, [result.rows[0].vehicle_id]);
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

export default router;
