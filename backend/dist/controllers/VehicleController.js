"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleController = void 0;
const VehicleService_1 = require("../services/VehicleService");
class VehicleController {
    constructor() {
        this.vehicleService = new VehicleService_1.VehicleService();
    }
    async create(req, res) {
        try {
            const { plate, renavam, brand, model, year, color, transportType, chassisNumber, loadCapacity, observations } = req.body;
            // Validações
            if (!plate || !brand || !model || !year || !chassisNumber) {
                return res.status(400).json({ success: false, error: "Missing required fields" });
            }
            // Verificar placa única
            const existing = await this.vehicleService.getByPlate(plate);
            if (existing) {
                return res.status(409).json({ success: false, error: "Plate already registered" });
            }
            const vehicle = await this.vehicleService.create({
                plate,
                renavam,
                brand,
                model,
                year: Number.parseInt(year),
                color,
                transportType,
                chassisNumber,
                loadCapacity: loadCapacity ? Number.parseFloat(loadCapacity) : undefined,
                observations,
            });
            res.status(201).json({ success: true, data: vehicle });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const isActive = req.query.active === "true" ? true : req.query.active === "false" ? false : undefined;
            const vehicles = await this.vehicleService.getAll(isActive);
            res.json({ success: true, data: vehicles });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const vehicle = await this.vehicleService.getById(id);
            if (!vehicle) {
                return res.status(404).json({ success: false, error: "Vehicle not found" });
            }
            res.json({ success: true, data: vehicle });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const vehicle = await this.vehicleService.update(id, req.body);
            res.json({ success: true, data: vehicle });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.vehicleService.delete(id);
            res.json({ success: true, message: "Vehicle deleted successfully" });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.VehicleController = VehicleController;
