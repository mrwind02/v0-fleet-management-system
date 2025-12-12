"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../config/database");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
class AuthService {
    async register(email, password, name, role = "driver") {
        // Verificar se usuário já existe
        const existingUser = await (0, database_1.query)("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            throw new Error("Email already registered");
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        const result = await (0, database_1.query)(`INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, is_active, created_at, updated_at`, [email, hashedPassword, name, role]);
        return result.rows[0];
    }
    async login(email, password) {
        let result;
        try {
            result = await (0, database_1.query)("SELECT * FROM users WHERE email = $1 AND is_active = true", [email]);
        }
        catch (error) {
            throw error;
        }
        if (result.rows.length === 0) {
            throw new Error("Invalid credentials");
        }
        const user = result.rows[0];
        const passwordMatch = await (0, password_1.comparePassword)(password, user.password_hash);
        if (!passwordMatch) {
            throw new Error("Invalid credentials");
        }
        // Atualizar último login
        try {
            await (0, database_1.query)("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);
        }
        catch (e) {
            console.error("Could not update last_login");
        }
        const accessToken = (0, jwt_1.generateToken)({ id: user.id, email: user.email, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id, email: user.email, role: user.role });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.is_active,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            },
            accessToken,
            refreshToken,
        };
    }
    async getUserById(id) {
        const result = await (0, database_1.query)("SELECT id, email, name, phone, role, is_active, last_login, created_at, updated_at FROM users WHERE id = $1", [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
}
exports.AuthService = AuthService;
