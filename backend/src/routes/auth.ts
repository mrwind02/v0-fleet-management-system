import express from "express"
import { AuthController } from "../controllers/AuthController"
import { authenticateToken } from "../middlewares/auth"

const router = express.Router()
const controller = new AuthController()

router.post("/register", (req, res) => controller.register(req, res))
router.post("/login", (req, res) => controller.login(req, res))
router.post("/recover", (req, res) => controller.recover(req, res))
router.post("/refresh", (req, res) => controller.refreshToken(req, res))
router.get("/profile", authenticateToken, (req, res) => controller.getProfile(req, res))

export default router
