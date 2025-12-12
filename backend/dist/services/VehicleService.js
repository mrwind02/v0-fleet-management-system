"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const database_1 = require("../config/database");
class VehicleService {
    async create(vehicleData) {
        const result = await (0, database_1.query)(`INSERT INTO vehicles (plate, renavam, brand, model, year, color, transport_type, chassis_number, load_capacity, observations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`, [
            vehicleData.plate,
            vehicleData.renavam,
            vehicleData.brand,
            vehicleData.model,
            vehicleData.year,
            vehicleData.color,
            vehicleData.transportType || "Rodoviário",
            vehicleData.chassisNumber,
            vehicleData.loadCapacity,
            vehicleData.observations,
        ]);
        return this.mapToVehicle(result.rows[0]);
    }
    async getAll(isActive) {
        let sql = `
      SELECT v.*, d.name as driver_name, d.id as driver_id
      FROM vehicles v
      LEFT JOIN vehicle_driver_assignment vda ON v.id = vda.vehicle_id AND vda.is_current = true
      LEFT JOIN drivers d ON vda.driver_id = d.id
    `;
        const params = [];
        if (isActive !== undefined) {
            sql += " WHERE v.is_active = $1";
            params.push(isActive);
        }
        sql += " ORDER BY v.created_at DESC";
        const result = await (0, database_1.query)(sql, params);
        return result.rows.map((row) => this.mapToVehicle(row));
    }
    async getById(id) {
        const result = await (0, database_1.query)("SELECT * FROM vehicles WHERE id = $1", [id]);
        return result.rows.length > 0 ? this.mapToVehicle(result.rows[0]) : null;
    }
    async getByPlate(plate) {
        const result = await (0, database_1.query)("SELECT * FROM vehicles WHERE plate = $1", [plate]);
        return result.rows.length > 0 ? this.mapToVehicle(result.rows[0]) : null;
    }
    async update(id, vehicleData) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        Object.entries(vehicleData).forEach(([key, value]) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            if (snakeKey !== "id" && snakeKey !== "created_at") {
                updates.push(`${snakeKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        if (updates.length === 1)
            throw new Error("No fields to update");
        const result = await (0, database_1.query)(`UPDATE vehicles SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`, values);
        if (result.rows.length === 0)
            throw new Error("Vehicle not found");
        return this.mapToVehicle(result.rows[0]);
    }
    async delete(id) {
        await (0, database_1.query)("UPDATE vehicles SET is_active = false WHERE id = $1", [id]);
    }
    mapToVehicle(row) {
        return {
            id: row.id,
            plate: row.plate,
            renavam: row.renavam,
            brand: row.brand,
            model: row.model,
            year: row.year,
            color: row.color,
            transportType: row.transport_type,
            chassisNumber: row.chassis_number,
            loadCapacity: row.load_capacity,
            observations: row.observations,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            driverName: row.driver_name,
            driverId: row.driver_id,
        };
    }
}
exports.VehicleService = VehicleService;
