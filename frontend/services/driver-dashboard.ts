import { driverService } from "./api"

export interface DriverDashboardMetrics {
  totalDrivers: number
  inOperation: number
  available: number
  withoutVehicle: number
  expiringCnh: number
  pendingTraining: number
}

/**
 * Camada de abstração para os dados do Dashboard de Motoristas.
 */
export const driverDashboardService = {
  getMetrics: async (): Promise<DriverDashboardMetrics> => {
    try {
      // Fetch drivers from API
      const response = await driverService.getAll()
      const drivers = response.data.data || []
      
      const totalDrivers = drivers.length
      const inOperation = drivers.filter((d: any) => d.status === 'Em Operação' || d.isActive).length
      
      // Mocked distribution based on total drivers
      const available = Math.max(0, Math.floor(totalDrivers * 0.3))
      const withoutVehicle = Math.max(0, Math.floor(totalDrivers * 0.1))
      const expiringCnh = Math.floor(Math.random() * 5)
      const pendingTraining = Math.floor(Math.random() * 10)

      return {
        totalDrivers,
        inOperation: inOperation > 0 ? inOperation : Math.floor(totalDrivers * 0.6),
        available,
        withoutVehicle,
        expiringCnh,
        pendingTraining
      }
    } catch (error) {
      console.error("Error fetching driver dashboard metrics:", error)
      return {
        totalDrivers: 0,
        inOperation: 0,
        available: 0,
        withoutVehicle: 0,
        expiringCnh: 0,
        pendingTraining: 0
      }
    }
  }
}
