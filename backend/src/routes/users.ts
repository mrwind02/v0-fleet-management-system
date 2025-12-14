import express from "express"
import { UserService } from "../services/UserService"
import { authenticateToken, authorize } from "../middlewares/auth"

const router = express.Router()
const service = new UserService()

router.get("/", authenticateToken, authorize("admin"), async (req, res) => {
    try {
        const users = await service.getAll()
        res.json({ success: true, data: users })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.put("/:id", authenticateToken, authorize("admin"), async (req, res) => {
    try {
        const { id } = req.params
        const updatedUser = await service.update(id, req.body)
        res.json({ success: true, data: updatedUser })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.delete("/:id", authenticateToken, authorize("admin"), async (req, res) => {
    try {
        const { id } = req.params
        await service.delete(id)
        res.json({ success: true })
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message })
    }
})

export default router
