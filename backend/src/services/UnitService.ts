import { query } from "../config/database"
import type { Unit } from "../types"

export class UnitService {
  async getAll(): Promise<any[]> {
    const result = await query("SELECT * FROM units ORDER BY name ASC")
    return (result.rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      code: row.code || `FIL-${row.id.substring(0, 4)}`,
      city: row.city || "São Paulo",
      state: row.state || "SP",
      manager: row.manager || "Gestor Responsável",
      status: row.status || "Ativa",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  async create(data: any): Promise<any> {
    const id = data.id || `unit-${Date.now()}`
    const result = await query(
      `INSERT INTO units (id, name, code, city, state, manager, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        data.name || "Nova Filial",
        data.code || `FIL-${Math.floor(100 + Math.random() * 900)}`,
        data.city || "São Paulo",
        data.state || "SP",
        data.manager || "Gestor Responsável",
        data.status || "Ativa"
      ]
    )
    const row = result.rows[0] || { id, ...data }
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      city: row.city,
      state: row.state,
      manager: row.manager,
      status: row.status,
    }
  }

  async update(id: string, data: any): Promise<any> {
    const result = await query(
      `UPDATE units 
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           city = COALESCE($3, city),
           state = COALESCE($4, state),
           manager = COALESCE($5, manager),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [data.name, data.code, data.city, data.state, data.manager, data.status, id]
    )
    const row = result.rows[0] || { id, ...data }
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      city: row.city,
      state: row.state,
      manager: row.manager,
      status: row.status,
    }
  }

  async delete(id: string): Promise<void> {
    await query("DELETE FROM units WHERE id = $1", [id])
  }
}
