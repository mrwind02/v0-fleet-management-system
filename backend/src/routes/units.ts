import express from "express"
import { UnitController } from "../controllers/UnitController"
import { authenticateToken } from "../middlewares/auth"

const router = express.Router()
const controller = new UnitController()

router.get("/", authenticateToken, (req, res) => controller.getAll(req, res))
router.post("/", authenticateToken, (req, res) => controller.create(req, res))
router.put("/:id", authenticateToken, (req, res) => controller.update(req, res))
router.delete("/:id", authenticateToken, (req, res) => controller.delete(req, res))

export default router
