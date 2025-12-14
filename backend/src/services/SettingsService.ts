import { query } from "../config/database"

export class SettingsService {
    async get(key: string): Promise<string | null> {
        const result = await query("SELECT value FROM system_settings WHERE key = $1", [key])
        return result.rows.length > 0 ? (result.rows[0] as any).value : null
    }

    async getAll(): Promise<any[]> {
        const result = await query("SELECT * FROM system_settings ORDER BY key")
        return result.rows
    }

    async set(key: string, value: string): Promise<void> {
        const exists = await this.get(key)
        if (exists !== null) {
            await query("UPDATE system_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2", [value, key])
        } else {
            await query("INSERT INTO system_settings (key, value) VALUES ($1, $2)", [key, value])
        }
    }
}
