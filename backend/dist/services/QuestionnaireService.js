"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionnaireService = void 0;
const database_1 = require("../config/database");
class QuestionnaireService {
    async recordResponse(driverId, vehicleId, status, gpsLatitude, gpsLongitude) {
        const result = await (0, database_1.query)(`INSERT INTO driver_questionnaire (driver_id, vehicle_id, status, gps_latitude, gps_longitude)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [driverId, vehicleId, status, gpsLatitude, gpsLongitude]);
        return this.mapToQuestionnaire(result.rows[0]);
    }
    async getByDriver(driverId, limit = 100) {
        const result = await (0, database_1.query)("SELECT * FROM driver_questionnaire WHERE driver_id = $1 ORDER BY timestamp_response DESC LIMIT $2", [driverId, limit]);
        return result.rows.map((row) => this.mapToQuestionnaire(row));
    }
    async getByDateRange(startDate, endDate) {
        const result = await (0, database_1.query)(`SELECT * FROM driver_questionnaire 
       WHERE timestamp_response >= $1 AND timestamp_response <= $2
       ORDER BY timestamp_response DESC`, [startDate, endDate]);
        return result.rows.map((row) => this.mapToQuestionnaire(row));
    }
    async getLatestByDriver(driverId) {
        const result = await (0, database_1.query)("SELECT * FROM driver_questionnaire WHERE driver_id = $1 ORDER BY timestamp_response DESC LIMIT 1", [driverId]);
        return result.rows.length > 0 ? this.mapToQuestionnaire(result.rows[0]) : null;
    }
    mapToQuestionnaire(row) {
        return {
            id: row.id,
            driverId: row.driver_id,
            vehicleId: row.vehicle_id,
            status: row.status,
            gpsLatitude: row.gps_latitude,
            gpsLongitude: row.gps_longitude,
            timestampResponse: row.timestamp_response,
            createdAt: row.created_at,
        };
    }
}
exports.QuestionnaireService = QuestionnaireService;
