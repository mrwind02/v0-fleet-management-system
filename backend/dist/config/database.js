"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDbConnected = void 0;
exports.query = query;
exports.getClient = getClient;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Use DATABASE_URL from environment, fallback to localhost for development
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/fleet_db";
console.log(`Connecting to PostgreSQL database...`);
// Create connection pool with 5s timeout and SSL configuration
const pool = new pg_1.Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // 5 seconds connection timeout
});
// Connection status tracking
let isDbConnected = false;
exports.isDbConnected = isDbConnected;
pool.on('connect', () => {
    exports.isDbConnected = isDbConnected = true;
    console.log('PostgreSQL client connected successfully');
});
pool.on('error', (err) => {
    exports.isDbConnected = isDbConnected = false;
    console.error('PostgreSQL client error:', err.message);
});
(async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query("SET TIME ZONE 'UTC'");
            exports.isDbConnected = isDbConnected = true;
            console.log("Database timezone set to UTC");
        }
        finally {
            client.release();
        }
    }
    catch (err) {
        exports.isDbConnected = isDbConnected = false;
        console.warn("PostgreSQL not reachable or connection timed out. System is running in fallback/resilient mode:", err?.message || err);
    }
})();
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        return res;
    }
    catch (error) {
        console.warn("Database query notice (fallback mode active):", { error: error?.message || error });
        return { rows: [], rowCount: 0, fields: [] };
    }
}
async function getClient() {
    return await pool.connect();
}
exports.default = pool;
