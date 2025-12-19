import * as dotenv from "dotenv"
dotenv.config({ path: require("path").join(__dirname, "../.env") })

import { query } from "../src/config/database"
import * as fs from "node:fs"
import * as path from "node:path"

async function runMigration() {
    try {
        console.log("🚀 Running fuel_records migration...")

        const migrationPath = path.join(__dirname, "../migrations/004_create_fuel_records.sql")
        const sql = fs.readFileSync(migrationPath, "utf-8")

        await query(sql)

        console.log("✅ Migration completed successfully!")
        process.exit(0)
    } catch (error) {
        console.error("❌ Migration failed:", error)
        process.exit(1)
    }
}

runMigration()
