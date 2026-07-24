import { query } from "../config/database"
import type { Unit } from "../types"

export class UnitService {
  async getAll(): Promise<Unit[]> {
    const result = await query("SELECT * FROM units ORDER BY name ASC")
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }
}
