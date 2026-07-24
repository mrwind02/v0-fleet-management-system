"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FuelService_1 = require("../services/FuelService");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const service = new FuelService_1.FuelService();
// Get all fuel records
router.get("/", auth_1.authenticateToken, async (req, res) => {
    try {
        const records = await service.getAll();
        res.json({ success: true, data: records });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Create fuel record
router.post("/", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager", "driver"), async (req, res) => {
    try {
        const { vehicleId, driverId, fuelDate, gasStationName, location, odometerReading, liters, cost, unitId, fuelType, costPerLiter, paymentMethod, costCenter, fleetCard, receiptUrl, notes, city, uf } = req.body;
        if (!vehicleId || !fuelDate || !gasStationName || !odometerReading || !liters || !cost) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }
        const record = await service.create({
            vehicleId,
            driverId: driverId || null,
            fuelDate: new Date(fuelDate),
            gasStationName,
            location,
            odometerReading: Number.parseFloat(odometerReading),
            liters: Number.parseFloat(liters),
            cost: Number.parseFloat(cost),
            unitId,
            fuelType,
            costPerLiter: costPerLiter ? Number.parseFloat(costPerLiter) : undefined,
            paymentMethod,
            costCenter,
            fleetCard,
            receiptUrl,
            notes,
            city,
            uf
        });
        res.status(201).json({ success: true, data: record });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Get by vehicle
router.get("/vehicle/:vehicleId", auth_1.authenticateToken, async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const records = await service.getByVehicle(vehicleId);
        res.json({ success: true, data: records });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Get by ID
router.get("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const record = await service.getById(id);
        if (!record) {
            return res.status(404).json({ success: false, error: "Fuel record not found" });
        }
        res.json({ success: true, data: record });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Update
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
// Delete
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager"), async (req, res) => {
    try {
        const { id } = req.params;
        await service.delete(id);
        res.json({ success: true, message: "Fuel record deleted" });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
exports.default = router;
