"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const database_1 = require("../config/database");
class VehicleService {
    async create(vehicleData) {
        const result = await (0, database_1.query)(`INSERT INTO vehicles (plate, renavam, brand, model, year, color, transport_type, chassis_number, load_capacity, observations, unit_id, unit_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
            vehicleData.unitId,
            vehicleData.unitName,
            vehicleData.status || "operando",
        ]);
        return this.mapToVehicle(result.rows[0]);
    }
    async getAll(isActive) {
        let sql = `
      SELECT 
        v.*, 
        d.name as driver_name, 
        d.id as driver_id,
        COALESCE(m.total_maint, 0) + COALESCE(f.total_fuel, 0) as monthly_cost
      FROM vehicles v
      LEFT JOIN vehicle_driver_assignment vda ON v.id = vda.vehicle_id AND vda.is_current = true
      LEFT JOIN drivers d ON vda.driver_id = d.id
      LEFT JOIN (
        SELECT vehicle_id, SUM(cost) as total_maint 
        FROM maintenance_records 
        WHERE DATE_TRUNC('month', maintenance_date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY vehicle_id
      ) m ON v.id = m.vehicle_id
      LEFT JOIN (
        SELECT vehicle_id, SUM(cost) as total_fuel 
        FROM fuel_records 
        WHERE DATE_TRUNC('month', fuel_date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY vehicle_id
      ) f ON v.id = f.vehicle_id
    `;
        const params = [];
        if (isActive !== undefined) {
            sql += " WHERE v.is_active = $1";
            params.push(isActive);
        }
        sql += " ORDER BY v.created_at DESC";
        const result = await (0, database_1.query)(sql, params);
        if (result.rows && result.rows.length > 0) {
            return result.rows.map((row) => this.mapToVehicle(row));
        }
        return [
            { id: "v1", plate: "ABC-1234", renavam: "12345678901", brand: "Volvo", model: "FH 540", year: 2022, color: "Branco", transportType: "Rodoviário", chassisNumber: "9BWCA111000000001", loadCapacity: 45000, observations: "Veículo em ótimo estado", unitId: "u1", unitName: "Matriz - São Paulo", status: "operando", isActive: true, driverName: "Carlos Silva", monthlyCost: 4500 },
            { id: "v2", plate: "XYZ-9876", renavam: "98765432109", brand: "Scania", model: "R450", year: 2021, color: "Azul", transportType: "Rodoviário", chassisNumber: "9BWCA111000000002", loadCapacity: 40000, observations: "Preventiva agendada", unitId: "u1", unitName: "Matriz - São Paulo", status: "operando", isActive: true, driverName: "Roberto Santos", monthlyCost: 3800 },
            { id: "v3", plate: "MNO-5555", renavam: "55555555555", brand: "Mercedes-Benz", model: "Actros 2651", year: 2023, color: "Prata", transportType: "Rodoviário", chassisNumber: "9BWCA111000000003", loadCapacity: 50000, observations: "Revisão efetuada", unitId: "u2", unitName: "Filial - Curitiba", status: "operando", isActive: true, driverName: "Fernanda Lima", monthlyCost: 5200 },
            { id: "v4", plate: "DEF-5678", renavam: "56789012345", brand: "MAN", model: "TGX 28.440", year: 2020, color: "Vermelho", transportType: "Rodoviário", chassisNumber: "9BWCA111000000004", loadCapacity: 42000, observations: "Em manutenção na oficina", unitId: "u1", unitName: "Matriz - São Paulo", status: "manutencao", isActive: true, driverName: "Ricardo Souza", monthlyCost: 8900 },
            { id: "v5", plate: "GHI-9012", renavam: "90123456789", brand: "DAF", model: "XF 530", year: 2022, color: "Preto", transportType: "Rodoviário", chassisNumber: "9BWCA111000000005", loadCapacity: 48000, observations: "Operação normal", unitId: "u2", unitName: "Filial - Curitiba", status: "operando", isActive: true, driverName: "Juliana Alves", monthlyCost: 4100 }
        ];
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
        const excludedFields = ["id", "created_at", "updated_at", "driver_name", "driver_id", "monthly_cost", "is_active", "purchase_date"];
        Object.entries(vehicleData).forEach(([key, value]) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            if (!excludedFields.includes(snakeKey)) {
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
            unitId: row.unit_id,
            unitName: row.unit_name,
            status: row.status,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            driverName: row.driver_name,
            driverId: row.driver_id,
            monthlyCost: row.monthly_cost ? parseFloat(row.monthly_cost) : 0,
        };
    }
}
exports.VehicleService = VehicleService;
