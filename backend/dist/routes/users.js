"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserService_1 = require("../services/UserService");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const service = new UserService_1.UserService();
router.get("/", auth_1.authenticateToken, (0, auth_1.authorize)("admin"), async (req, res) => {
    try {
        const users = await service.getAll();
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put("/:id", auth_1.authenticateToken, (0, auth_1.authorize)("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await service.update(id, req.body);
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.authorize)("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        await service.delete(id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
