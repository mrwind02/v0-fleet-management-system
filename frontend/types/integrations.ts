export type IntegrationCategory =
  | "APIs"
  | "Comunicação"
  | "Mapas"
  | "Banco de Dados"
  | "Fiscal"
  | "IA"
  | "Telemetria"
  | "Financeiro"
  | "Armazenamento"
  | "Monitoramento"

export type IntegrationStatusType =
  | "connected"      // 🟢 Conectado
  | "pending"        // 🟡 Configuração Pendente
  | "warning"        // 🟠 Atenção
  | "error"          // 🔴 Erro
  | "disabled"       // ⚫ Desativado

export interface IntegrationConfigField {
  key: string
  label: string
  type: "text" | "password" | "select" | "checkbox" | "certificate"
  value: string
  placeholder?: string
  masked?: boolean
  options?: string[]
  description?: string
}

export interface IntegrationItem {
  id: string
  slug: string
  name: string
  category: IntegrationCategory
  description: string
  version: string
  iconName: string
  status: IntegrationStatusType
  installed: boolean
  enabled: boolean
  lastSync: string
  lastError?: string
  uptimePct: number
  latencyMs: number
  calls24h: number
  rateLimitPct: number
  maskedCredential?: string
  configFields: IntegrationConfigField[]
  supportedFeatures: string[]
}

export interface IntegrationLog {
  id: string
  date: string
  event: string
  status: "sucesso" | "erro" | "alerta"
  timeMs: number
  message: string
  payload?: string
}

export interface IntegrationAudit {
  id: string
  date: string
  user: string
  userRole: string
  action: string
  details: string
}

export interface SystemHealthMetrics {
  totalInstalled: number
  totalActive: number
  syncsToday: number
  totalErrors: number
  apisConfigured: number
  lastGlobalSync: string
  globalUptimePct: number
  avgLatencyMs: number
}
