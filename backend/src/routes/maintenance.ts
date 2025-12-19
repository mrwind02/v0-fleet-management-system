import express from "express"
import { MaintenanceService } from "../services/MaintenanceService"
import { authenticateToken, authorize } from "../middlewares/auth"

const router = express.Router()
const service = new MaintenanceService()

// Get all maintenance records
router.get("/", authenticateToken, async (req, res) => {
  try {
    const records = await service.getAll()
    res.json({ success: true, data: records })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post("/", authenticateToken, authorize("admin", "manager", "driver"), async (req, res) => {
  try {
    const {
      vehicleId,
      maintenanceDate,
      maintenanceType,
      mechanicName,
      establishmentName,
      serviceDescription,
      cost,
      odometerReading,
      attachments,
    } = req.body

    if (
      !vehicleId ||
      !maintenanceDate ||
      !maintenanceType ||
      !mechanicName ||
      !establishmentName ||
      !serviceDescription
    ) {
      return res.status(400).json({ success: false, error: "Missing required fields" })
    }

    const record = await service.create({
      vehicleId,
      maintenanceDate: new Date(maintenanceDate),
      maintenanceType,
      mechanicName,
      establishmentName,
      serviceDescription,
      cost: cost ? Number.parseFloat(cost) : undefined,
      odometerReading: odometerReading ? Number.parseFloat(odometerReading) : undefined,
      attachments,
    })

    res.status(201).json({ success: true, data: record })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/vehicle/:vehicleId", authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.params
    const { startDate, endDate, maintenanceType } = req.query

    const records = await service.getByVehicle(
      vehicleId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      maintenanceType as string,
    )

    res.json({ success: true, data: records })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const record = await service.getById(id)

    if (!record) {
      return res.status(404).json({ success: false, error: "Maintenance record not found" })
    }

    res.json({ success: true, data: record })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.put("/:id", authenticateToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const { id } = req.params
    const record = await service.update(id, req.body)
    res.json({ success: true, data: record })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

export default router
