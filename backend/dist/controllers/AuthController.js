"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const jwt_1 = require("../utils/jwt");
class AuthController {
    constructor() {
        this.authService = new AuthService_1.AuthService();
    }
    async register(req, res) {
        try {
            const { email, password, name, role } = req.body;
            if (!email || !password || !name) {
                return res.status(400).json({ success: false, error: "Email, password and name are required" });
            }
            const user = await this.authService.register(email, password, name, role || "driver");
            res.status(201).json({ success: true, data: user });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, error: "Email and password are required" });
            }
            const result = await this.authService.login(email, password);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(401).json({ success: false, error: error.message });
        }
    }
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ success: false, error: "Refresh token is required" });
            }
            const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
            if (!decoded) {
                return res.status(403).json({ success: false, error: "Invalid or expired refresh token" });
            }
            const newAccessToken = (0, jwt_1.generateToken)(decoded);
            res.json({ success: true, data: { accessToken: newAccessToken } });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async getProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: "Not authenticated" });
            }
            const user = await this.authService.getUserById(req.user.id);
            res.json({ success: true, data: user });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.AuthController = AuthController;
