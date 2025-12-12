const { PGlite } = require("@electric-sql/pglite")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const dataDir = path.join(__dirname, "../data/pg_data")

async function runMigration() {
    console.log(`🔄 Connecting to PGlite at ${dataDir}...`)
    const db = new PGlite(dataDir);

    try {
        console.log("🔄 Running migration 002...")

        const migrationPath = path.join(__dirname, "../database/migrations/002_alter_odometer_decimal.sql")
        const migration = fs.readFileSync(migrationPath, "utf8")

        await db.exec(migration)

        console.log("✅ Migration 002 completed successfully!")
    } catch (error) {
        console.error("❌ Migration error:", error)
        throw error
    } finally {
        await db.close()
    }
}

runMigration().catch(console.error)
