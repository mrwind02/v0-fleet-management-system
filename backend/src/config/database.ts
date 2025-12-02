import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const pool = new pg.Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "fleet_management",
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
})

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Database query error", { text, error })
    throw error
  }
}

export async function getClient() {
  return pool.connect()
}

export default pool
