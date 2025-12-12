const { PGlite } = require("@electric-sql/pglite")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const dataDir = path.join(__dirname, "../data/pg_data")

async function runMigrations() {
  console.log(`🔄 Connecting to PGlite at ${dataDir}...`)
  const db = new PGlite(dataDir);

  try {
    console.log("🔄 Running migrations...")

    // Read and execute migration file
    const migrationPath = path.join(__dirname, "../database/migrations/001_initial_schema.sql")
    const migration = fs.readFileSync(migrationPath, "utf8")

    // Support multiple statements if the driver allows, or split them?
    // PGlite .exec() handles multiple statements. .query() might not.
    // Let's us .exec() for migration scripts which are usually multi-statement.
    await db.exec(migration)

    console.log("✅ Migrations completed successfully!")
  } catch (error) {
    console.error("❌ Migration error:", error)
    throw error
  } finally {
    await db.close()
  }
}

runMigrations().catch(console.error)

