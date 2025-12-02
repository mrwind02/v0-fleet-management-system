import express from "express"
import { VehicleController } from "../controllers/VehicleController"
import { authenticateToken, authorize } from "../middlewares/auth"

const router = express.Router()
const controller = new VehicleController()

router.post("/", authenticateToken, authorize("admin", "manager"), (req, res) => controller.create(req, res))
router.get("/", authenticateToken, (req, res) => controller.getAll(req, res))
router.get("/:id", authenticateToken, (req, res) => controller.getById(req, res))
router.put("/:id", authenticateToken, authorize("admin", "manager"), (req, res) => controller.update(req, res))
router.delete("/:id", authenticateToken, authorize("admin", "manager"), (req, res) => controller.delete(req, res))

export default router
