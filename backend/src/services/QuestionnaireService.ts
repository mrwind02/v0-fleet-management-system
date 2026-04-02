import { query } from "../config/database"
import type { DriverQuestionnaire } from "../types"

export class QuestionnaireService {
  async recordResponse(
    driverId: string,
    vehicleId: string | null,
    status: "driving" | "stopped",
    gpsLatitude?: number,
    gpsLongitude?: number,
  ): Promise<DriverQuestionnaire> {
    const result = await query(
      `INSERT INTO driver_questionnaire (driver_id, vehicle_id, status, gps_latitude, gps_longitude)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [driverId, vehicleId, status, gpsLatitude, gpsLongitude],
    )

    return this.mapToQuestionnaire(result.rows[0])
  }

  async getByDriver(driverId: string, limit = 100): Promise<DriverQuestionnaire[]> {
    const result = await query(
      "SELECT * FROM driver_questionnaire WHERE driver_id = $1 ORDER BY timestamp_response DESC LIMIT $2",
      [driverId, limit],
    )

    return result.rows.map((row) => this.mapToQuestionnaire(row))
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<DriverQuestionnaire[]> {
    const result = await query(
      `SELECT * FROM driver_questionnaire 
       WHERE timestamp_response >= $1 AND timestamp_response <= $2
       ORDER BY timestamp_response DESC`,
      [startDate, endDate],
    )

    return result.rows.map((row) => this.mapToQuestionnaire(row))
  }

  async getLatestByDriver(driverId: string): Promise<DriverQuestionnaire | null> {
    const result = await query(
      "SELECT * FROM driver_questionnaire WHERE driver_id = $1 ORDER BY timestamp_response DESC LIMIT 1",
      [driverId],
    )

    return result.rows.length > 0 ? this.mapToQuestionnaire(result.rows[0]) : null
  }

  private mapToQuestionnaire(row: any): DriverQuestionnaire {
    return {
      id: row.id,
      driverId: row.driver_id,
      vehicleId: row.vehicle_id,
      status: row.status,
      gpsLatitude: row.gps_latitude,
      gpsLongitude: row.gps_longitude,
      timestampResponse: row.timestamp_response,
      createdAt: row.created_at,
    }
  }
}
