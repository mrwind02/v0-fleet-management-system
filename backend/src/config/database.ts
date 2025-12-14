import { PGlite } from "@electric-sql/pglite"
import dotenv from "dotenv"
import path from "path"

dotenv.config()

// Create data directory path relative to project root
// Create data directory path relative to project root (from src/config/database.ts -> ../../data/pg_data)
const dataDir = path.join(__dirname, "../../data/pg_data");

console.log(`Initializing PGlite database at: ${dataDir}`);

// Initialize PGlite instance
const db = new PGlite(dataDir);

// Perform initialization queries
(async () => {
  try {
    await db.query("SET TIME ZONE 'UTC';");
    console.log("Database timezone set to UTC");
  } catch (err) {
    console.error("Failed to set database timezone", err);
  }
})();


export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    // PGlite query returns { rows: [], fields: [], ... }
    const res = await db.query(text, params)
    const duration = Date.now() - start
    // console.log("Executed query", { text, duration, rows: res.rows.length })
    return res
  } catch (error) {
    console.error("Database query error", { text, error })
    throw error
  }
}

export async function getClient() {
  // PGlite doesn't have a pool/connect model in the same way, 
  // currently we just return the db instance or a mock client if strictly needed.
  // For most simple usages, accessing db directly is fine.
  return db;
}

export default db

