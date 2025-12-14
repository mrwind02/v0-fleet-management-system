
import { query } from "../config/database"
import bcrypt from "bcryptjs"

export class UserService {
    async getAll(): Promise<any[]> {
        console.log("UserService: Fetching all users")
        const result = await query("SELECT id, name, email, role, is_active, created_at, last_login FROM users ORDER BY name")
        console.log(`UserService: Found ${result.rows.length} users`)
        return result.rows
    }

    async getById(id: string): Promise<any | null> {
        const result = await query("SELECT id, name, email, role, is_active FROM users WHERE id = $1", [id])
        return result.rows[0] || null
    }

    async update(id: string, data: { name?: string; role?: string; is_active?: boolean; password?: string }): Promise<any> {
        const fields: string[] = []
        const params: any[] = [id]
        let paramIndex = 2

        if (data.name !== undefined) {
            fields.push(`name = $${paramIndex++} `)
            params.push(data.name)
        }
        if (data.role !== undefined) {
            fields.push(`role = $${paramIndex++} `)
            params.push(data.role)
        }
        if (data.is_active !== undefined) {
            fields.push(`is_active = $${paramIndex++} `)
            params.push(data.is_active)
        }
        if (data.password) {
            const hash = await bcrypt.hash(data.password, 10)
            fields.push(`password_hash = $${paramIndex++} `)
            params.push(hash)
        }

        if (fields.length === 0) return null

        const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = $1 RETURNING id, name, email, role, is_active`
        const result = await query(sql, params)
        return result.rows[0]
    }

    async delete(id: string): Promise<void> {
        await query("DELETE FROM users WHERE id = $1", [id])
    }
}
