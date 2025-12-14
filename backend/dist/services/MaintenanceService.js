"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceService = void 0;
const database_1 = require("../config/database");
class MaintenanceService {
    async create(maintenanceData) {
        const result = await (0, database_1.query)(`INSERT INTO maintenance_records (vehicle_id, maintenance_date, maintenance_type, mechanic_name, establishment_name, service_description, cost, odometer_reading, attachments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`, [
            maintenanceData.vehicleId,
            maintenanceData.maintenanceDate,
            maintenanceData.maintenanceType,
            maintenanceData.mechanicName,
            maintenanceData.establishmentName,
            maintenanceData.serviceDescription,
            maintenanceData.cost,
            maintenanceData.odometerReading,
            JSON.stringify(maintenanceData.attachments || []),
        ]);
        return this.mapToMaintenance(result.rows[0]);
    }
    async getByVehicle(vehicleId, startDate, endDate, maintenanceType) {
        let sql = "SELECT * FROM maintenance_records WHERE vehicle_id = $1";
        const params = [vehicleId];
        let paramCount = 2;
        if (startDate) {
            sql += ` AND maintenance_date >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            sql += ` AND maintenance_date <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }
        if (maintenanceType) {
            sql += ` AND maintenance_type = $${paramCount}`;
            params.push(maintenanceType);
            paramCount++;
        }
        sql += " ORDER BY maintenance_date DESC";
        const result = await (0, database_1.query)(sql, params);
        return result.rows.map((row) => this.mapToMaintenance(row));
    }
    async getAll(filters) {
        let sql = "SELECT * FROM maintenance_records WHERE 1=1";
        const params = [];
        let paramCount = 1;
        if (filters?.vehicleId) {
            sql += ` AND vehicle_id = $${paramCount}`;
            params.push(filters.vehicleId);
            paramCount++;
        }
        if (filters?.maintenanceType) {
            sql += ` AND maintenance_type = $${paramCount}`;
            params.push(filters.maintenanceType);
            paramCount++;
        }
        if (filters?.startDate) {
            sql += ` AND maintenance_date >= $${paramCount}`;
            params.push(filters.startDate);
            paramCount++;
        }
        if (filters?.endDate) {
            sql += ` AND maintenance_date <= $${paramCount}`;
            params.push(filters.endDate);
            paramCount++;
        }
        sql += " ORDER BY maintenance_date DESC";
        const result = await (0, database_1.query)(sql, params);
        return result.rows.map((row) => this.mapToMaintenance(row));
    }
    async getById(id) {
        const result = await (0, database_1.query)("SELECT * FROM maintenance_records WHERE id = $1", [id]);
        return result.rows.length > 0 ? this.mapToMaintenance(result.rows[0]) : null;
    }
    async update(id, maintenanceData) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        Object.entries(maintenanceData).forEach(([key, value]) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            if (!["id", "created_at"].includes(snakeKey)) {
                updates.push(`${snakeKey} = $${paramCount}`);
                values.push(key === "attachments" ? JSON.stringify(value) : value);
                paramCount++;
            }
        });
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const result = await (0, database_1.query)(`UPDATE maintenance_records SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`, values);
        if (result.rows.length === 0)
            throw new Error("Maintenance record not found");
        return this.mapToMaintenance(result.rows[0]);
    }
    mapToMaintenance(row) {
        return {
            id: row.id,
            vehicleId: row.vehicle_id,
            maintenanceDate: row.maintenance_date,
            maintenanceType: row.maintenance_type,
            mechanicName: row.mechanic_name,
            establishmentName: row.establishment_name,
            serviceDescription: row.service_description,
            cost: row.cost,
            odometerReading: row.odometer_reading,
            attachments: typeof row.attachments === "string" ? JSON.parse(row.attachments) : row.attachments || [],
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
exports.MaintenanceService = MaintenanceService;
