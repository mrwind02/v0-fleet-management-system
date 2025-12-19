import { Pool } from "pg"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    console.error("ERROR: DATABASE_URL environment variable is required")
    process.exit(1)
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function runMigrations() {
    console.log("🚀 Starting PostgreSQL migrations...")

    try {
        // Read and run migration files in order
        const migrationDirs = [
            path.join(__dirname, "../database/migrations"),
            path.join(__dirname, "../migrations")
        ]

        let migrationFiles: { name: string, path: string }[] = []

        for (const dir of migrationDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'))
                files.forEach(f => migrationFiles.push({ name: f, path: path.join(dir, f) }))
            }
        }

        // Sort files by name (e.g. 001, 002, ...)
        migrationFiles.sort((a, b) => a.name.localeCompare(b.name))

        for (const migration of migrationFiles) {
            console.log(`\n📄 Running migration: ${migration.name}`)
            const sql = fs.readFileSync(migration.path, "utf-8")

            try {
                await pool.query(sql)
                console.log(`✅ ${migration.name} completed successfully`)
            } catch (error: any) {
                // Ignore "already exists" errors
                if (error.code === '42P07' || error.message.includes('already exists')) {
                    console.log(`ℹ️  ${migration.name} - Tables already exist, skipping`)
                } else {
                    throw error
                }
            }
        }

        // Verify tables were created
        console.log("\n🔍 Verifying database schema...")
        const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

        console.log("\n📊 Tables in database:")
        result.rows.forEach(row => console.log(`  - ${row.table_name}`))

        // Check if admin user exists
        const userCheck = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        const adminCount = parseInt(userCheck.rows[0].count)

        if (adminCount === 0) {
            console.log("\n👤 Creating default admin user...")
            const bcrypt = require("bcryptjs")
            const hashedPassword = await bcrypt.hash("admin123", 10)

            await pool.query(`
        INSERT INTO users (email, password_hash, name, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, ["admin@fleet.com", hashedPassword, "Administrator", "admin", true])

            console.log("✅ Admin user created: admin@fleet.com / admin123")
        } else {
            console.log(`\nℹ️  Found ${adminCount} admin user(s) - skipping creation`)
        }

        console.log("\n🎉 Migration completed successfully!")

    } catch (error) {
        console.error("\n❌ Migration failed:", error)
        throw error
    } finally {
        await pool.end()
    }
}

runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
