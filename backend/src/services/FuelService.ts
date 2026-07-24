import { query } from "../config/database"

export interface FuelRecord {
    id: string
    vehicleId: string
    driverId: string
    fuelDate: Date
    gasStationName: string
    location?: string
    odometerReading: number
    liters: number
    cost: number
    unitId?: string
    fuelType?: string
    costPerLiter?: number
    paymentMethod?: string
    costCenter?: string
    fleetCard?: string
    receiptUrl?: string
    notes?: string
    city?: string
    uf?: string
    createdAt: Date
    updatedAt: Date
    // Joined fields
    plate?: string
    driverName?: string
    unitName?: string
}

export class FuelService {
    async create(data: Partial<FuelRecord>): Promise<FuelRecord> {
        const result = await query(
            `INSERT INTO fuel_records (
                vehicle_id, driver_id, fuel_date, gas_station_name, location, odometer_reading, liters, cost,
                unit_id, fuel_type, cost_per_liter, payment_method, cost_center, fleet_card, receipt_url, notes, city, uf
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *`,
            [
                data.vehicleId,
                data.driverId,
                data.fuelDate,
                data.gasStationName,
                data.location,
                data.odometerReading,
                data.liters,
                data.cost,
                data.unitId,
                data.fuelType,
                data.costPerLiter,
                data.paymentMethod,
                data.costCenter,
                data.fleetCard,
                data.receiptUrl,
                data.notes,
                data.city,
                data.uf
            ],
        )
        return this.mapToFuelRecord(result.rows[0])
    }

    async getAll(): Promise<FuelRecord[]> {
        const result = await query(
            `SELECT f.*, v.plate, d.name as driver_name, u.name as unit_name
            FROM fuel_records f
            LEFT JOIN vehicles v ON f.vehicle_id = v.id
            LEFT JOIN drivers d ON f.driver_id = d.id
            LEFT JOIN units u ON f.unit_id = u.id
            ORDER BY f.fuel_date DESC`,
        )
        return result.rows.map((row) => this.mapToFuelRecord(row))
    }

    async getByVehicle(vehicleId: string): Promise<FuelRecord[]> {
        const result = await query(
            `SELECT f.*, v.plate, d.name as driver_name, u.name as unit_name
            FROM fuel_records f
            LEFT JOIN vehicles v ON f.vehicle_id = v.id
            LEFT JOIN drivers d ON f.driver_id = d.id
            LEFT JOIN units u ON f.unit_id = u.id
            WHERE f.vehicle_id = $1
            ORDER BY f.fuel_date DESC`,
            [vehicleId],
        )
        return result.rows.map((row) => this.mapToFuelRecord(row))
    }

    async getById(id: string): Promise<FuelRecord | null> {
        const result = await query(
            `SELECT f.*, v.plate, d.name as driver_name, u.name as unit_name
            FROM fuel_records f
            LEFT JOIN vehicles v ON f.vehicle_id = v.id
            LEFT JOIN drivers d ON f.driver_id = d.id
            LEFT JOIN units u ON f.unit_id = u.id
            WHERE f.id = $1`, 
            [id]
        )
        return result.rows.length > 0 ? this.mapToFuelRecord(result.rows[0]) : null
    }

    async update(id: string, data: Partial<FuelRecord>): Promise<FuelRecord> {
        const updates: string[] = []
        const values: any[] = []
        let paramCount = 1

        const excludedFields = ["id", "created_at", "updated_at", "plate", "driver_name", "unit_name"]

        Object.entries(data).forEach(([key, value]) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
            if (!excludedFields.includes(snakeKey)) {
                updates.push(`${snakeKey} = $${paramCount}`)
                values.push(value)
                paramCount++
            }
        })

        updates.push(`updated_at = CURRENT_TIMESTAMP`)
        values.push(id)

        const result = await query(
            `UPDATE fuel_records SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
            values,
        )

        if (result.rows.length === 0) throw new Error("Fuel record not found")
        return this.mapToFuelRecord(result.rows[0])
    }

    async delete(id: string): Promise<void> {
        await query("DELETE FROM fuel_records WHERE id = $1", [id])
    }

    private mapToFuelRecord(row: any): FuelRecord {
        return {
            id: row.id,
            vehicleId: row.vehicle_id,
            driverId: row.driver_id,
            fuelDate: row.fuel_date,
            gasStationName: row.gas_station_name,
            location: row.location,
            odometerReading: row.odometer_reading,
            liters: row.liters,
            cost: row.cost,
            unitId: row.unit_id,
            fuelType: row.fuel_type,
            costPerLiter: row.cost_per_liter,
            paymentMethod: row.payment_method,
            costCenter: row.cost_center,
            fleetCard: row.fleet_card,
            receiptUrl: row.receipt_url,
            notes: row.notes,
            city: row.city,
            uf: row.uf,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            plate: row.plate,
            driverName: row.driver_name,
            unitName: row.unit_name,
        }
    }
}
