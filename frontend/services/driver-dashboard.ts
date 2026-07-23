import { dashboardService } from "./api"

export interface DriverDashboardMetrics {
  totalDrivers: number
  activeDrivers: number
  onRouteDrivers: number
  inactiveDrivers: number
  averageScore: number
  cnhExpiring: number
  totalFines: number
  accidentsMonth: number
}

export const driverDashboardService = {
  getMetrics: async (): Promise<DriverDashboardMetrics> => {
    try {
      const response = await dashboardService.getMetrics()
      const data = response.data

      return {
        totalDrivers: data.drivers.total,
        activeDrivers: data.drivers.active,
        onRouteDrivers: data.drivers.onRoute,
        inactiveDrivers: data.drivers.inactive,
        averageScore: 92, // To be calculated
        cnhExpiring: 0, // To be calculated
        totalFines: data.fines.pendingValue,
        accidentsMonth: 0
      }
    } catch (error) {
      console.error("Error fetching driver dashboard metrics:", error)
      return {
        totalDrivers: 0,
        activeDrivers: 0,
        onRouteDrivers: 0,
        inactiveDrivers: 0,
        averageScore: 0,
        cnhExpiring: 0,
        totalFines: 0,
        accidentsMonth: 0
      }
    }
  }
}
