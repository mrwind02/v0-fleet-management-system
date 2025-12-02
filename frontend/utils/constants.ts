export const CNH_CATEGORIES = ["A", "B", "C", "D", "E", "ADI VT"] as const
export const MAINTENANCE_TYPES = ["preventiva", "corretiva"] as const
export const DRIVER_STATUSES = ["driving", "stopped"] as const
export const USER_ROLES = ["admin", "manager", "driver"] as const

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  manager: "Gestor",
  driver: "Motorista",
}

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
}
