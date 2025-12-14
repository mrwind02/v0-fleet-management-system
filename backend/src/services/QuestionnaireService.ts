import { query } from "../config/database"
import type { DriverQuestionnaire } from "../types"

export class QuestionnaireService {
  async recordResponse(
    driverId: string,
    vehicleId: string | null,
    status: "driving" | "stopped",
    gpsLatitude?: number,
    gpsLongitude?: number,
    timestampResponse: Date = new Date(),
  ): Promise<DriverQuestionnaire> {
    const result = await query(
      `INSERT INTO driver_questionnaire (driver_id, vehicle_id, status, gps_latitude, gps_longitude, timestamp_response)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [driverId, vehicleId, status, gpsLatitude, gpsLongitude, timestampResponse],
    )

    return this.mapToQuestionnaire(result.rows[0])
  }

  async getByDriver(driverId: string, limit = 100): Promise<DriverQuestionnaire[]> {
    const result = await query(
      `SELECT id, driver_id, vehicle_id, status, gps_latitude, gps_longitude, 
       to_char(timestamp_response at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as timestamp_iso,
       created_at 
       FROM driver_questionnaire 
       WHERE driver_id = $1 
       ORDER BY timestamp_response DESC LIMIT $2`,
      [driverId, limit],
    )

    return result.rows.map((row) => this.mapToQuestionnaire(row))
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<DriverQuestionnaire[]> {
    const result = await query(
      `SELECT id, driver_id, vehicle_id, status, gps_latitude, gps_longitude, 
       to_char(timestamp_response at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as timestamp_iso,
       created_at
       FROM driver_questionnaire 
       WHERE timestamp_response >= $1 AND timestamp_response <= $2
       ORDER BY timestamp_response DESC`,
      [startDate, endDate],
    )

    return result.rows.map((row) => this.mapToQuestionnaire(row))
  }

  async getLatestByDriver(driverId: string): Promise<DriverQuestionnaire | null> {
    const result = await query(
      `SELECT id, driver_id, vehicle_id, status, gps_latitude, gps_longitude, 
       to_char(timestamp_response at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as timestamp_iso,
       created_at 
       FROM driver_questionnaire 
       WHERE driver_id = $1 
       ORDER BY timestamp_response DESC LIMIT 1`,
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
      gpsLatitude: row.gps_latitude ? Number(row.gps_latitude) : undefined,
      gpsLongitude: row.gps_longitude ? Number(row.gps_longitude) : undefined,
      timestampResponse: row.timestamp_iso ? new Date(row.timestamp_iso) : row.timestamp_response,
      createdAt: row.created_at,
    }
  }
}
