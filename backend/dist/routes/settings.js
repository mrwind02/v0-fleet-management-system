"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SettingsService_1 = require("../services/SettingsService");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const service = new SettingsService_1.SettingsService();
// Public route to check allowed registration
router.get("/public", async (req, res) => {
    try {
        const value = await service.get("allow_admin_register");
        res.json({ success: true, allowed: value === "true" });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Protected admin routes
router.get("/", auth_1.authenticateToken, (0, auth_1.authorize)("admin"), async (req, res) => {
    try {
        const settings = await service.getAll();
        res.json({ success: true, data: settings });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put("/:key", auth_1.authenticateToken, (0, auth_1.authorize)("admin"), async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        await service.set(key, String(value));
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
