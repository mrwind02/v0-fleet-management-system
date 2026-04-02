import authRoutes from "./auth"
import vehicleRoutes from "./vehicles"
import driverRoutes from "./drivers"
import maintenanceRoutes from "./maintenance"
import questionnaireRoutes from "./questionnaire"
import reportRoutes from "./reports"

export function setupRoutes(app: any) {
  app.use("/api/auth", authRoutes)
  app.use("/api/vehicles", vehicleRoutes)
  app.use("/api/drivers", driverRoutes)
  app.use("/api/maintenance", maintenanceRoutes)
  app.use("/api/questionnaire", questionnaireRoutes)
  app.use("/api/reports", reportRoutes)
}
