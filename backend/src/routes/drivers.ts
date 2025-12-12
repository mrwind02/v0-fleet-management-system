import express from "express"
import { DriverController } from "../controllers/DriverController"
import { authenticateToken, authorize } from "../middlewares/auth"

const router = express.Router()
const controller = new DriverController()

router.post("/", authenticateToken, authorize("admin", "manager"), (req, res) => controller.create(req, res))
router.get("/", authenticateToken, (req, res) => controller.getAll(req, res))
router.get("/:id", authenticateToken, (req, res) => controller.getById(req, res))
router.put("/:id", authenticateToken, authorize("admin", "manager"), (req, res) => controller.update(req, res))
router.post("/:driverId/assign-vehicle", authenticateToken, authorize("admin", "manager"), (req, res) =>
  controller.assignToVehicle(req, res),
)
router.delete("/:id", authenticateToken, authorize("admin", "manager"), (req, res) => controller.delete(req, res))
router.get("/:driverId/current-vehicle", authenticateToken, (req, res) => controller.getCurrentVehicle(req, res))

export default router
