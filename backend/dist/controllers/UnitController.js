"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitController = void 0;
const UnitService_1 = require("../services/UnitService");
class UnitController {
    constructor() {
        this.unitService = new UnitService_1.UnitService();
    }
    async getAll(req, res) {
        try {
            const units = await this.unitService.getAll();
            res.json({ success: true, data: units });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async create(req, res) {
        try {
            const unit = await this.unitService.create(req.body);
            res.status(201).json({ success: true, data: unit });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const unit = await this.unitService.update(id, req.body);
            res.json({ success: true, data: unit });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.unitService.delete(id);
            res.json({ success: true, message: "Filial excluída com sucesso" });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.UnitController = UnitController;
