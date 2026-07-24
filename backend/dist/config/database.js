"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.getClient = getClient;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Use DATABASE_URL from environment, fallback to localhost for development
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/fleet_db";
console.log(`Connecting to PostgreSQL database...`);
// Create connection pool
const pool = new pg_1.Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased to 10 seconds for Neon
});
// Test connection on startup
pool.on('connect', () => {
    console.log('PostgreSQL client connected');
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
});
(async () => {
    try {
        await pool.query("SET TIME ZONE 'UTC'");
        console.log("Database timezone set to UTC");
    }
    catch (err) {
        console.error("Failed to set database timezone", err);
    }
})();
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        // console.log("Executed query", { text, duration, rows: res.rows.length })
        return res;
    }
    catch (error) {
        console.error("Database query error", { text, error });
        throw error;
    }
}
async function getClient() {
    return await pool.connect();
}
exports.default = pool;
