import express from "express"
import { SettingsService } from "../services/SettingsService"
import { authenticateToken, authorize } from "../middlewares/auth"

const router = express.Router()
const service = new SettingsService()

// Public route to check allowed registration
router.get("/public", async (req, res) => {
    try {
        const value = await service.get("allow_admin_register")
        res.json({ success: true, allowed: value === "true" })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// Protected admin routes
router.get("/", authenticateToken, authorize("admin"), async (req, res) => {
    try {
        const settings = await service.getAll()
        res.json({ success: true, data: settings })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.put("/:key", authenticateToken, authorize("admin"), async (req, res) => {
    try {
        const { key } = req.params
        const { value } = req.body
        await service.set(key, String(value))
        res.json({ success: true })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

export default router
