import express from "express"
import { QuestionnaireService } from "../services/QuestionnaireService"
import { authenticateToken } from "../middlewares/auth"
import { DriverService } from "../services/DriverService"

const router = express.Router()
const service = new QuestionnaireService()
const driverService = new DriverService()

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { driverId, vehicleId, status, gpsLatitude, gpsLongitude, timestamp } = req.body

    if (!driverId || !status) {
      return res.status(400).json({ success: false, error: "Missing required fields" })
    }

    // Lookup driver profile using the user ID (passed as driverId)
    let driver = await driverService.getByUserId(driverId)

    // Validation: If not found by User ID, try finding by Email (Auto-Link)
    if (!driver && req.user && req.user.email) {
      console.log(`Driver profile not found for userId ${driverId}. Searching by email: ${req.user.email}`);
      const driverByEmail = await driverService.getByEmail(req.user.email);

      if (driverByEmail) {
        console.log(`Found unlinked driver profile for ${req.user.email}. Linking to user ${driverId}...`);
        await driverService.linkToUser(driverByEmail.id, driverId);
        driver = driverByEmail;
      }
    }

    if (!driver) {
      return res.status(404).json({ success: false, error: "Profile de motorista não encontrado. Peça ao administrador para cadastrar seus dados de CNH." })
    }

    // Sanitize vehicleId
    const safeVehicleId = vehicleId && vehicleId.trim() !== "" ? vehicleId : null;

    console.log(`Recording status for driver ${driver.name} (${driver.id}): ${status}, Vehicle: ${safeVehicleId}, Timestamp: ${timestamp}`);

    const response = await service.recordResponse(
      driver.id, // Use the actual driver.id
      safeVehicleId,
      status,
      gpsLatitude ? Number.parseFloat(gpsLatitude) : undefined,
      gpsLongitude ? Number.parseFloat(gpsLongitude) : undefined,
      timestamp ? new Date(timestamp) : undefined
    )

    res.status(201).json({ success: true, data: response })
  } catch (error: any) {
    console.error("Error in questionnaire route:", error);
    res.status(400).json({ success: false, error: error.message || "Erro desconhecido no servidor" })
  }
})

router.get("/driver/:driverId", authenticateToken, async (req, res) => {
  try {
    const { driverId } = req.params
    const { limit } = req.query

    // Resolve driver ID
    let resolvedDriverId = driverId;
    const driverByUserId = await driverService.getByUserId(driverId);
    if (driverByUserId) resolvedDriverId = driverByUserId.id;

    const responses = await service.getByDriver(resolvedDriverId, limit ? Number.parseInt(limit as string) : 100)
    res.json({ success: true, data: responses })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/driver/:driverId/latest", authenticateToken, async (req, res) => {
  try {
    const { driverId } = req.params

    // Resolve driver ID
    let resolvedDriverId = driverId;
    const driverByUserId = await driverService.getByUserId(driverId);
    if (driverByUserId) resolvedDriverId = driverByUserId.id;

    const response = await service.getLatestByDriver(resolvedDriverId)
    res.json({ success: true, data: response })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

export default router
