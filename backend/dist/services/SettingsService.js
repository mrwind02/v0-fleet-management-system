"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const database_1 = require("../config/database");
class SettingsService {
    async get(key) {
        const result = await (0, database_1.query)("SELECT value FROM system_settings WHERE key = $1", [key]);
        return result.rows.length > 0 ? result.rows[0].value : null;
    }
    async getAll() {
        const result = await (0, database_1.query)("SELECT * FROM system_settings ORDER BY key");
        return result.rows;
    }
    async set(key, value) {
        const exists = await this.get(key);
        if (exists !== null) {
            await (0, database_1.query)("UPDATE system_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2", [value, key]);
        }
        else {
            await (0, database_1.query)("INSERT INTO system_settings (key, value) VALUES ($1, $2)", [key, value]);
        }
    }
}
exports.SettingsService = SettingsService;
