const { PGlite } = require("@electric-sql/pglite")
const path = require("path")
require("dotenv").config()

const dataDir = path.join(__dirname, "../data/pg_data")

async function debug() {
    console.log(`Connecting to PGlite at ${dataDir}...`)
    const db = new PGlite(dataDir);

    try {
        const res = await db.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';
    `);
        console.log("Existing tables:", res.rows);
    } catch (error) {
        console.error("Debug error:", error)
    } finally {
        await db.close()
    }
}

debug().catch(console.error)
