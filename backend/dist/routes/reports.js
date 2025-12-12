"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ReportService_1 = require("../services/ReportService");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const service = new ReportService_1.ReportService();
router.get("/metrics", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager"), async (req, res) => {
    try {
        const metrics = await service.getDashboardMetrics();
        res.json({ success: true, data: metrics });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get("/maintenance/csv", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager"), async (req, res) => {
    try {
        const { vehicleId, startDate, endDate } = req.query;
        const csv = await service.exportMaintenanceCSV(vehicleId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="maintenance-report.csv"');
        res.send(csv);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get("/questionnaire/csv", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager"), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, error: "startDate and endDate are required" });
        }
        const csv = await service.exportQuestionnaireCSV(new Date(startDate), new Date(endDate));
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="questionnaire-report.csv"');
        res.send(csv);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
exports.default = router;
