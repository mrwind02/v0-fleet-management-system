"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
const database_1 = require("../config/database");
class DriverService {
    async create(driverData) {
        const result = await (0, database_1.query)(`INSERT INTO drivers (user_id, name, cnh_number, cnh_category, cnh_expiry_date, phone, email, special_load_certified, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`, [
            driverData.userId,
            driverData.name,
            driverData.cnhNumber,
            driverData.cnhCategory,
            driverData.cnhExpiryDate,
            driverData.phone,
            driverData.email,
            driverData.specialLoadCertified || false,
            driverData.photoUrl,
        ]);
        return this.mapToDriver(result.rows[0]);
    }
    async getAll(isActive) {
        let sql = "SELECT * FROM drivers";
        const params = [];
        if (isActive !== undefined) {
            sql += " WHERE is_active = $1";
            params.push(isActive);
        }
        sql += " ORDER BY created_at DESC";
        const result = await (0, database_1.query)(sql, params);
        return result.rows.map((row) => this.mapToDriver(row));
    }
    async getById(id) {
        const result = await (0, database_1.query)("SELECT * FROM drivers WHERE id = $1", [id]);
        return result.rows.length > 0 ? this.mapToDriver(result.rows[0]) : null;
    }
    async getByCNH(cnhNumber) {
        const result = await (0, database_1.query)("SELECT * FROM drivers WHERE cnh_number = $1", [cnhNumber]);
        return result.rows.length > 0 ? this.mapToDriver(result.rows[0]) : null;
    }
    async update(id, driverData) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        Object.entries(driverData).forEach(([key, value]) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            if (!["id", "created_at", "user_id", "updated_at"].includes(snakeKey)) {
                updates.push(`${snakeKey} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        if (updates.length === 1)
            throw new Error("No fields to update");
        const result = await (0, database_1.query)(`UPDATE drivers SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`, values);
        if (result.rows.length === 0)
            throw new Error("Driver not found");
        return this.mapToDriver(result.rows[0]);
    }
    async assignToVehicle(driverId, vehicleId, notes) {
        // Desassociar motorista anterior
        await (0, database_1.query)("UPDATE vehicle_driver_assignment SET is_current = false, unassigned_at = CURRENT_TIMESTAMP WHERE vehicle_id = $1 AND is_current = true", [vehicleId]);
        // Criar nova associação
        const result = await (0, database_1.query)(`INSERT INTO vehicle_driver_assignment (vehicle_id, driver_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`, [vehicleId, driverId, notes]);
        return result.rows[0];
    }
    async getCurrentVehicle(driverId) {
        const result = await (0, database_1.query)(`SELECT v.* FROM vehicles v
       JOIN vehicle_driver_assignment vda ON v.id = vda.vehicle_id
       WHERE vda.driver_id = $1 AND vda.is_current = true`, [driverId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
    async delete(id) {
        await (0, database_1.query)("UPDATE drivers SET is_active = false WHERE id = $1", [id]);
    }
    mapToDriver(row) {
        return {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            cnhNumber: row.cnh_number,
            cnhCategory: row.cnh_category,
            cnhExpiryDate: row.cnh_expiry_date,
            phone: row.phone,
            email: row.email,
            specialLoadCertified: row.special_load_certified,
            photoUrl: row.photo_url,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
exports.DriverService = DriverService;
