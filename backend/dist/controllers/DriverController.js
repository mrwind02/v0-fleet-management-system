"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const DriverService_1 = require("../services/DriverService");
class DriverController {
    constructor() {
        this.driverService = new DriverService_1.DriverService();
    }
    async create(req, res) {
        try {
            const { name, cnhNumber, cnhCategory, cnhExpiryDate, phone, email, specialLoadCertified, photoUrl, userId } = req.body;
            // Validações
            if (!name || !cnhNumber || !cnhCategory || !cnhExpiryDate) {
                return res.status(400).json({ success: false, error: "Missing required fields" });
            }
            // Verificar CNH única
            const existing = await this.driverService.getByCNH(cnhNumber);
            if (existing) {
                return res.status(409).json({ success: false, error: "CNH already registered" });
            }
            const driver = await this.driverService.create({
                userId,
                name,
                cnhNumber,
                cnhCategory,
                cnhExpiryDate: new Date(cnhExpiryDate),
                phone,
                email,
                specialLoadCertified,
                photoUrl,
            });
            res.status(201).json({ success: true, data: driver });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const isActive = req.query.active === "true" ? true : req.query.active === "false" ? false : undefined;
            const drivers = await this.driverService.getAll(isActive);
            res.json({ success: true, data: drivers });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const driver = await this.driverService.getById(id);
            if (!driver) {
                return res.status(404).json({ success: false, error: "Driver not found" });
            }
            res.json({ success: true, data: driver });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const driver = await this.driverService.update(id, req.body);
            res.json({ success: true, data: driver });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async assignToVehicle(req, res) {
        try {
            const { driverId } = req.params;
            const { vehicleId, notes } = req.body;
            if (!vehicleId) {
                return res.status(400).json({ success: false, error: "vehicleId is required" });
            }
            const assignment = await this.driverService.assignToVehicle(driverId, vehicleId, notes);
            res.json({ success: true, data: assignment });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async getCurrentVehicle(req, res) {
        try {
            const { driverId } = req.params;
            const vehicle = await this.driverService.getCurrentVehicle(driverId);
            if (!vehicle) {
                return res.status(404).json({ success: false, error: "No vehicle assigned" });
            }
            res.json({ success: true, data: vehicle });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.driverService.delete(id);
            res.json({ success: true, message: "Driver deleted successfully" });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.DriverController = DriverController;
