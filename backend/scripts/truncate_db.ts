import { query } from "../src/config/database"

async function truncateDb() {
  try {
    console.log("Truncating all operational tables...")
    await query(`
      TRUNCATE TABLE 
        fines, 
        documents, 
        maintenance_records, 
        fuel_records,
        vehicle_driver_assignment, 
        drivers, 
        vehicles 
      RESTART IDENTITY CASCADE;
    `)
    console.log("Database truncated successfully!")
  } catch (error) {
    console.error("Error truncating DB:", error)
  }
}

truncateDb()
