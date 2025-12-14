
import { PGlite } from "@electric-sql/pglite"
import path from "path"

const dataDir = path.join(__dirname, "../data/pg_data");
console.log(`FORCE MIGRATE: Connecting to ${dataDir}`);
const db = new PGlite(dataDir);

async function run() {
    try {
        console.log("Creating system_settings table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key VARCHAR(50) PRIMARY KEY,
                value TEXT NOT NULL,
                description TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table created or already exists.");

        console.log("Inserting default value...");
        await db.query(`
            INSERT INTO system_settings (key, value, description) 
            VALUES ('allow_admin_register', 'true', 'Permite o registro público de contas de administrador')
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        `);
        console.log("Default value inserted.");

        const res = await db.query("SELECT * FROM system_settings");
        console.log("VERIFICATION:", res.rows);
    } catch (err) {
        console.error("ERROR:", err);
    }
}
run();
