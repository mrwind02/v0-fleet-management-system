export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "manager" | "driver"
}

export interface Vehicle {
  id: string
  plate: string
  renavam?: string
  brand: string
  model: string
  year: number
  color?: string
  chassisNumber: string
  loadCapacity?: number
  observations?: string
  transportType: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Driver {
  id: string
  name: string
  cnhNumber: string
  cnhCategory: string
  cnhExpiryDate: string
  phone?: string
  email?: string
  specialLoadCertified: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Maintenance {
  id: string
  vehicleId: string
  maintenanceDate: string
  maintenanceType: "preventiva" | "corretiva"
  mechanicName: string
  establishmentName: string
  serviceDescription: string
  cost?: number
  odometerReading?: number
  createdAt: string
}

export interface Questionnaire {
  id: string
  driverId: string
  vehicleId: string
  status: "driving" | "stopped"
  gpsLatitude?: number
  gpsLongitude?: number
  timestampResponse: string
  createdAt: string
}
