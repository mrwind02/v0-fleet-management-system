"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.getClient = getClient;
const pglite_1 = require("@electric-sql/pglite");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Create data directory path relative to project root
const dataDir = path_1.default.join(process.cwd(), "./data/pg_data");
console.log(`Initializing PGlite database at: ${dataDir}`);
// Initialize PGlite instance
const db = new pglite_1.PGlite(dataDir);
async function query(text, params) {
    const start = Date.now();
    try {
        // PGlite query returns { rows: [], fields: [], ... }
        const res = await db.query(text, params);
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
    // PGlite doesn't have a pool/connect model in the same way, 
    // currently we just return the db instance or a mock client if strictly needed.
    // For most simple usages, accessing db directly is fine.
    return db;
}
exports.default = db;
