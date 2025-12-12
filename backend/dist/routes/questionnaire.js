"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const QuestionnaireService_1 = require("../services/QuestionnaireService");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const service = new QuestionnaireService_1.QuestionnaireService();
router.post("/", auth_1.authenticateToken, async (req, res) => {
    try {
        const { driverId, vehicleId, status, gpsLatitude, gpsLongitude } = req.body;
        if (!driverId || !status) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }
        const response = await service.recordResponse(driverId, vehicleId, status, gpsLatitude ? Number.parseFloat(gpsLatitude) : undefined, gpsLongitude ? Number.parseFloat(gpsLongitude) : undefined);
        res.status(201).json({ success: true, data: response });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get("/driver/:driverId", auth_1.authenticateToken, async (req, res) => {
    try {
        const { driverId } = req.params;
        const { limit } = req.query;
        const responses = await service.getByDriver(driverId, limit ? Number.parseInt(limit) : 100);
        res.json({ success: true, data: responses });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get("/driver/:driverId/latest", auth_1.authenticateToken, async (req, res) => {
    try {
        const { driverId } = req.params;
        const response = await service.getLatestByDriver(driverId);
        res.json({ success: true, data: response });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
exports.default = router;
