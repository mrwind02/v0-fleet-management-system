export type SettingsModule =
  | "dashboard"
  | "company"
  | "users"
  | "fleet"
  | "finance"
  | "documents"
  | "maintenance"
  | "suppliers"
  | "integrations"
  | "nfe"
  | "security"
  | "backup"
  | "audit"

export interface UserItem {
  id: string
  name: string
  email: string
  role: "admin" | "gestor" | "financeiro" | "operacional" | "driver"
  status: "Ativo" | "Inativo" | "Pendente 2FA"
  lastLogin: string
  createdAt: string
  permissionsCount: number
}

export interface RolePermissionItem {
  role: string
  roleName: string
  description: string
  userCount: number
  permissions: {
    module: string
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    export: boolean
    approve: boolean
  }[]
}

export interface FleetParameterItem {
  id: string
  type: "marca" | "modelo" | "categoria" | "combustivel" | "status" | "eixos"
  name: string
  description?: string
  extraInfo?: string
  active: boolean
}

export interface FinanceParameterItem {
  id: string
  type: "categoria_despesa" | "centro_custo" | "conta_bancaria" | "forma_pagamento"
  code: string
  name: string
  detail?: string
  active: boolean
}

export interface DocumentRuleItem {
  id: string
  docType: string
  requiredFor: "Veículo" | "Motorista" | "Ambos"
  alertDays: number
  autoRenew: boolean
  blocksAllocation: boolean
}

export interface MaintenanceRuleItem {
  id: string
  type: "tipo_os" | "prioridade" | "oficina" | "checklist"
  title: string
  detail: string
  status: "Ativo" | "Inativo"
}

export interface SupplierRuleItem {
  id: string
  category: string
  specialty: string
  minRating: number
  requiresHomologation: boolean
}

export interface ActiveSessionItem {
  id: string
  user: string
  ip: string
  device: string
  location: string
  startedAt: string
  isCurrent: boolean
}

export interface CompanyConfig {
  corporateName: string
  tradeName: string
  cnpj: string
  cnpjStatus?: string
  stateRegistration: string
  municipalRegistration: string
  phone: string
  email: string
  logoUrl?: string
  zipCode: string
  address: string
  number?: string
  complement?: string
  neighborhood?: string
  city: string
  state: string
  country: string
  timezone: string
  currency: string
  language: string
}

export interface BranchConfig {
  id: string
  name: string
  code: string
  cnpj?: string
  cnpjStatus?: string
  city: string
  state: string
  address?: string
  number?: string
  complement?: string
  neighborhood?: string
  zipCode?: string
  phone?: string
  email?: string
  status: "Ativa" | "Inativa"
  manager: string
}

export interface DigitalCertificateConfig {
  id: string
  type: "A1" | "A3"
  issuer: string
  validUntil: string
  daysRemaining: number
  status: "Válido" | "Próximo ao Vencimento" | "Vencido"
  accessKey?: string
}

export interface FiscalIntegrationConfig {
  autoReceiveNfe: boolean
  autoReceiveNfce: boolean
  sefazUf: string
  environment: "Produção" | "Homologação"
  lastSync: string
  nextSync: string
  destinadaScience: boolean
  certificate: DigitalCertificateConfig
}

export interface XmlImportItem {
  id: string
  docType: "NFe" | "NFCe" | "CTe" | "MDFe"
  supplierName: string
  supplierCnpj: string
  number: string
  accessKey: string
  totalValue: number
  issueDate: string
  parsedCategory: "combustivel" | "pecas" | "servico" | "despesa"
  suggestedModule: "Abastecimentos" | "Estoque" | "Manutenção (OS)" | "Financeiro"
  itemsCount: number
  status: "Pendente Conferência" | "Importado" | "Rejeitado"
  items: {
    code: string
    description: string
    ncm: string
    cfop: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

export interface IntegrationsConfig {
  apiKey: string
  webhookUrl: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  whatsappPhoneId: string
  googleMapsApiKey: string
  firebaseProjectId: string
  supabaseUrl: string
  fiscal: FiscalIntegrationConfig
}

export interface SecurityConfig {
  twoFactorRequired: boolean
  passwordMinLength: number
  passwordRequireSpecial: boolean
  sessionTimeoutMinutes: number
  activeSessionsCount: number
  lgpdConsentVersion: string
}

export interface BackupLog {
  id: string
  date: string
  size: string
  type: "Manual" | "Automático"
  status: "Concluído" | "Em Andamento" | "Erro"
  downloadUrl?: string
}

export interface AuditLog {
  id: string
  date: string
  user: string
  userRole: string
  module: string
  action: "Criar" | "Editar" | "Excluir" | "Importar" | "Configurar" | "Sincronizar"
  oldValue?: string
  newValue?: string
  ip: string
  device: string
}
