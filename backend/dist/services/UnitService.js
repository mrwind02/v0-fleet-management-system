"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitService = void 0;
const database_1 = require("../config/database");
class UnitService {
    async getAll() {
        const result = await (0, database_1.query)("SELECT * FROM units ORDER BY name ASC");
        return result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));
    }
}
exports.UnitService = UnitService;
