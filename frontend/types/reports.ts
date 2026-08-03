export type ReportCategory =
  | "frota"
  | "motoristas"
  | "manutencao"
  | "financeiro"
  | "documentacao"
  | "fornecedores"
  | "checklists"
  | "executivo"

export type ReportType = "operacional" | "financeiro" | "gerencial" | "executivo"

export type VisualizationMode = "tabela" | "grafico" | "tabela_grafico" | "cards" | "dashboard"

export type ExportFormat = "pdf" | "xlsx" | "csv" | "print"

export type SchedulePeriod = "diaria" | "semanal" | "mensal" | "anual" | "personalizada"

export type ScheduleDestination = "email" | "download" | "gdrive" | "onedrive" | "api"

export type UserRole = "admin" | "gestor" | "financeiro" | "operacional" | "executivo"

export type PermissionLevel = "read" | "edit"

export interface ReportFilterConfig {
  vehicleId?: string
  vehicleBrand?: string
  vehicleModel?: string
  unitId?: string
  driverId?: string
  supplierId?: string
  status?: string
  maintenanceType?: string
  workshop?: string
  costCenter?: string
  expenseCategory?: string
  docType?: string
  startDate?: string
  endDate?: string
  minValue?: number
  maxValue?: number
  cnhCategory?: string
  cnhStatus?: string
  minScore?: number
}

export interface ReportColumnOption {
  key: string
  label: string
  selected: boolean
  type?: "text" | "currency" | "date" | "number" | "status" | "badge"
}

export interface ReportSortConfig {
  field: string
  direction: "asc" | "desc"
}

export type GroupByField =
  | "veiculo"
  | "motorista"
  | "fornecedor"
  | "categoria"
  | "unidade"
  | "status"
  | "mes"
  | "ano"
  | "none"

export interface ReportTotalsConfig {
  total: boolean
  subtotal: boolean
  avg: boolean
  min: boolean
  max: boolean
  count: boolean
}

export interface ReportScheduleConfig {
  enabled: boolean
  periodicity: SchedulePeriod
  time?: string
  customDays?: string[]
  destination: ScheduleDestination
  recipients?: string[]
  format: ExportFormat
}

export interface ReportSharingConfig {
  isPublic: boolean
  users: string[]
  groups: string[]
  permission: PermissionLevel
}

export interface ReportConfig {
  id: string
  code: string
  name: string
  description: string
  category: ReportCategory
  type: ReportType
  isFavorite: boolean
  isScheduled: boolean
  isShared: boolean
  filters: ReportFilterConfig
  columns: ReportColumnOption[]
  sort: ReportSortConfig
  groupBy: GroupByField
  totals: ReportTotalsConfig
  visualization: VisualizationMode
  exportFormat: ExportFormat
  schedule: ReportScheduleConfig
  sharing: ReportSharingConfig
  allowedRoles: UserRole[]
  iconName?: string
  lastRun?: string
  runCount?: number
}

export interface ReportItem extends ReportConfig {}

export interface ReportExecutionLog {
  id: string
  reportId: string
  reportName: string
  user: string
  date: string
  duration: string
  format: ExportFormat
  status: "Concluído" | "Em Processamento" | "Erro"
  downloadUrl?: string
  recordCount: number
}

export interface ReportSchedule {
  id: string
  reportId: string
  reportName: string
  periodicity: SchedulePeriod
  destination: ScheduleDestination
  format: ExportFormat
  nextRun: string
  status: "Ativo" | "Pausado"
  active: boolean
  recipients: string[]
}

export interface ReportQueryResult {
  report: ReportConfig
  timestamp: string
  executionTimeMs: number
  kpis: {
    title: string
    value: string | number
    change?: string
    isPositive?: boolean
    iconName?: string
  }[]
  chartData: {
    label: string
    value: number
    secondaryValue?: number
    category?: string
  }[]
  columns: {
    key: string
    label: string
    type?: string
  }[]
  rows: Record<string, any>[]
  summary: {
    totalRecords: number
    sumTotal?: number
    average?: number
    minValue?: number
    maxValue?: number
  }
}
