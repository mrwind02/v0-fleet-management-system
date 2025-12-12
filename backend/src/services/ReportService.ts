import { query } from "../config/database"

export class ReportService {
  async getMaintenanceHistory(vehicleId?: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    let sql = "SELECT * FROM maintenance_records WHERE 1=1"
    const params: any[] = []
    let paramCount = 1

    if (vehicleId) {
      sql += ` AND vehicle_id = $${paramCount}`
      params.push(vehicleId)
      paramCount++
    }

    if (startDate) {
      sql += ` AND maintenance_date >= $${paramCount}`
      params.push(startDate)
      paramCount++
    }

    if (endDate) {
      sql += ` AND maintenance_date <= $${paramCount}`
      params.push(endDate)
      paramCount++
    }

    sql += " ORDER BY maintenance_date DESC"

    const result = await query(sql, params)
    return result.rows
  }

  async getQuestionnaireReport(startDate: Date, endDate: Date): Promise<any[]> {
    const result = await query(
      `SELECT dq.*, d.name as driver_name, v.plate as vehicle_plate 
       FROM driver_questionnaire dq
       LEFT JOIN drivers d ON dq.driver_id = d.id
       LEFT JOIN vehicles v ON dq.vehicle_id = v.id
       WHERE dq.timestamp_response >= $1 AND dq.timestamp_response <= $2
       ORDER BY dq.timestamp_response DESC`,
      [startDate, endDate],
    )

    return result.rows
  }

  async getDashboardMetrics() {
    const activeVehicles = await query("SELECT COUNT(*) FROM vehicles WHERE is_active = true")
    const activeDrivers = await query("SELECT COUNT(*) FROM drivers WHERE is_active = true")
    const maintenancesToday = await query(
      "SELECT COUNT(*) FROM maintenance_records WHERE maintenance_date = CURRENT_DATE",
    )
    // Note: Use the new PGlite compatible table names if changed, but schema used 'maintenance_records' etc.
    // The previous code had "maintenance" and "users" which might be wrong looking at seed.js.
    // Seed.js uses 'maintenance_records', 'drivers', 'users', 'vehicles'.
    // Wait, the original code I replaced had:
    // vehicles, users (for drivers?), maintenace (wrong table name?)
    // Let's check schema/seed again to be sure of table names.
    // Schema: maintenance_records.
    // Schema: drivers.
    // Schema: vehicles.

    // Original code:
    // SELECT COUNT(*) FROM vehicles WHERE status = 'active' (Schema says 'is_active')
    // SELECT COUNT(*) FROM users WHERE role = 'driver' (Schema has drivers table linked to users)

    // I should rewrite this to match the actual schema I seeded.
    // Schema: vehicles(is_active), drivers(is_active)

    const totalKm = await query("SELECT SUM(odometer_reading) FROM maintenance_records") // Just an estimation or sum from vehicles?
    // Schema vehicles doesn't have odometer. maintenance_records has odometer_reading.

    return {
      activeVehicles: Number.parseInt((activeVehicles.rows[0] as any).count),
      activeDrivers: Number.parseInt((activeDrivers.rows[0] as any).count),
      maintenancesToday: Number.parseInt((maintenancesToday.rows[0] as any).count),
      totalKilometers: Number.parseInt((totalKm.rows[0] as any).sum) || 0,
    }
  }

  async getRecentMaintenance(limit = 5) {
    const result = await query(
      `SELECT id, maintenance_date, establishment_name, maintenance_type, cost 
       FROM maintenance_records 
       ORDER BY maintenance_date DESC 
       LIMIT $1`,
      [limit],
    )
    return result.rows
  }

  generateCSV(data: any[], headers: string[]): string {
    let csv = headers.join(",") + "\n"

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header] || ""
        const escaped = String(value).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csv += values.join(",") + "\n"
    })

    return csv
  }

  async exportMaintenanceCSV(vehicleId?: string, startDate?: Date, endDate?: Date): Promise<string> {
    const data = await this.getMaintenanceHistory(vehicleId, startDate, endDate)
    const headers = [
      "id",
      "vehicle_id",
      "maintenance_date",
      "maintenance_type",
      "mechanic_name",
      "establishment_name",
      "service_description",
      "cost",
      "odometer_reading",
    ]

    return this.generateCSV(data, headers)
  }

  async exportQuestionnaireCSV(startDate: Date, endDate: Date): Promise<string> {
    const data = await this.getQuestionnaireReport(startDate, endDate)
    const headers = ["driver_name", "vehicle_plate", "status", "gps_latitude", "gps_longitude", "timestamp_response"]

    return this.generateCSV(data, headers)
  }
}
