"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const controller = new AuthController_1.AuthController();
router.post("/register", (req, res) => controller.register(req, res));
router.post("/login", (req, res) => controller.login(req, res));
router.post("/refresh", (req, res) => controller.refreshToken(req, res));
router.get("/profile", auth_1.authenticateToken, (req, res) => controller.getProfile(req, res));
exports.default = router;
