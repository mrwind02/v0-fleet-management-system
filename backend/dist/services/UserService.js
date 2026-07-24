"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    async getAll() {
        console.log("UserService: Fetching all users");
        const result = await (0, database_1.query)("SELECT id, name, email, role, is_active, created_at, last_login FROM users ORDER BY name");
        console.log(`UserService: Found ${result.rows.length} users`);
        return result.rows;
    }
    async getById(id) {
        const result = await (0, database_1.query)("SELECT id, name, email, role, is_active FROM users WHERE id = $1", [id]);
        return result.rows[0] || null;
    }
    async update(id, data) {
        const fields = [];
        const params = [id];
        let paramIndex = 2;
        if (data.name !== undefined) {
            fields.push(`name = $${paramIndex++} `);
            params.push(data.name);
        }
        if (data.role !== undefined) {
            fields.push(`role = $${paramIndex++} `);
            params.push(data.role);
        }
        if (data.is_active !== undefined) {
            fields.push(`is_active = $${paramIndex++} `);
            params.push(data.is_active);
        }
        if (data.password) {
            const hash = await bcryptjs_1.default.hash(data.password, 10);
            fields.push(`password_hash = $${paramIndex++} `);
            params.push(hash);
        }
        if (fields.length === 0)
            return null;
        const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = $1 RETURNING id, name, email, role, is_active`;
        const result = await (0, database_1.query)(sql, params);
        return result.rows[0];
    }
    async delete(id) {
        await (0, database_1.query)("DELETE FROM users WHERE id = $1", [id]);
    }
}
exports.UserService = UserService;
