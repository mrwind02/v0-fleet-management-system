"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UnitController_1 = require("../controllers/UnitController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const controller = new UnitController_1.UnitController();
router.get("/", auth_1.authenticateToken, (req, res) => controller.getAll(req, res));
exports.default = router;
