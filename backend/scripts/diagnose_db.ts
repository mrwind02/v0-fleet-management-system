
import { PGlite } from "@electric-sql/pglite"
import path from "path"

const dataDir = path.join(__dirname, "../data/pg_data");
console.log(`DIAGNOSTIC: Connecting to ${dataDir}`);
const db = new PGlite(dataDir);

async function run() {
    try {
        const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        console.log("TABLES:", tables.rows.map((r: any) => r.table_name));

        const settings = await db.query("SELECT * FROM system_settings");
        console.log("SETTINGS:", settings.rows);

        const users = await db.query("SELECT id, email, role FROM users");
        console.log("USERS:", users.rows.length);
    } catch (err) {
        console.error("ERROR:", err);
    }
}
run();
