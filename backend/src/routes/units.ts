import express from "express"
import { UnitController } from "../controllers/UnitController"
import { authenticateToken } from "../middlewares/auth"

const router = express.Router()
const controller = new UnitController()

router.get("/", authenticateToken, (req, res) => controller.getAll(req, res))

export default router
