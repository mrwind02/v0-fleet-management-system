import { vehicleService } from "./api"

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

/**
 * Camada de abstração para os dados do Dashboard de Veículos.
 * Permite alternar facilmente entre dados mockados locais e uma API real
 * mantendo o contrato estrito esperado pelos componentes.
 */
export const vehicleDashboardService = {
  getMetrics: async (): Promise<VehicleDashboardMetrics> => {
    try {
      // Tenta buscar da API real para algumas métricas se possível
      const response = await vehicleService.getAll()
      const vehicles = response.data.data || []
      
      const totalVehicles = vehicles.length
      const activeVehicles = vehicles.filter((v: any) => v.isActive).length
      // Simulando veículos em manutenção (no futuro, v.status === 'maintenance')
      const maintenanceVehicles = Math.floor(totalVehicles * 0.15)
      const inactiveVehicles = vehicles.filter((v: any) => !v.isActive).length

      return {
        totalVehicles,
        activeVehicles,
        maintenanceVehicles,
        inactiveVehicles,
        averageConsumption: 3.4, // km/l (Mock)
        fleetAvailability: 92.5, // % (Mock)
        monthlyCost: 45230.50, // R$ (Mock)
        expiringDocuments: 8 // qtde (Mock)
      }
    } catch (error) {
      console.error("Error fetching vehicle dashboard metrics:", error)
      // Fallback fallback em caso de erro total
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
