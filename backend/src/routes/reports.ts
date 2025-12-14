import express from "express"
import { ReportService } from "../services/ReportService"
import { authenticateToken, authorize } from "../middlewares/auth"

const router = express.Router()
const service = new ReportService()

router.get("/metrics", authenticateToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const metrics = await service.getDashboardMetrics()
    res.json({ success: true, data: metrics })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/recent-maintenance", authenticateToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5
    const data = await service.getRecentMaintenance(limit)
    res.json({ success: true, data })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/maintenance/pdf", authenticateToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, timezone } = req.query

    const pdfBuffer = await service.exportMaintenancePDF(
      vehicleId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      timezone as string
    )

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", 'attachment; filename="maintenance-report.pdf"')
    res.send(pdfBuffer)
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/questionnaire/pdf", authenticateToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const { startDate, endDate, driverId, timezone } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: "startDate and endDate are required" })
    }

    const pdfBuffer = await service.exportQuestionnairePDF(
      new Date(startDate as string),
      new Date(endDate as string),
      driverId as string,
      timezone as string
    )

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", 'attachment; filename="questionnaire-report.pdf"')
    res.send(pdfBuffer)
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/maintenance/csv", authenticateToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query

    const csv = await service.exportMaintenanceCSV(
      vehicleId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    )

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", 'attachment; filename="maintenance-report.csv"')
    res.send(csv)
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.get("/questionnaire/csv", authenticateToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const { startDate, endDate, driverId } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: "startDate and endDate are required" })
    }

    const csv = await service.exportQuestionnaireCSV(
      new Date(startDate as string),
      new Date(endDate as string),
      driverId as string
    )

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", 'attachment; filename="questionnaire-report.csv"')
    res.send(csv)
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

export default router
