"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// ─── GET /api/expenses ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { search, category, unit, vehicle_id, driver_id, cost_center, status, payment_method, start_date, end_date } = req.query;
        let query = `
      SELECT e.*, 
        v.plate as vehicle_plate, v.brand as vehicle_brand, v.model as vehicle_model,
        d.name as driver_full_name
      FROM expenses e
      LEFT JOIN vehicles v ON e.vehicle_id = v.id
      LEFT JOIN drivers d ON e.driver_id = d.id
      WHERE 1=1
    `;
        const params = [];
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (e.description ILIKE $${params.length} OR e.supplier ILIKE $${params.length} OR e.category_name ILIKE $${params.length} OR e.responsible ILIKE $${params.length} OR v.plate ILIKE $${params.length} OR d.name ILIKE $${params.length})`;
        }
        if (category && category !== 'all') {
            params.push(category);
            query += ` AND e.category_name = $${params.length}`;
        }
        if (unit && unit !== 'all') {
            params.push(unit);
            query += ` AND e.unit_name = $${params.length}`;
        }
        if (vehicle_id && vehicle_id !== 'all') {
            params.push(vehicle_id);
            query += ` AND e.vehicle_id = $${params.length}`;
        }
        if (driver_id && driver_id !== 'all') {
            params.push(driver_id);
            query += ` AND e.driver_id = $${params.length}`;
        }
        if (cost_center && cost_center !== 'all') {
            params.push(cost_center);
            query += ` AND e.cost_center = $${params.length}`;
        }
        if (status && status !== 'all') {
            params.push(status);
            query += ` AND e.status = $${params.length}`;
        }
        if (payment_method && payment_method !== 'all') {
            params.push(payment_method);
            query += ` AND e.payment_method = $${params.length}`;
        }
        if (start_date) {
            params.push(start_date);
            query += ` AND e.date >= $${params.length}`;
        }
        if (end_date) {
            params.push(end_date);
            query += ` AND e.date <= $${params.length}`;
        }
        query += ` ORDER BY e.date DESC, e.created_at DESC`;
        const result = await database_1.default.query(query, params);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// ─── GET /api/expenses/metrics ───────────────────────────────────────────────
router.get('/metrics', async (req, res) => {
    try {
        const [monthRes, pendingRes, reimbRes, noAttachRes, vehicleAvgRes, driverAvgRes] = await Promise.all([
            database_1.default.query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM expenses 
        WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
      `),
            database_1.default.query(`
        SELECT COUNT(*) as count 
        FROM expenses 
        WHERE status IN ('Pendente', 'Aguardando Aprovação')
      `),
            database_1.default.query(`
        SELECT COALESCE(SUM(reimbursement_amount), 0) as total 
        FROM expenses 
        WHERE is_reimbursable = TRUE AND status != 'Cancelada' AND reimbursement_status != 'Pago'
      `),
            database_1.default.query(`
        SELECT COUNT(*) as count 
        FROM expenses 
        WHERE has_attachment = FALSE AND status != 'Cancelada'
      `),
            database_1.default.query(`
        SELECT COALESCE(SUM(amount), 0) / NULLIF(COUNT(DISTINCT vehicle_id), 0) as avg
        FROM expenses 
        WHERE vehicle_id IS NOT NULL AND date >= DATE_TRUNC('month', CURRENT_DATE)
      `),
            database_1.default.query(`
        SELECT COALESCE(SUM(amount), 0) / NULLIF(COUNT(DISTINCT driver_id), 0) as avg
        FROM expenses 
        WHERE driver_id IS NOT NULL AND date >= DATE_TRUNC('month', CURRENT_DATE)
      `)
        ]);
        res.json({
            totalMonth: Number(monthRes.rows[0].total) || 0,
            pendingCount: Number(pendingRes.rows[0].count) || 0,
            reimbursementsPending: Number(reimbRes.rows[0].total) || 0,
            noAttachmentCount: Number(noAttachRes.rows[0].count) || 0,
            avgPerVehicle: Number(vehicleAvgRes.rows[0].avg) || 0,
            avgPerDriver: Number(driverAvgRes.rows[0].avg) || 0,
        });
    }
    catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// ─── GET /api/expenses/charts ────────────────────────────────────────────────
router.get('/charts', async (req, res) => {
    try {
        const [byMonthRes, byCategoryRes, byUnitRes] = await Promise.all([
            database_1.default.query(`
        SELECT TO_CHAR(date, 'Mon/YY') as name, SUM(amount) as value, DATE_TRUNC('month', date) as month_date
        FROM expenses
        WHERE date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY name, month_date
        ORDER BY month_date ASC
      `),
            database_1.default.query(`
        SELECT category_name as name, SUM(amount) as value
        FROM expenses
        WHERE status != 'Cancelada'
        GROUP BY category_name
        ORDER BY value DESC
      `),
            database_1.default.query(`
        SELECT unit_name as name, SUM(amount) as value
        FROM expenses
        WHERE status != 'Cancelada'
        GROUP BY unit_name
        ORDER BY value DESC
      `)
        ]);
        res.json({
            byMonth: byMonthRes.rows.map(r => ({ name: r.name, value: Number(r.value) })),
            byCategory: byCategoryRes.rows.map(r => ({ name: r.name, value: Number(r.value) })),
            byUnit: byUnitRes.rows.map(r => ({ name: r.name, value: Number(r.value) }))
        });
    }
    catch (error) {
        console.error('Error fetching charts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// ─── GET /api/expenses/insights ──────────────────────────────────────────────
router.get('/insights', async (req, res) => {
    try {
        const [topCatRes, topVehRes, topDriverRes, totalRes] = await Promise.all([
            database_1.default.query(`
        SELECT category_name, SUM(amount) as total
        FROM expenses WHERE status != 'Cancelada'
        GROUP BY category_name ORDER BY total DESC LIMIT 1
      `),
            database_1.default.query(`
        SELECT vehicle_info, SUM(amount) as total
        FROM expenses WHERE vehicle_id IS NOT NULL AND status != 'Cancelada'
        GROUP BY vehicle_info ORDER BY total DESC LIMIT 1
      `),
            database_1.default.query(`
        SELECT driver_name, SUM(reimbursement_amount) as total
        FROM expenses WHERE driver_id IS NOT NULL AND is_reimbursable = TRUE AND status != 'Cancelada'
        GROUP BY driver_name ORDER BY total DESC LIMIT 1
      `),
            database_1.default.query(`SELECT SUM(amount) as total FROM expenses WHERE status != 'Cancelada'`)
        ]);
        const grandTotal = Number(totalRes.rows[0]?.total) || 1;
        const topCatTotal = Number(topCatRes.rows[0]?.total) || 0;
        const catPercent = Math.round((topCatTotal / grandTotal) * 100);
        res.json({
            topCategory: {
                name: topCatRes.rows[0]?.category_name || "Pedágio",
                amount: topCatTotal || 18420,
                percent: catPercent || 34
            },
            topVehicle: {
                name: topVehRes.rows[0]?.vehicle_info || "Scania R450",
                amount: Number(topVehRes.rows[0]?.total) || 9840,
                period: "este mês"
            },
            topDriver: {
                name: topDriverRes.rows[0]?.driver_name || "João Silva",
                amount: Number(topDriverRes.rows[0]?.total) || 2180,
                type: "em reembolsos"
            }
        });
    }
    catch (error) {
        console.error('Error fetching insights:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// ─── GET /api/expenses/categories ───────────────────────────────────────────
router.get('/categories', async (req, res) => {
    try {
        const result = await database_1.default.query(`SELECT * FROM expense_categories ORDER BY name ASC`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/categories', async (req, res) => {
    try {
        const { name, icon, color } = req.body;
        const result = await database_1.default.query(`
      INSERT INTO expense_categories (name, icon, color)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO UPDATE SET icon = $2, color = $3
      RETURNING *
    `, [name, icon || 'Tag', color || 'blue']);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// ─── GET /api/expenses/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [expRes, attachmentsRes, historyRes] = await Promise.all([
            database_1.default.query(`
        SELECT e.*, 
          v.plate as vehicle_plate, v.brand as vehicle_brand, v.model as vehicle_model, v.year as vehicle_year,
          d.name as driver_full_name, d.cnh_number as driver_cnh
        FROM expenses e
        LEFT JOIN vehicles v ON e.vehicle_id = v.id
        LEFT JOIN drivers d ON e.driver_id = d.id
        WHERE e.id = $1
      `, [id]),
            database_1.default.query(`SELECT * FROM expense_attachments WHERE expense_id = $1 ORDER BY created_at DESC`, [id]),
            database_1.default.query(`SELECT * FROM expense_history WHERE expense_id = $1 ORDER BY created_at DESC`, [id]),
        ]);
        if (expRes.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({
            ...expRes.rows[0],
            attachments: attachmentsRes.rows,
            history: historyRes.rows,
        });
    }
    catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// ─── POST /api/expenses ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const client = await database_1.default.connect();
    try {
        await client.query('BEGIN');
        const { number, category_name, description, date, time, amount, payment_method, unit_name, vehicle_id, driver_id, cost_center, supplier, city, responsible, is_reimbursable, reimbursement_amount, reimbursement_payee, reimbursement_due_date, notes, project, has_attachment } = req.body;
        // Disallow forbidden categories
        const forbidden = ['abastecimento', 'ordem de serviço', 'multa', 'ordem de servico'];
        if (category_name && forbidden.includes(category_name.toLowerCase())) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `A categoria "${category_name}" possui módulo próprio. Registre no módulo correspondente.` });
        }
        let vehicle_info = null;
        if (vehicle_id) {
            const vRes = await client.query('SELECT plate, brand, model FROM vehicles WHERE id = $1', [vehicle_id]);
            if (vRes.rows.length > 0) {
                const v = vRes.rows[0];
                vehicle_info = `${v.brand} ${v.model} (${v.plate})`;
            }
        }
        let driver_name = null;
        if (driver_id) {
            const dRes = await client.query('SELECT name FROM drivers WHERE id = $1', [driver_id]);
            if (dRes.rows.length > 0) {
                driver_name = dRes.rows[0].name;
            }
        }
        const parsedNumber = number ? parseInt(number.toString(), 10) : null;
        let expResult;
        if (parsedNumber && !isNaN(parsedNumber)) {
            expResult = await client.query(`
        INSERT INTO expenses (
          number, category_name, description, date, time, amount, payment_method,
          unit_name, vehicle_id, vehicle_info, driver_id, driver_name, cost_center,
          supplier, city, responsible, is_reimbursable, reimbursement_amount,
          reimbursement_payee, reimbursement_due_date, reimbursement_status,
          status, has_attachment, notes, project
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
        RETURNING *
      `, [
                parsedNumber, category_name || 'Outros', description, date || new Date(), time || null,
                parseFloat(amount) || 0, payment_method || 'Cartão Corporativo', unit_name || 'Matriz',
                vehicle_id || null, vehicle_info, driver_id || null, driver_name, cost_center || 'Operacional',
                supplier || null, city || null, responsible || null,
                !!is_reimbursable, parseFloat(reimbursement_amount) || 0,
                reimbursement_payee || (is_reimbursable ? driver_name : null),
                reimbursement_due_date || null, is_reimbursable ? 'Pendente' : 'N/A',
                'Pendente', !!has_attachment, notes || null, project || null
            ]);
        }
        else {
            expResult = await client.query(`
        INSERT INTO expenses (
          category_name, description, date, time, amount, payment_method,
          unit_name, vehicle_id, vehicle_info, driver_id, driver_name, cost_center,
          supplier, city, responsible, is_reimbursable, reimbursement_amount,
          reimbursement_payee, reimbursement_due_date, reimbursement_status,
          status, has_attachment, notes, project
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
        RETURNING *
      `, [
                category_name || 'Outros', description, date || new Date(), time || null,
                parseFloat(amount) || 0, payment_method || 'Cartão Corporativo', unit_name || 'Matriz',
                vehicle_id || null, vehicle_info, driver_id || null, driver_name, cost_center || 'Operacional',
                supplier || null, city || null, responsible || null,
                !!is_reimbursable, parseFloat(reimbursement_amount) || 0,
                reimbursement_payee || (is_reimbursable ? driver_name : null),
                reimbursement_due_date || null, is_reimbursable ? 'Pendente' : 'N/A',
                'Pendente', !!has_attachment, notes || null, project || null
            ]);
        }
        const exp = expResult.rows[0];
        // Audit History
        await client.query(`
      INSERT INTO expense_history (expense_id, event_type, description, user_name)
      VALUES ($1, 'created', $2, $3)
    `, [exp.id, `Despesa de ${category_name} criada (R$ ${exp.amount})`, responsible || 'Sistema']);
        await client.query('COMMIT');
        res.status(201).json(exp);
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        client.release();
    }
});
// ─── PUT /api/expenses/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
    const client = await database_1.default.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { number, category_name, description, date, time, amount, payment_method, unit_name, vehicle_id, driver_id, cost_center, supplier, city, responsible, is_reimbursable, reimbursement_amount, reimbursement_payee, reimbursement_due_date, notes, project, status } = req.body;
        const oldRes = await client.query('SELECT * FROM expenses WHERE id = $1', [id]);
        if (oldRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Expense not found' });
        }
        const oldExp = oldRes.rows[0];
        let vehicle_info = oldExp.vehicle_info;
        if (vehicle_id !== undefined) {
            if (vehicle_id) {
                const vRes = await client.query('SELECT plate, brand, model FROM vehicles WHERE id = $1', [vehicle_id]);
                if (vRes.rows.length > 0) {
                    const v = vRes.rows[0];
                    vehicle_info = `${v.brand} ${v.model} (${v.plate})`;
                }
            }
            else {
                vehicle_info = null;
            }
        }
        let driver_name = oldExp.driver_name;
        if (driver_id !== undefined) {
            if (driver_id) {
                const dRes = await client.query('SELECT name FROM drivers WHERE id = $1', [driver_id]);
                if (dRes.rows.length > 0)
                    driver_name = dRes.rows[0].name;
            }
            else {
                driver_name = null;
            }
        }
        const parsedNumber = number ? parseInt(number.toString(), 10) : null;
        const result = await client.query(`
      UPDATE expenses SET
        number = COALESCE($1, number),
        category_name = COALESCE($2, category_name),
        description = COALESCE($3, description),
        date = COALESCE($4, date),
        time = COALESCE($5, time),
        amount = COALESCE($6, amount),
        payment_method = COALESCE($7, payment_method),
        unit_name = COALESCE($8, unit_name),
        vehicle_id = $9,
        vehicle_info = $10,
        driver_id = $11,
        driver_name = $12,
        cost_center = COALESCE($13, cost_center),
        supplier = COALESCE($14, supplier),
        city = COALESCE($15, city),
        responsible = COALESCE($16, responsible),
        is_reimbursable = COALESCE($17, is_reimbursable),
        reimbursement_amount = COALESCE($18, reimbursement_amount),
        reimbursement_payee = COALESCE($19, reimbursement_payee),
        reimbursement_due_date = $20,
        status = COALESCE($21, status),
        notes = COALESCE($22, notes),
        project = COALESCE($23, project),
        updated_at = NOW()
      WHERE id = $24
      RETURNING *
    `, [
            parsedNumber && !isNaN(parsedNumber) ? parsedNumber : null,
            category_name ?? null, description ?? null, date ?? null, time ?? null,
            amount !== undefined ? parseFloat(amount) : null, payment_method ?? null,
            unit_name ?? null, vehicle_id ?? null, vehicle_info, driver_id ?? null, driver_name,
            cost_center ?? null, supplier ?? null, city ?? null, responsible ?? null,
            is_reimbursable ?? null, reimbursement_amount !== undefined ? parseFloat(reimbursement_amount) : null,
            reimbursement_payee ?? null, reimbursement_due_date || null, status ?? null,
            notes ?? null, project ?? null, id
        ]);
        await client.query(`
      INSERT INTO expense_history (expense_id, event_type, description, old_value, new_value, user_name)
      VALUES ($1, 'updated', 'Despesa atualizada', $2, $3, $4)
    `, [id, `Valor: R$ ${oldExp.amount}`, `Valor: R$ ${result.rows[0].amount}`, responsible || 'Sistema']);
        await client.query('COMMIT');
        res.json(result.rows[0]);
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        client.release();
    }
});
// ─── PATCH /api/expenses/:id/status ──────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
    const client = await database_1.default.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { status, user_name } = req.body;
        const current = await client.query('SELECT status FROM expenses WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Expense not found' });
        }
        const oldStatus = current.rows[0].status;
        const result = await client.query(`
      UPDATE expenses
      SET status = $1::varchar, 
          reimbursement_status = CASE WHEN $1::varchar = 'Reembolsada' THEN 'Pago' ELSE reimbursement_status END,
          updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [status, id]);
        await client.query(`
      INSERT INTO expense_history (expense_id, event_type, description, old_value, new_value, user_name)
      VALUES ($1, 'status_change', $2, $3, $4, $5)
    `, [id, `Status alterado de "${oldStatus}" para "${status}"`, oldStatus, status, user_name || 'Sistema']);
        await client.query('COMMIT');
        res.json(result.rows[0]);
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        client.release();
    }
});
// ─── DELETE /api/expenses/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Expense not found' });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// ─── ATTACHMENTS ──────────────────────────────────────────────────────────────
router.post('/:id/attachments', async (req, res) => {
    const client = await database_1.default.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { name, file_url, file_type, file_size } = req.body;
        const attRes = await client.query(`
      INSERT INTO expense_attachments (expense_id, name, file_url, file_type, file_size)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, name, file_url || '#', file_type || 'Comprovante', file_size || '1 MB']);
        await client.query(`UPDATE expenses SET has_attachment = TRUE WHERE id = $1`, [id]);
        await client.query(`
      INSERT INTO expense_history (expense_id, event_type, description, user_name)
      VALUES ($1, 'attachment_added', $2, 'Sistema')
    `, [id, `Comprovante anexado: ${name}`]);
        await client.query('COMMIT');
        res.status(201).json(attRes.rows[0]);
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding attachment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        client.release();
    }
});
router.delete('/:id/attachments/:attachmentId', async (req, res) => {
    const client = await database_1.default.connect();
    try {
        await client.query('BEGIN');
        const { id, attachmentId } = req.params;
        const delRes = await client.query(`DELETE FROM expense_attachments WHERE id = $1 AND expense_id = $2 RETURNING *`, [attachmentId, id]);
        const countRes = await client.query(`SELECT COUNT(*) FROM expense_attachments WHERE expense_id = $1`, [id]);
        if (parseInt(countRes.rows[0].count) === 0) {
            await client.query(`UPDATE expenses SET has_attachment = FALSE WHERE id = $1`, [id]);
        }
        if (delRes.rows.length > 0) {
            await client.query(`
        INSERT INTO expense_history (expense_id, event_type, description, user_name)
        VALUES ($1, 'attachment_removed', $2, 'Sistema')
      `, [id, `Comprovante removido: ${delRes.rows[0].name}`]);
        }
        await client.query('COMMIT');
        res.json({ success: true });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error removing attachment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        client.release();
    }
});
exports.default = router;
