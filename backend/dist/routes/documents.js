"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const router = express_1.default.Router();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// POST /api/documents
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { name, category, related_to, number, issue_date, expiry_date, status, responsible, vehicle_id, driver_id, notes } = req.body;
        let realVehicleId = null;
        let realDriverId = null;
        if (vehicle_id && vehicle_id !== 'undefined') {
            realVehicleId = vehicle_id;
        }
        if (driver_id && driver_id !== 'undefined') {
            realDriverId = driver_id;
        }
        const file_url = req.file ? `/uploads/${req.file.filename}` : null;
        const result = await pool.query(`INSERT INTO documents(name, category, related_to, number, issue_date, expiry_date, status, responsible, vehicle_id, driver_id, notes, file_url)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`, [name, category, related_to, number, issue_date || new Date(), expiry_date || new Date(), status, responsible, realVehicleId, realDriverId, notes, file_url]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/documents/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT d.*, v.plate as vehicle_plate, dr.name as driver_name
      FROM documents d
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      WHERE d.id = $1
    `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching document by id:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PUT /api/documents/:id
router.put('/:id', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, related_to, number, issue_date, expiry_date, status, responsible, vehicle_id, driver_id, notes } = req.body;
        let realVehicleId = null;
        let realDriverId = null;
        if (vehicle_id && vehicle_id !== 'undefined' && vehicle_id !== 'null') {
            realVehicleId = vehicle_id;
        }
        if (driver_id && driver_id !== 'undefined' && driver_id !== 'null') {
            realDriverId = driver_id;
        }
        // Check existing document
        const docCheck = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
        if (docCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const existingDoc = docCheck.rows[0];
        const file_url = req.file ? `/uploads/${req.file.filename}` : existingDoc.file_url;
        const result = await pool.query(`UPDATE documents 
       SET name=$1, category=$2, related_to=$3, number=$4, issue_date=$5, expiry_date=$6, 
           status=$7, responsible=$8, vehicle_id=$9, driver_id=$10, notes=$11, file_url=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`, [
            name || existingDoc.name, category || existingDoc.category, related_to || existingDoc.related_to,
            number !== undefined ? number : existingDoc.number, issue_date || existingDoc.issue_date,
            expiry_date || existingDoc.expiry_date, status || existingDoc.status, responsible || existingDoc.responsible,
            realVehicleId, realDriverId, notes !== undefined ? notes : existingDoc.notes, file_url, id
        ]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Optional: get file_url to delete from disk if needed
        // const docCheck = await pool.query('SELECT file_url FROM documents WHERE id = $1', [id]);
        const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json({ message: 'Document deleted successfully', document: result.rows[0] });
    }
    catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
