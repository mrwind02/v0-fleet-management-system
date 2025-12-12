"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MaintenanceService_1 = require("../services/MaintenanceService");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const service = new MaintenanceService_1.MaintenanceService();
router.post("/", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager", "driver"), async (req, res) => {
    try {
        const { vehicleId, maintenanceDate, maintenanceType, mechanicName, establishmentName, serviceDescription, cost, odometerReading, attachments, } = req.body;
        if (!vehicleId ||
            !maintenanceDate ||
            !maintenanceType ||
            !mechanicName ||
            !establishmentName ||
            !serviceDescription) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }
        const record = await service.create({
            vehicleId,
            maintenanceDate: new Date(maintenanceDate),
            maintenanceType,
            mechanicName,
            establishmentName,
            serviceDescription,
            cost: cost ? Number.parseFloat(cost) : undefined,
            odometerReading: odometerReading ? Number.parseInt(odometerReading) : undefined,
            attachments,
        });
        res.status(201).json({ success: true, data: record });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get("/vehicle/:vehicleId", auth_1.authenticateToken, async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { startDate, endDate, maintenanceType } = req.query;
        const records = await service.getByVehicle(vehicleId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, maintenanceType);
        res.json({ success: true, data: records });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const record = await service.getById(id);
        if (!record) {
            return res.status(404).json({ success: false, error: "Maintenance record not found" });
        }
        res.json({ success: true, data: record });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.put("/:id", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager"), async (req, res) => {
    try {
        const { id } = req.params;
        const record = await service.update(id, req.body);
        res.json({ success: true, data: record });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
exports.default = router;
