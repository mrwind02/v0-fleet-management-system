const pg = require("pg")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const pool = new pg.Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "fleet_management",
})

async function runMigrations() {
  const client = await pool.connect()

  try {
    console.log("🔄 Running migrations...")

    // Read and execute migration file
    const migrationPath = path.join(__dirname, "../database/migrations/001_initial_schema.sql")
    const migration = fs.readFileSync(migrationPath, "utf8")

    await client.query(migration)

    console.log("✅ Migrations completed successfully!")
  } catch (error) {
    console.error("❌ Migration error:", error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations().catch(console.error)
