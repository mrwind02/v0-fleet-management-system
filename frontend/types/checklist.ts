export type ChecklistResult = "Aprovado" | "Aprovado com Ressalvas" | "Reprovado"

export interface ChecklistExecutionItem {
  id: string
  code: string
  date: string
  time: string
  modelName: string
  vehicleModel: string
  plate: string
  driverName: string
  unit: string
  result: ChecklistResult
  nonConformitiesCount: number
  osGenerated: boolean
  durationMinutes: number
  osNumber?: string
  location?: string
  observerNotes?: string
  signatureUrl?: string
  gpsCoordinates?: string
  evaluatedCount: number
  compliantCount: number
  nonCompliantCount: number
  photosCount: number
}

export interface ChecklistItemEval {
  id: string
  category: string
  itemDescription: string
  result: "Conforme" | "Não Conforme" | "Não Aplicável"
  notes?: string
  photoUrl?: string
  isRequired: boolean
}

export interface ChecklistOccurrenceItem {
  id: string
  itemDescription: string
  category: string
  photoUrl?: string
  notes: string
  priority: "Baixa" | "Média" | "Alta" | "Urgente"
  status: "Pendente OS" | "OS Gerada" | "Resolvida"
  osNumber?: string
}

export interface ChecklistOsItem {
  id: string
  osNumber: string
  date: string
  status: "Concluída" | "Em Andamento" | "Agendada" | "Cancelada"
  workshop: string
  responsible: string
  value: number
  osUrl: string
}

export interface ChecklistPhotoItem {
  id: string
  title: string
  caption: string
  photoUrl: string
  uploadDate: string
}

export interface ChecklistAuditItem {
  id: string
  date: string
  user: string
  action: string
  detail: string
  device: string
}

export interface ChecklistModelTemplate {
  id: string
  name: string
  category: string
  applicationTarget: string
  itemsCount: number
  active: boolean
  isRequired: boolean
}

export interface ChecklistFilterState {
  search: string
  model: string
  vehicle: string
  driver: string
  unit: string
  status: string
  result: string
  period: string
}
