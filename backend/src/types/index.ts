export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: "admin" | "manager" | "driver"
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Vehicle {
  id: string
  plate: string
  renavam?: string
  brand: string
  model: string
  year: number
  color?: string
  transportType: string
  chassisNumber: string
  loadCapacity?: number
  observations?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Driver {
  id: string
  userId?: string
  name: string
  cnhNumber: string
  cnhCategory: string
  cnhExpiryDate: Date
  phone?: string
  email?: string
  specialLoadCertified: boolean
  photoUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VehicleDriverAssignment {
  id: string
  vehicleId: string
  driverId: string
  assignedAt: Date
  unassignedAt?: Date
  isCurrent: boolean
  notes?: string
}

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  maintenanceDate: Date
  maintenanceType: "preventiva" | "corretiva"
  mechanicName: string
  establishmentName: string
  serviceDescription: string
  cost?: number
  odometerReading?: number
  attachments?: any[]
  createdAt: Date
  updatedAt: Date
}

export interface DriverQuestionnaire {
  id: string
  driverId: string
  vehicleId?: string
  status: "driving" | "stopped"
  gpsLatitude?: number
  gpsLongitude?: number
  timestampResponse: Date
  createdAt: Date
}

export interface AuditLog {
  id: string
  userId?: string
  entityType: string
  entityId: string
  action: string
  oldValues?: any
  newValues?: any
  timestamp: Date
}

export interface JWTPayload {
  id: string
  email: string
  role: "admin" | "manager" | "driver"
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
