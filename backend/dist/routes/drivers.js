"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DriverController_1 = require("../controllers/DriverController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const controller = new DriverController_1.DriverController();
router.post("/", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager"), (req, res) => controller.create(req, res));
router.get("/", auth_1.authenticateToken, (req, res) => controller.getAll(req, res));
router.get("/:id", auth_1.authenticateToken, (req, res) => controller.getById(req, res));
router.put("/:id", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager"), (req, res) => controller.update(req, res));
router.post("/:driverId/assign-vehicle", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager"), (req, res) => controller.assignToVehicle(req, res));
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.authorize)("admin", "manager"), (req, res) => controller.delete(req, res));
router.get("/:driverId/current-vehicle", auth_1.authenticateToken, (req, res) => controller.getCurrentVehicle(req, res));
exports.default = router;
