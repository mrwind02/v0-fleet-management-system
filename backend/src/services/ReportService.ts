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

  async getDashboardMetrics(): Promise<any> {
    const vehicleCount = await query("SELECT COUNT(*) as count FROM vehicles WHERE is_active = true")

    const driverCount = await query("SELECT COUNT(*) as count FROM drivers WHERE is_active = true")

    const maintenanceToday = await query(
      `SELECT COUNT(*) as count FROM maintenance_records 
       WHERE maintenance_date = CURRENT_DATE`,
    )

    const totalKm = await query(`SELECT SUM(odometer_reading) as total FROM maintenance_records`)

    return {
      activeVehicles: vehicleCount.rows[0].count,
      activeDrivers: driverCount.rows[0].count,
      maintenancesToday: maintenanceToday.rows[0].count,
      totalKilometers: totalKm.rows[0].total || 0,
    }
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
