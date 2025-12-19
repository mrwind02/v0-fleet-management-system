import express from "express"
import { FuelService } from "../services/FuelService"
import { authenticateToken, authorize } from "../middlewares/auth"

const router = express.Router()
const service = new FuelService()

// Get all fuel records
router.get("/", authenticateToken, async (req, res) => {
    try {
        const records = await service.getAll()
        res.json({ success: true, data: records })
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message })
    }
})

// Create fuel record
router.post("/", authenticateToken, authorize("admin", "manager", "driver"), async (req, res) => {
    try {
        const {
            vehicleId,
            driverId,
            fuelDate,
            gasStationName,
            location,
            odometerReading,
            liters,
            cost,
        } = req.body

        if (!vehicleId || !fuelDate || !gasStationName || !odometerReading || !liters || !cost) {
            return res.status(400).json({ success: false, error: "Missing required fields" })
        }

        const record = await service.create({
            vehicleId,
            driverId: driverId || null,
            fuelDate: new Date(fuelDate),
            gasStationName,
            location,
            odometerReading: Number.parseFloat(odometerReading),
            liters: Number.parseFloat(liters),
            cost: Number.parseFloat(cost),
        })

        res.status(201).json({ success: true, data: record })
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message })
    }
})

// Get by vehicle
router.get("/vehicle/:vehicleId", authenticateToken, async (req, res) => {
    try {
        const { vehicleId } = req.params
        const records = await service.getByVehicle(vehicleId)
        res.json({ success: true, data: records })
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message })
    }
})

// Get by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        const record = await service.getById(id)

        if (!record) {
            return res.status(404).json({ success: false, error: "Fuel record not found" })
        }

        res.json({ success: true, data: record })
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message })
    }
})

// Update
router.put("/:id", authenticateToken, authorize("admin", "manager"), async (req, res) => {
    try {
        const { id } = req.params
        const record = await service.update(id, req.body)
        res.json({ success: true, data: record })
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message })
    }
})

// Delete
router.delete("/:id", authenticateToken, authorize("admin", "manager"), async (req, res) => {
    try {
        const { id } = req.params
        await service.delete(id)
        res.json({ success: true, message: "Fuel record deleted" })
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message })
    }
})

export default router
