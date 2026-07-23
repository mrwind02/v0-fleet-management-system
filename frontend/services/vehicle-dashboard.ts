import { dashboardService } from "./api"

export interface VehicleDashboardMetrics {
  totalVehicles: number
  activeVehicles: number
  maintenanceVehicles: number
  inactiveVehicles: number
  averageConsumption: number
  fleetAvailability: number
  monthlyCost: number
  expiringDocuments: number
}

export const vehicleDashboardService = {
  getMetrics: async (): Promise<VehicleDashboardMetrics> => {
    try {
      const response = await dashboardService.getMetrics()
      const data = response.data

      return {
        totalVehicles: data.vehicles.total,
        activeVehicles: data.vehicles.active,
        maintenanceVehicles: data.vehicles.maintenance,
        inactiveVehicles: data.vehicles.inactive,
        averageConsumption: 3.4, // We would need a fuel integration for this, mock for now or 0
        fleetAvailability: data.vehicles.total ? Math.round((data.vehicles.active / data.vehicles.total) * 100) : 0,
        monthlyCost: data.costs.totalMonthly,
        expiringDocuments: data.documents.expiring
      }
    } catch (error) {
      console.error("Error fetching vehicle dashboard metrics:", error)
      return {
        totalVehicles: 0,
        activeVehicles: 0,
        maintenanceVehicles: 0,
        inactiveVehicles: 0,
        averageConsumption: 0,
        fleetAvailability: 0,
        monthlyCost: 0,
        expiringDocuments: 0
      }
    }
  }
}
