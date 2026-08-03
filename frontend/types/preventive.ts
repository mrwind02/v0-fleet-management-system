export type PreventivePlanStatus = "Ativo" | "Próximo do vencimento" | "Vencido" | "Suspenso" | "Pausado" | "Arquivado"

export type TriggerCriterion = "km" | "time" | "mixed_or" | "mixed_and"

export interface PreventivePlanItem {
  id: string
  code: string
  name: string
  category: string
  description: string
  vehicleModel: string
  plate: string
  unit: string
  triggerType: TriggerCriterion
  triggerLabel: string
  intervalKm?: number
  intervalDays?: number
  toleranceKm?: number
  toleranceDays?: number
  nextExecutionKm?: number
  nextExecutionDate: string
  lastExecutionDate: string
  status: PreventivePlanStatus
  nextOsPrediction: string
  autoGenerateOs: boolean
  osPriority: "Baixa" | "Média" | "Alta" | "Urgente"
  defaultWorkshop: string
  defaultResponsible: string
  plannedServices: string[]
  osGeneratedCount: number
  compliancePercent: number
  createdAt: string
  objective?: string
  components?: string[]
  estimatedHours?: number
  notes?: string
}

export interface PreventiveExecutionItem {
  id: string
  plannedDate: string
  executedDate?: string
  plannedKm: number
  executedKm?: number
  status: "Concluído" | "Pendente" | "Atrasado"
  osNumber?: string
}

export interface PreventiveOsItem {
  id: string
  osNumber: string
  date: string
  status: "Concluída" | "Em Andamento" | "Agendada" | "Cancelada"
  workshop: string
  value: number
  osUrl: string
}

export interface PreventiveDocumentItem {
  id: string
  title: string
  type: string
  size: string
  uploadDate: string
  url: string
}

export interface PreventiveAuditItem {
  id: string
  date: string
  user: string
  action: string
  detail: string
}

export interface PreventiveCalendarEvent {
  id: string
  planId: string
  planName: string
  vehicle: string
  date: string
  type: "scheduled" | "overdue" | "completed" | "os_generated"
  statusLabel: string
  osNumber?: string
}

export interface PreventiveFilterState {
  search: string
  planType: string
  unit: string
  vehicle: string
  status: string
  criterion: string
  responsible: string
  period: string
}
