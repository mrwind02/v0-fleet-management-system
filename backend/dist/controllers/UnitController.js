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
}
exports.UnitController = UnitController;
