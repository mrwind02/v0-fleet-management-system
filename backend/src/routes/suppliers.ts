import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// ─── GET /api/suppliers ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, category, city, state, unit, status, contract, rating } = req.query;

    let query = `
      SELECT s.*,
        (SELECT COUNT(*) FROM supplier_contracts c WHERE c.supplier_id = s.id AND c.status = 'Vigente') AS active_contracts_count
      FROM suppliers s
      WHERE 1=1
    `;
    const params: any[] = [];
    let pCount = 1;

    if (search) {
      query += ` AND (
        s.trade_name ILIKE $${pCount} OR
        s.corporate_name ILIKE $${pCount} OR
        s.cnpj ILIKE $${pCount} OR
        s.code ILIKE $${pCount} OR
        s.contact_name ILIKE $${pCount}
      )`;
      params.push(`%${search}%`);
      pCount++;
    }

    if (category && category !== 'all') {
      query += ` AND (s.primary_category = $${pCount} OR $${pCount} = ANY(s.categories))`;
      params.push(category);
      pCount++;
    }

    if (city && city !== 'all') {
      query += ` AND s.city ILIKE $${pCount}`;
      params.push(`%${city}%`);
      pCount++;
    }

    if (state && state !== 'all') {
      query += ` AND s.state = $${pCount}`;
      params.push(state);
      pCount++;
    }

    if (unit && unit !== 'all') {
      query += ` AND $${pCount} = ANY(s.units)`;
      params.push(unit);
      pCount++;
    }

    if (status && status !== 'all') {
      query += ` AND s.status = $${pCount}`;
      params.push(status);
      pCount++;
    }

    if (rating && rating !== 'all') {
      query += ` AND s.rating >= $${pCount}`;
      params.push(parseFloat(rating as string));
      pCount++;
    }

    query += ` ORDER BY s.trade_name ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/suppliers/metrics ──────────────────────────────────────────────
router.get('/metrics', async (req, res) => {
  try {
    const activeRes = await pool.query(`SELECT COUNT(*) FROM suppliers WHERE status = 'Ativo'`);
    const activeContractsRes = await pool.query(`SELECT COUNT(*) FROM supplier_contracts WHERE status = 'Vigente'`);
    const expiringContractsRes = await pool.query(`
      SELECT COUNT(*) FROM supplier_contracts
      WHERE end_date <= NOW() + INTERVAL '30 days' AND status != 'Encerrado'
    `);
    const monthPaymentsRes = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
      WHERE date >= date_trunc('month', CURRENT_DATE)
    `);
    const totalSpentYearRes = await pool.query(`SELECT COALESCE(SUM(total_spent), 0) AS total FROM suppliers`);
    const avgRatingRes = await pool.query(`SELECT COALESCE(AVG(rating), 5.0) AS avg FROM suppliers WHERE status = 'Ativo'`);

    res.json({
      activeSuppliers: parseInt(activeRes.rows[0].count, 10),
      activeContracts: parseInt(activeContractsRes.rows[0].count, 10),
      expiringContracts: parseInt(expiringContractsRes.rows[0].count, 10),
      monthPayments: parseFloat(monthPaymentsRes.rows[0].total),
      totalSpentYear: parseFloat(totalSpentYearRes.rows[0].total),
      avgRating: parseFloat(parseFloat(avgRatingRes.rows[0].avg).toFixed(1)),
    });
  } catch (error) {
    console.error('Error fetching supplier metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/suppliers/charts ───────────────────────────────────────────────
router.get('/charts', async (req, res) => {
  try {
    // Top 10 by spent
    const spentRes = await pool.query(`
      SELECT trade_name AS name, total_spent AS value
      FROM suppliers
      ORDER BY total_spent DESC
      LIMIT 10
    `);

    // Category distribution
    const catRes = await pool.query(`
      SELECT primary_category AS name, SUM(total_spent) AS value
      FROM suppliers
      GROUP BY primary_category
      ORDER BY value DESC
    `);

    // Contracts over 12 months (mocked or aggregated)
    const contractsHistory = [
      { name: "Ago", novos: 2, renovados: 1, encerrados: 0 },
      { name: "Set", novos: 1, renovados: 2, encerrados: 1 },
      { name: "Out", novos: 3, renovados: 0, encerrados: 0 },
      { name: "Nov", novos: 1, renovados: 1, encerrados: 0 },
      { name: "Dez", novos: 0, renovados: 3, encerrados: 1 },
      { name: "Jan", novos: 2, renovados: 1, encerrados: 0 },
      { name: "Fev", novos: 1, renovados: 0, encerrados: 0 },
      { name: "Mar", novos: 4, renovados: 2, encerrados: 1 },
      { name: "Abr", novos: 2, renovados: 1, encerrados: 0 },
      { name: "Mai", novos: 1, renovados: 3, encerrados: 1 },
      { name: "Jun", novos: 3, renovados: 1, encerrados: 0 },
      { name: "Jul", novos: 2, renovados: 2, encerrados: 0 }
    ];

    res.json({
      bySpent: spentRes.rows,
      byCategory: catRes.rows,
      contractsHistory,
    });
  } catch (error) {
    console.error('Error fetching supplier charts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/suppliers/insights ─────────────────────────────────────────────
router.get('/insights', async (req, res) => {
  try {
    const topBillingRes = await pool.query(`
      SELECT trade_name AS name, total_spent AS amount
      FROM suppliers
      ORDER BY total_spent DESC
      LIMIT 1
    `);

    const topRatedRes = await pool.query(`
      SELECT trade_name AS name, rating, services_count
      FROM suppliers
      ORDER BY rating DESC, services_count DESC
      LIMIT 1
    `);

    const criticalContractRes = await pool.query(`
      SELECT c.description, c.end_date, s.trade_name,
        (c.end_date - CURRENT_DATE) AS days_left
      FROM supplier_contracts c
      JOIN suppliers s ON s.id = c.supplier_id
      WHERE c.status != 'Encerrado' AND c.end_date >= CURRENT_DATE
      ORDER BY c.end_date ASC
      LIMIT 1
    `);

    res.json({
      topBilling: topBillingRes.rows[0] ? {
        name: topBillingRes.rows[0].name,
        amount: parseFloat(topBillingRes.rows[0].amount),
        period: "Últimos 12 meses"
      } : { name: "Oficina Mecânica Alfa", amount: 184000, period: "Últimos 12 meses" },

      topRated: topRatedRes.rows[0] ? {
        name: topRatedRes.rows[0].name,
        rating: parseFloat(topRatedRes.rows[0].rating),
        servicesCount: topRatedRes.rows[0].services_count
      } : { name: "Posto Shell Centro", rating: 4.9, servicesCount: 112 },

      criticalContract: criticalContractRes.rows[0] ? {
        name: criticalContractRes.rows[0].trade_name,
        description: criticalContractRes.rows[0].description,
        daysLeft: parseInt(criticalContractRes.rows[0].days_left, 10)
      } : { name: "Seguro Porto", description: "Seguro Frota", daysLeft: 8 }
    });
  } catch (error) {
    console.error('Error fetching supplier insights:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/suppliers/categories ──────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM supplier_categories ORDER BY name ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching supplier categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── POST /api/suppliers/categories ─────────────────────────────────────────
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const result = await pool.query(
      `INSERT INTO supplier_categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = $2 RETURNING *`,
      [name, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating supplier category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/suppliers/:id (Visão 360º payload) ─────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const supRes = await pool.query(`SELECT * FROM suppliers WHERE id = $1`, [id]);
    if (supRes.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplier = supRes.rows[0];

    const [contractsRes, contactsRes, documentsRes, historyRes, workOrdersRes, expensesRes] = await Promise.all([
      pool.query(`SELECT * FROM supplier_contracts WHERE supplier_id = $1 ORDER BY end_date DESC`, [id]),
      pool.query(`SELECT * FROM supplier_contacts WHERE supplier_id = $1 ORDER BY is_primary DESC, name ASC`, [id]),
      pool.query(`SELECT * FROM supplier_documents WHERE supplier_id = $1 ORDER BY created_at DESC`, [id]),
      pool.query(`SELECT * FROM supplier_history WHERE supplier_id = $1 ORDER BY created_at DESC`, [id]),
      pool.query(`
        SELECT wo.*, v.plate AS vehicle_plate, v.brand AS vehicle_brand, v.model AS vehicle_model
        FROM work_orders wo
        LEFT JOIN vehicles v ON v.id = wo.vehicle_id
        WHERE wo.workshop_name ILIKE $2 OR wo.workshop_name ILIKE $3
        ORDER BY wo.opened_at DESC
        LIMIT 20
      `, [id, `%${supplier.trade_name}%`, `%${supplier.corporate_name}%`]),
      pool.query(`
        SELECT * FROM expenses
        WHERE supplier ILIKE $2 OR supplier ILIKE $3
        ORDER BY date DESC
        LIMIT 20
      `, [id, `%${supplier.trade_name}%`, `%${supplier.corporate_name}%`]),
    ]);

    supplier.contracts = contractsRes.rows;
    supplier.contacts = contactsRes.rows;
    supplier.documents = documentsRes.rows;
    supplier.history = historyRes.rows;
    supplier.work_orders = workOrdersRes.rows;
    supplier.expenses = expensesRes.rows;

    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier 360 view:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── POST /api/suppliers ──────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      code, trade_name, corporate_name, cnpj, state_registration, municipal_registration,
      primary_category, specialty, categories, status, is_homologated, rating,
      contact_name, phone, whatsapp, email, website,
      zip_code, street, number, complement, neighborhood, city, state, country,
      units, preferred_payment_method, payment_terms_days, bank_info, pix_key, financial_notes, notes
    } = req.body;

    if (!trade_name || !corporate_name || !cnpj) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Trade name, corporate name, and CNPJ are required.' });
    }

    // Auto-generate code if missing
    let finalCode = code;
    if (!finalCode) {
      const countRes = await client.query(`SELECT COUNT(*) FROM suppliers`);
      const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
      finalCode = `FOR-${String(nextNum).padStart(3, '0')}`;
    }

    const supRes = await client.query(`
      INSERT INTO suppliers (
        code, trade_name, corporate_name, cnpj, state_registration, municipal_registration,
        primary_category, specialty, categories, status, is_homologated, rating,
        contact_name, phone, whatsapp, email, website,
        zip_code, street, number, complement, neighborhood, city, state, country,
        units, preferred_payment_method, payment_terms_days, bank_info, pix_key, financial_notes, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25,
        $26, $27, $28, $29, $30, $31, $32
      ) RETURNING *
    `, [
      finalCode, trade_name, corporate_name, cnpj, state_registration || null, municipal_registration || null,
      primary_category || 'Outros', specialty || null, categories || [primary_category || 'Outros'],
      status || 'Ativo', is_homologated !== undefined ? is_homologated : true, rating || 5.0,
      contact_name || null, phone || null, whatsapp || null, email || null, website || null,
      zip_code || null, street || null, number || null, complement || null, neighborhood || null,
      city || 'São Paulo', state || 'SP', country || 'Brasil',
      units || ['Matriz São Paulo'], preferred_payment_method || 'Transferência Bancária',
      payment_terms_days ? parseInt(payment_terms_days, 10) : 30,
      bank_info || null, pix_key || null, financial_notes || null, notes || null
    ]);

    const newSupplier = supRes.rows[0];

    // Primary contact entry
    if (contact_name) {
      await client.query(`
        INSERT INTO supplier_contacts (supplier_id, name, phone, whatsapp, email, is_primary)
        VALUES ($1, $2, $3, $4, $5, TRUE)
      `, [newSupplier.id, contact_name, phone || null, whatsapp || null, email || null]);
    }

    // Initial timeline event
    await client.query(`
      INSERT INTO supplier_history (supplier_id, event_type, description, user_name)
      VALUES ($1, 'created', 'Fornecedor cadastrado no ERP FrotaOne', 'Sistema')
    `, [newSupplier.id]);

    await client.query('COMMIT');
    res.status(201).json(newSupplier);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating supplier:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'CNPJ ou Código de fornecedor já cadastrado.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// ─── PUT /api/suppliers/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => { /* handled above */ });

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const {
      trade_name, corporate_name, cnpj, state_registration, municipal_registration,
      primary_category, specialty, categories, status, is_homologated, rating,
      contact_name, phone, whatsapp, email, website,
      zip_code, street, number, complement, neighborhood, city, state, country,
      units, preferred_payment_method, payment_terms_days, bank_info, pix_key, financial_notes, notes
    } = req.body;

    const result = await client.query(`
      UPDATE suppliers SET
        trade_name = COALESCE($1, trade_name),
        corporate_name = COALESCE($2, corporate_name),
        cnpj = COALESCE($3, cnpj),
        state_registration = COALESCE($4, state_registration),
        municipal_registration = COALESCE($5, municipal_registration),
        primary_category = COALESCE($6, primary_category),
        specialty = COALESCE($7, specialty),
        categories = COALESCE($8, categories),
        status = COALESCE($9, status),
        is_homologated = COALESCE($10, is_homologated),
        rating = COALESCE($11, rating),
        contact_name = COALESCE($12, contact_name),
        phone = COALESCE($13, phone),
        whatsapp = COALESCE($14, whatsapp),
        email = COALESCE($15, email),
        website = COALESCE($16, website),
        zip_code = COALESCE($17, zip_code),
        street = COALESCE($18, street),
        number = COALESCE($19, number),
        complement = COALESCE($20, complement),
        neighborhood = COALESCE($21, neighborhood),
        city = COALESCE($22, city),
        state = COALESCE($23, state),
        country = COALESCE($24, country),
        units = COALESCE($25, units),
        preferred_payment_method = COALESCE($26, preferred_payment_method),
        payment_terms_days = COALESCE($27, payment_terms_days),
        bank_info = COALESCE($28, bank_info),
        pix_key = COALESCE($29, pix_key),
        financial_notes = COALESCE($30, financial_notes),
        notes = COALESCE($31, notes),
        updated_at = NOW()
      WHERE id = $32 RETURNING *
    `, [
      trade_name, corporate_name, cnpj, state_registration, municipal_registration,
      primary_category, specialty, categories, status, is_homologated, rating,
      contact_name, phone, whatsapp, email, website,
      zip_code, street, number, complement, neighborhood, city, state, country,
      units, preferred_payment_method, payment_terms_days, bank_info, pix_key, financial_notes, notes, id
    ]);

    await client.query(`
      INSERT INTO supplier_history (supplier_id, event_type, description, user_name)
      VALUES ($1, 'updated', 'Cadastro de fornecedor atualizado', 'Sistema')
    `, [id]);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// ─── PATCH /api/suppliers/:id/status ─────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status, user_name } = req.body;

    const current = await client.query('SELECT status FROM suppliers WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const oldStatus = current.rows[0].status;

    const result = await client.query(`
      UPDATE suppliers SET status = $1::varchar, updated_at = NOW() WHERE id = $2 RETURNING *
    `, [status, id]);

    await client.query(`
      INSERT INTO supplier_history (supplier_id, event_type, description, old_value, new_value, user_name)
      VALUES ($1, 'status_change', $2, $3, $4, $5)
    `, [id, `Status alterado de "${oldStatus}" para "${status}"`, oldStatus, status, user_name || 'Sistema']);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating supplier status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// ─── DELETE /api/suppliers/:id ───────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── POST /api/suppliers/:id/contracts ───────────────────────────────────────
router.post('/:id/contracts', async (req, res) => {
  try {
    const { id } = req.params;
    const { contract_number, description, start_date, end_date, amount, status, file_url } = req.body;

    const result = await pool.query(`
      INSERT INTO supplier_contracts (supplier_id, contract_number, description, start_date, end_date, amount, status, file_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [
      id, contract_number || 'CTR-NOVO', description, start_date, end_date,
      amount ? parseFloat(amount) : 0, status || 'Vigente', file_url || null
    ]);

    await pool.query(`
      INSERT INTO supplier_history (supplier_id, event_type, description, user_name)
      VALUES ($1, 'contract_added', $2, 'Sistema')
    `, [id, `Novo contrato registrado: ${contract_number}`]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding contract:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── DELETE /api/suppliers/:id/contracts/:contractId ─────────────────────────
router.delete('/:id/contracts/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    await pool.query('DELETE FROM supplier_contracts WHERE id = $1', [contractId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── POST /api/suppliers/:id/contacts ────────────────────────────────────────
router.post('/:id/contacts', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, whatsapp, email, is_primary } = req.body;

    const result = await pool.query(`
      INSERT INTO supplier_contacts (supplier_id, name, role, phone, whatsapp, email, is_primary)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [id, name, role || null, phone || null, whatsapp || null, email || null, is_primary || false]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── POST /api/suppliers/:id/documents ───────────────────────────────────────
router.post('/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const { doc_type, name, file_url, expiry_date } = req.body;

    const result = await pool.query(`
      INSERT INTO supplier_documents (supplier_id, doc_type, name, file_url, expiry_date)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [id, doc_type || 'Outros', name, file_url || '#', expiry_date || null]);

    await pool.query(`
      INSERT INTO supplier_history (supplier_id, event_type, description, user_name)
      VALUES ($1, 'document_added', $2, 'Sistema')
    `, [id, `Documento anexado: ${name}`]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
