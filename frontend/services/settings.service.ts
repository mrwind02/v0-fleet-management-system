import {
  CompanyConfig,
  BranchConfig,
  IntegrationsConfig,
  SecurityConfig,
  BackupLog,
  AuditLog,
  UserItem,
  RolePermissionItem,
  FleetParameterItem,
  FinanceParameterItem,
  DocumentRuleItem,
  MaintenanceRuleItem,
  SupplierRuleItem,
  ActiveSessionItem
} from "../types/settings"

export const INITIAL_COMPANY_CONFIG: CompanyConfig = {
  corporateName: "",
  tradeName: "",
  cnpj: "",
  cnpjStatus: "",
  stateRegistration: "",
  municipalRegistration: "",
  phone: "",
  email: "",
  logoUrl: "",
  zipCode: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "Brasil",
  timezone: "America/Sao_Paulo (UTC-03:00)",
  currency: "BRL (R$)",
  language: "pt-BR (Português do Brasil)"
}

export const INITIAL_BRANCHES: BranchConfig[] = []

export const INITIAL_USERS: UserItem[] = [
  { id: "usr-01", name: "Thiago Matos", email: "thiago.matos@frotaone.com.br", role: "admin", status: "Ativo", lastLogin: "Hoje, 09:25", createdAt: "10/01/2026", permissionsCount: 42 },
  { id: "usr-02", name: "Carlos Mendes", email: "carlos.mendes@frotaone.com.br", role: "gestor", status: "Ativo", lastLogin: "Hoje, 08:40", createdAt: "15/01/2026", permissionsCount: 35 },
  { id: "usr-03", name: "Ana Paula Souza", email: "ana.souza@frotaone.com.br", role: "financeiro", status: "Ativo", lastLogin: "Ontem, 17:15", createdAt: "20/01/2026", permissionsCount: 28 },
  { id: "usr-04", name: "Valter Silva", email: "valter.silva@frotaone.com.br", role: "operacional", status: "Ativo", lastLogin: "Ontem, 16:00", createdAt: "01/02/2026", permissionsCount: 18 },
  { id: "usr-05", name: "Mariana Costa", email: "mariana.costa@frotaone.com.br", role: "operacional", status: "Ativo", lastLogin: "26/07/2026", createdAt: "05/02/2026", permissionsCount: 18 },
  { id: "usr-06", name: "João Silva", email: "joao.silva@frotaone.com.br", role: "driver", status: "Ativo", lastLogin: "Hoje, 07:10", createdAt: "12/02/2026", permissionsCount: 6 },
  { id: "usr-07", name: "Pedro Santos", email: "pedro.santos@frotaone.com.br", role: "driver", status: "Pendente 2FA", lastLogin: "24/07/2026", createdAt: "20/02/2026", permissionsCount: 6 }
]

export const INITIAL_ROLE_PERMISSIONS: RolePermissionItem[] = [
  {
    role: "admin",
    roleName: "Administrador Total",
    description: "Acesso irrestrito a todos os módulos, configurações globais, finanças e auditoria.",
    userCount: 2,
    permissions: [
      { module: "Frota", view: true, create: true, edit: true, delete: true, export: true, approve: true },
      { module: "Motoristas", view: true, create: true, edit: true, delete: true, export: true, approve: true },
      { module: "Manutenção", view: true, create: true, edit: true, delete: true, export: true, approve: true },
      { module: "Financeiro", view: true, create: true, edit: true, delete: true, export: true, approve: true },
      { module: "Relatórios BI", view: true, create: true, edit: true, delete: true, export: true, approve: true },
      { module: "Configurações", view: true, create: true, edit: true, delete: true, export: true, approve: true }
    ]
  },
  {
    role: "gestor",
    roleName: "Gestor de Operações",
    description: "Gerenciamento de frota, motoristas, ordens de serviço e acompanhamento de relatórios.",
    userCount: 4,
    permissions: [
      { module: "Frota", view: true, create: true, edit: true, delete: false, export: true, approve: true },
      { module: "Motoristas", view: true, create: true, edit: true, delete: false, export: true, approve: true },
      { module: "Manutenção", view: true, create: true, edit: true, delete: false, export: true, approve: true },
      { module: "Financeiro", view: true, create: false, edit: false, delete: false, export: true, approve: false },
      { module: "Relatórios BI", view: true, create: true, edit: true, delete: false, export: true, approve: false },
      { module: "Configurações", view: true, create: false, edit: false, delete: false, export: false, approve: false }
    ]
  },
  {
    role: "financeiro",
    roleName: "Analista Financeiro",
    description: "Controle de custos, abastecimentos, notas fiscais XML, despesas e aprovação de limites.",
    userCount: 3,
    permissions: [
      { module: "Frota", view: true, create: false, edit: false, delete: false, export: true, approve: false },
      { module: "Motoristas", view: true, create: false, edit: false, delete: false, export: true, approve: false },
      { module: "Manutenção", view: true, create: false, edit: false, delete: false, export: true, approve: true },
      { module: "Financeiro", view: true, create: true, edit: true, delete: true, export: true, approve: true },
      { module: "Relatórios BI", view: true, create: true, edit: true, delete: false, export: true, approve: false },
      { module: "Configurações", view: true, create: false, edit: true, delete: false, export: true, approve: false }
    ]
  },
  {
    role: "operacional",
    roleName: "Operador de Pátio / Base",
    description: "Registro de checklists, abertura de OS e atualização de hodômetros sem dados de custo.",
    userCount: 8,
    permissions: [
      { module: "Frota", view: true, create: true, edit: true, delete: false, export: false, approve: false },
      { module: "Motoristas", view: true, create: false, edit: false, delete: false, export: false, approve: false },
      { module: "Manutenção", view: true, create: true, edit: true, delete: false, export: false, approve: false },
      { module: "Financeiro", view: false, create: false, edit: false, delete: false, export: false, approve: false },
      { module: "Relatórios BI", view: true, create: false, edit: false, delete: false, export: false, approve: false },
      { module: "Configurações", view: false, create: false, edit: false, delete: false, export: false, approve: false }
    ]
  }
]

export const INITIAL_FLEET_PARAMS: FleetParameterItem[] = [
  { id: "fp-01", type: "marca", name: "Volvo Caminhões", extraInfo: "Suécia", active: true },
  { id: "fp-02", type: "marca", name: "Scania", extraInfo: "Suécia", active: true },
  { id: "fp-03", type: "marca", name: "Mercedes-Benz", extraInfo: "Alemanha", active: true },
  { id: "fp-04", type: "marca", name: "Volkswagen Caminhões", extraInfo: "Brasil", active: true },
  { id: "fp-05", type: "marca", name: "DAF Trucks", extraInfo: "Holanda", active: true },
  { id: "fp-06", type: "combustivel", name: "Diesel S10 (B12)", extraInfo: "Combustível Padrão Euro 6", active: true },
  { id: "fp-07", type: "combustivel", name: "Arla 32", extraInfo: "Aditivo Proconve P8", active: true },
  { id: "fp-08", type: "categoria", name: "Cavalo Mecânico (6x2 / 6x4)", extraInfo: "Transporte Rodoviário Pesado", active: true },
  { id: "fp-09", type: "categoria", name: "Caminhão Rígido (Truck / Bitruck)", extraInfo: "Carga Geral", active: true },
  { id: "fp-10", type: "status", name: "Em Operação", extraInfo: "Disponível na rota", active: true },
  { id: "fp-11", type: "status", name: "Em Manutenção Preventiva", extraInfo: "Oficina agendada", active: true },
  { id: "fp-12", type: "status", name: "Aguardando Peças", extraInfo: "Imobilizado", active: true }
]

export const INITIAL_FINANCE_PARAMS: FinanceParameterItem[] = [
  { id: "fn-01", type: "centro_custo", code: "CC-SP-01", name: "Operação Matriz São Paulo", detail: "Gestor: Valter Silva", active: true },
  { id: "fn-02", type: "centro_custo", code: "CC-RJ-02", name: "Operação Filial Rio", detail: "Gestor: Carlos Mendes", active: true },
  { id: "fn-03", type: "categoria_despesa", code: "DESP-01", name: "Combustível & Arla 32", detail: "Conta Analítica 3.1.01", active: true },
  { id: "fn-04", type: "categoria_despesa", code: "DESP-02", name: "Manutenção Preventiva / OS", detail: "Conta Analítica 3.1.02", active: true },
  { id: "fn-05", type: "categoria_despesa", code: "DESP-03", name: "Pedágios & Sem Parar", detail: "Conta Analítica 3.1.03", active: true },
  { id: "fn-06", type: "conta_bancaria", code: "BB-001", name: "Banco do Brasil S/A", detail: "Ag: 1234-5 | C/C: 98765-4", active: true },
  { id: "fn-07", type: "conta_bancaria", code: "ITAU-341", name: "Itaú Unibanco (PIX)", detail: "Chave CNPJ: 12.345.678/0001-90", active: true }
]

export const INITIAL_DOC_RULES: DocumentRuleItem[] = [
  { id: "dr-01", docType: "CRLV / Licenciamento Anual", requiredFor: "Veículo", alertDays: 60, autoRenew: false, blocksAllocation: true },
  { id: "dr-02", docType: "IPVA Cota Única / Parcelado", requiredFor: "Veículo", alertDays: 30, autoRenew: false, blocksAllocation: false },
  { id: "dr-03", docType: "CNH (Carteira de Habilitação)", requiredFor: "Motorista", alertDays: 60, autoRenew: false, blocksAllocation: true },
  { id: "dr-04", docType: "Seguro Frota Total", requiredFor: "Veículo", alertDays: 90, autoRenew: true, blocksAllocation: true },
  { id: "dr-05", docType: "Aferição Cronotacógrafo INMETRO", requiredFor: "Veículo", alertDays: 30, autoRenew: false, blocksAllocation: true }
]

export const INITIAL_MAINT_RULES: MaintenanceRuleItem[] = [
  { id: "mr-01", type: "tipo_os", title: "Manutenção Preventiva Periódica", detail: "Troca de óleo, filtros, regulagens", status: "Ativo" },
  { id: "mr-02", type: "tipo_os", title: "Manutenção Corretiva de Urgência", detail: "Reparo de quebra de componentes", status: "Ativo" },
  { id: "mr-03", type: "prioridade", title: "Urgência Total / Socorro na Roda", detail: "SLA Atendimento: 2 horas", status: "Ativo" },
  { id: "mr-04", type: "oficina", title: "Auto Truck Serviços SP", detail: "Oficina Credenciada Matriz", status: "Ativo" },
  { id: "mr-05", type: "checklist", title: "Checklist de Inspeção Pré-Viagem (18 Itens)", detail: "Pneus, Faróis, Freios, Fluidos", status: "Ativo" }
]

export const INITIAL_SUPPLIER_RULES: SupplierRuleItem[] = [
  { id: "sr-01", category: "Postos de Combustível", specialty: "Abastecimento Diesel S10 / Arla", minRating: 4.5, requiresHomologation: true },
  { id: "sr-02", category: "Oficinas Mecânicas", specialty: "Motor Diesel, Injeção Eletrônica, Freios", minRating: 4.2, requiresHomologation: true },
  { id: "sr-03", category: "Lojas de Pneus & Recapagem", specialty: "Goodyear, Michelin, Bandag", minRating: 4.0, requiresHomologation: false }
]

export const INITIAL_SESSIONS: ActiveSessionItem[] = [
  { id: "ss-01", user: "Thiago Matos (Administrador)", ip: "189.120.45.10", device: "Chrome 126 (Windows 11)", location: "São Paulo, Brasil", startedAt: "Hoje, 08:15", isCurrent: true },
  { id: "ss-02", user: "Carlos Mendes (Gestor)", ip: "177.80.12.94", device: "Edge 125 (Windows 10)", location: "Rio de Janeiro, Brasil", startedAt: "Hoje, 08:40", isCurrent: false },
  { id: "ss-03", user: "Ana Paula Souza (Financeiro)", ip: "201.54.199.3", device: "Safari 17 (macOS Sonoma)", location: "Belo Horizonte, Brasil", startedAt: "Ontem, 17:15", isCurrent: false }
]

export const INITIAL_INTEGRATIONS: IntegrationsConfig = {
  apiKey: "f1_live_9876543210fedcba9876543210",
  webhookUrl: "https://api.frotaone.com.br/v1/webhooks/events",
  smtpHost: "smtp.frotaone.com.br",
  smtpPort: 587,
  smtpUser: "notificacoes@frotaone.com.br",
  whatsappPhoneId: "105948372615049",
  googleMapsApiKey: "AIzaSyB_frotaone_maps_api_key_live_2026",
  firebaseProjectId: "frotaone-erp-prod",
  supabaseUrl: "https://frotaone.supabase.co",
  fiscal: {
    autoReceiveNfe: true,
    autoReceiveNfce: true,
    sefazUf: "SP",
    environment: "Produção",
    lastSync: "Hoje, 09:30",
    nextSync: "Hoje, 10:00",
    destinadaScience: true,
    certificate: {
      id: "cert-a1-001",
      type: "A1",
      issuer: "AC VALID RFB v5",
      validUntil: "15/10/2027",
      daysRemaining: 444,
      status: "Válido"
    }
  }
}

export const INITIAL_SECURITY_CONFIG: SecurityConfig = {
  twoFactorRequired: true,
  passwordMinLength: 8,
  passwordRequireSpecial: true,
  sessionTimeoutMinutes: 60,
  activeSessionsCount: 14,
  lgpdConsentVersion: "v2.4 (Maio/2026)"
}

export const INITIAL_BACKUP_LOGS: BackupLog[] = [
  { id: "bk-101", date: "28/07/2026 03:00", size: "482.5 MB", type: "Automático", status: "Concluído", downloadUrl: "#" },
  { id: "bk-102", date: "27/07/2026 18:40", size: "479.2 MB", type: "Manual", status: "Concluído", downloadUrl: "#" },
  { id: "bk-103", date: "27/07/2026 03:00", size: "478.0 MB", type: "Automático", status: "Concluído", downloadUrl: "#" },
  { id: "bk-104", date: "26/07/2026 03:00", size: "475.8 MB", type: "Automático", status: "Concluído", downloadUrl: "#" }
]

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud-001",
    date: "28/07/2026 09:20",
    user: "Carlos Mendes",
    userRole: "Administrador",
    module: "Integrações / NF-e",
    action: "Configurar",
    oldValue: "Recepção NFC-e: Desativado",
    newValue: "Recepção NFC-e: Ativado",
    ip: "189.120.45.10",
    device: "Chrome (Windows 11)"
  },
  {
    id: "aud-002",
    date: "27/07/2026 16:45",
    user: "Valter Silva",
    userRole: "Gestor",
    module: "Frota / Marcas",
    action: "Criar",
    newValue: "Nova marca: DAF Caminhões",
    ip: "177.80.12.94",
    device: "Edge (Windows 10)"
  },
  {
    id: "aud-003",
    date: "26/07/2026 14:10",
    user: "Ana Paula Souza",
    userRole: "Financeiro",
    module: "Financeiro / Centros de Custo",
    action: "Editar",
    oldValue: "Limite: R$ 50.000",
    newValue: "Limite: R$ 85.000",
    ip: "201.54.199.3",
    device: "Safari (macOS)"
  },
  {
    id: "aud-004",
    date: "25/07/2026 11:30",
    user: "Carlos Mendes",
    userRole: "Administrador",
    module: "Segurança",
    action: "Editar",
    oldValue: "2FA: Opcional",
    newValue: "2FA: Obrigatório para Admin",
    ip: "189.120.45.10",
    device: "Chrome (Windows 11)"
  }
]
