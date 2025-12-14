import { PGlite } from "@electric-sql/pglite"
import path from "path"
import fs from "fs"

const dataDir = path.join(__dirname, "../data/pg_data");
const db = new PGlite(dataDir);

async function run() {
    console.log("Running migration 003...");
    const sql = fs.readFileSync(path.join(__dirname, "../database/migrations/003_create_settings.sql"), "utf-8");
    try {
        await db.query(sql);
        console.log("Migration 003 applied successfully.");
    } catch (e: any) {
        if (e.message.includes("already exists")) {
            console.log("Table system_settings already exists.");
        } else {
            console.error(e);
        }
    }
}

run();
