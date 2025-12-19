import authRoutes from "./auth"
import vehicleRoutes from "./vehicles"
import driverRoutes from "./drivers"
import maintenanceRoutes from "./maintenance"
import questionnaireRoutes from "./questionnaire"
import reportRoutes from "./reports"
import fuelRoutes from "./fuel"

import settingsRoutes from "./settings"
import usersRoutes from "./users"

export function setupRoutes(app: any) {
  // Health check for monitoring
  app.get("/api/health", (req: any, res: any) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() })
  })

  app.use("/api/auth", authRoutes)
  app.use("/api/vehicles", vehicleRoutes)
  app.use("/api/drivers", driverRoutes)
  app.use("/api/maintenance", maintenanceRoutes)
  app.use("/api/questionnaire", questionnaireRoutes)
  app.use("/api/reports", reportRoutes)
  app.use("/api/fuel", fuelRoutes)
  app.use("/api/settings", settingsRoutes)
  app.use("/api/users", usersRoutes)
}
