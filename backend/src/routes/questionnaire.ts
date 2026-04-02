import express from "express"
import { QuestionnaireService } from "../services/QuestionnaireService"
import { authenticateToken } from "../middlewares/auth"

const router = express.Router()
const service = new QuestionnaireService()

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { driverId, vehicleId, status, gpsLatitude, gpsLongitude } = req.body

    if (!driverId || !status) {
      return res.status(400).json({ success: false, error: "Missing required fields" })
    }

    const response = await service.recordResponse(
      driverId,
      vehicleId,
      status,
      gpsLatitude ? Number.parseFloat(gpsLatitude) : undefined,
      gpsLongitude ? Number.parseFloat(gpsLongitude) : undefined,
    )

    res.status(201).json({ success: true, data: response })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/driver/:driverId", authenticateToken, async (req, res) => {
  try {
    const { driverId } = req.params
    const { limit } = req.query

    const responses = await service.getByDriver(driverId, limit ? Number.parseInt(limit as string) : 100)
    res.json({ success: true, data: responses })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/driver/:driverId/latest", authenticateToken, async (req, res) => {
  try {
    const { driverId } = req.params
    const response = await service.getLatestByDriver(driverId)
    res.json({ success: true, data: response })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

export default router
