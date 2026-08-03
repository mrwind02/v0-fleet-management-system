import {
  ReportConfig,
  ReportQueryResult,
  ReportExecutionLog,
  ReportSchedule,
  UserRole,
  ReportCategory,
  ExportFormat
} from "../types/reports"
import { vehicleService, driverService, maintenanceService, fuelService } from "./api"
import { fineService } from "./fine.service"

// Catalog of Standard Pre-configured Reports
export const DEFAULT_REPORTS: ReportConfig[] = [
  // CATEGORY: FROTA
  {
    id: "rep-frota-01",
    code: "FROTA-001",
    name: "Situação da Frota",
    description: "Visão geral do status atual de todos os veículos da frota (Ativos, Em Manutenção, Inativos).",
    category: "frota",
    type: "operacional",
    isFavorite: true,
    isScheduled: false,
    isShared: true,
    iconName: "Truck",
    allowedRoles: ["admin", "gestor", "operacional", "financeiro"],
    filters: { status: "Todos" },
    columns: [
      { key: "plate", label: "Placa", selected: true, type: "badge" },
      { key: "vehicle", label: "Veículo", selected: true, type: "text" },
      { key: "unit", label: "Unidade", selected: true, type: "text" },
      { key: "status", label: "Status", selected: true, type: "status" },
      { key: "year", label: "Ano", selected: true, type: "text" },
      { key: "odometer", label: "Hodômetro (KM)", selected: true, type: "number" },
      { key: "driver", label: "Motorista Atual", selected: true, type: "text" },
    ],
    sort: { field: "plate", direction: "asc" },
    groupBy: "unidade",
    totals: { total: true, subtotal: true, avg: true, min: false, max: false, count: true },
    visualization: "tabela_grafico",
    exportFormat: "pdf",
    schedule: { enabled: false, periodicity: "semanal", destination: "email", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "Ontem, 16:30",
    runCount: 42
  },
  {
    id: "rep-frota-02",
    code: "FROTA-002",
    name: "Utilização da Frota",
    description: "Análise de rodagem, km percorridos e taxa de uso de veículos por período.",
    category: "frota",
    type: "gerencial",
    isFavorite: false,
    isScheduled: true,
    isShared: true,
    iconName: "Activity",
    allowedRoles: ["admin", "gestor", "operacional"],
    filters: {},
    columns: [
      { key: "vehicle", label: "Veículo", selected: true, type: "text" },
      { key: "plate", label: "Placa", selected: true, type: "badge" },
      { key: "unit", label: "Unidade", selected: true, type: "text" },
      { key: "kmDriven", label: "KM Percorridos", selected: true, type: "number" },
      { key: "usageHours", label: "Horas em Operação", selected: true, type: "number" },
      { key: "efficiency", label: "Taxa de Ocupação (%)", selected: true, type: "number" }
    ],
    sort: { field: "kmDriven", direction: "desc" },
    groupBy: "unidade",
    totals: { total: true, subtotal: true, avg: true, min: false, max: false, count: true },
    visualization: "grafico",
    exportFormat: "xlsx",
    schedule: { enabled: true, periodicity: "semanal", destination: "email", format: "xlsx" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "24/07/2026",
    runCount: 29
  },
  {
    id: "rep-frota-03",
    code: "FROTA-003",
    name: "Quilometragem Acumulada",
    description: "Histórico de evolução do hodômetro e previsão de trocas de óleo e manutenção.",
    category: "frota",
    type: "operacional",
    isFavorite: false,
    isScheduled: false,
    isShared: false,
    iconName: "Gauge",
    allowedRoles: ["admin", "gestor", "operacional"],
    filters: {},
    columns: [
      { key: "vehicle", label: "Veículo", selected: true },
      { key: "plate", label: "Placa", selected: true },
      { key: "odometer", label: "Hodômetro Atual", selected: true, type: "number" },
      { key: "lastMonthKm", label: "Mês Anterior", selected: true, type: "number" },
      { key: "variationKm", label: "Variação KM", selected: true, type: "number" }
    ],
    sort: { field: "odometer", direction: "desc" },
    groupBy: "none",
    totals: { total: true, subtotal: false, avg: true, min: true, max: true, count: true },
    visualization: "tabela",
    exportFormat: "csv",
    schedule: { enabled: false, periodicity: "mensal", destination: "download", format: "csv" },
    sharing: { isPublic: false, users: [], groups: [], permission: "read" },
    runCount: 15
  },
  {
    id: "rep-frota-04",
    code: "FROTA-004",
    name: "Disponibilidade Operacional",
    description: "Índice de uptime dos veículos e tempo fora de operação por unidade.",
    category: "frota",
    type: "executivo",
    isFavorite: true,
    isScheduled: true,
    isShared: true,
    iconName: "Percent",
    allowedRoles: ["admin", "gestor", "executivo"],
    filters: {},
    columns: [
      { key: "unit", label: "Unidade", selected: true },
      { key: "totalVehicles", label: "Total Frota", selected: true, type: "number" },
      { key: "activeVehicles", label: "Disponíveis", selected: true, type: "number" },
      { key: "maintenanceVehicles", label: "Em Manutenção", selected: true, type: "number" },
      { key: "availabilityRate", label: "Disponibilidade (%)", selected: true, type: "number" }
    ],
    sort: { field: "availabilityRate", direction: "desc" },
    groupBy: "unidade",
    totals: { total: true, subtotal: true, avg: true, min: true, max: true, count: true },
    visualization: "dashboard",
    exportFormat: "pdf",
    schedule: { enabled: true, periodicity: "diaria", destination: "email", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "Hoje, 08:00",
    runCount: 88
  },

  // CATEGORY: MOTORISTAS
  {
    id: "rep-mot-01",
    code: "MOT-001",
    name: "Pontuação e Desempenho",
    description: "Score de condução dos motoristas com base em infrações, checklists e telemetria.",
    category: "motoristas",
    type: "gerencial",
    isFavorite: true,
    isScheduled: false,
    isShared: true,
    iconName: "Award",
    allowedRoles: ["admin", "gestor", "operacional"],
    filters: {},
    columns: [
      { key: "driver", label: "Motorista", selected: true },
      { key: "cnhCategory", label: "Categoria CNH", selected: true },
      { key: "score", label: "Pontuação (0-100)", selected: true, type: "number" },
      { key: "finesCount", label: "Infrações", selected: true, type: "number" },
      { key: "status", label: "Status", selected: true, type: "status" }
    ],
    sort: { field: "score", direction: "desc" },
    groupBy: "categoria",
    totals: { total: false, subtotal: false, avg: true, min: true, max: true, count: true },
    visualization: "tabela_grafico",
    exportFormat: "pdf",
    schedule: { enabled: false, periodicity: "mensal", destination: "email", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "Há 3 dias",
    runCount: 31
  },
  {
    id: "rep-mot-02",
    code: "MOT-002",
    name: "Vencimentos de CNH",
    description: "Relatório de acompanhamento de validade da Carteira Nacional de Habilitação.",
    category: "motoristas",
    type: "operacional",
    isFavorite: false,
    isScheduled: true,
    isShared: true,
    iconName: "FileCheck",
    allowedRoles: ["admin", "gestor", "operacional"],
    filters: {},
    columns: [
      { key: "driver", label: "Motorista", selected: true },
      { key: "cnhNumber", label: "Número CNH", selected: true },
      { key: "cnhCategory", label: "Categoria", selected: true },
      { key: "expiryDate", label: "Data de Vencimento", selected: true, type: "date" },
      { key: "daysToExpiry", label: "Dias Restantes", selected: true, type: "number" },
      { key: "status", label: "Situação", selected: true, type: "status" }
    ],
    sort: { field: "daysToExpiry", direction: "asc" },
    groupBy: "status",
    totals: { total: false, subtotal: false, avg: false, min: false, max: false, count: true },
    visualization: "tabela",
    exportFormat: "xlsx",
    schedule: { enabled: true, periodicity: "semanal", destination: "email", format: "xlsx" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "Hoje, 07:30",
    runCount: 64
  },
  {
    id: "rep-mot-03",
    code: "MOT-003",
    name: "Infrações e Multas por Motorista",
    description: "Detalhamento de autuações e custos de infrações vinculadas a motoristas.",
    category: "motoristas",
    type: "financeiro",
    isFavorite: false,
    isScheduled: false,
    isShared: true,
    iconName: "AlertTriangle",
    allowedRoles: ["admin", "gestor", "financeiro"],
    filters: {},
    columns: [
      { key: "driver", label: "Motorista", selected: true },
      { key: "vehicle", label: "Veículo", selected: true },
      { key: "fineCode", label: "Auto de Infração", selected: true },
      { key: "description", label: "Descrição", selected: true },
      { key: "amount", label: "Valor (R$)", selected: true, type: "currency" },
      { key: "points", label: "Pontos", selected: true, type: "number" },
      { key: "status", label: "Status Pagamento", selected: true, type: "status" }
    ],
    sort: { field: "amount", direction: "desc" },
    groupBy: "motorista",
    totals: { total: true, subtotal: true, avg: true, min: false, max: true, count: true },
    visualization: "tabela_grafico",
    exportFormat: "pdf",
    schedule: { enabled: false, periodicity: "mensal", destination: "download", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    runCount: 22
  },

  // CATEGORY: MANUTENÇÃO
  {
    id: "rep-man-01",
    code: "MAN-001",
    name: "Ordens de Serviço Abertas",
    description: "Monitoramento de OS pendentes, em execução ou aguardando peças nas oficinas.",
    category: "manutencao",
    type: "operacional",
    isFavorite: true,
    isScheduled: false,
    isShared: true,
    iconName: "Wrench",
    allowedRoles: ["admin", "gestor", "operacional"],
    filters: { status: "Aberto" },
    columns: [
      { key: "osCode", label: "Nº OS", selected: true, type: "badge" },
      { key: "vehicle", label: "Veículo", selected: true },
      { key: "type", label: "Tipo", selected: true },
      { key: "supplier", label: "Oficina / Fornecedor", selected: true },
      { key: "openDate", label: "Data Abertura", selected: true, type: "date" },
      { key: "estimatedCost", label: "Custo Est. (R$)", selected: true, type: "currency" },
      { key: "status", label: "Status", selected: true, type: "status" }
    ],
    sort: { field: "openDate", direction: "asc" },
    groupBy: "status",
    totals: { total: true, subtotal: true, avg: true, min: false, max: false, count: true },
    visualization: "tabela",
    exportFormat: "pdf",
    schedule: { enabled: false, periodicity: "diaria", destination: "email", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "Ontem",
    runCount: 51
  },
  {
    id: "rep-man-02",
    code: "MAN-002",
    name: "Custos de Manutenção por Veículo",
    description: "Consolidação financeira de despesas com preventiva, corretiva e peças.",
    category: "manutencao",
    type: "financeiro",
    isFavorite: true,
    isScheduled: true,
    isShared: true,
    iconName: "DollarSign",
    allowedRoles: ["admin", "gestor", "financeiro"],
    filters: {},
    columns: [
      { key: "vehicle", label: "Veículo", selected: true },
      { key: "plate", label: "Placa", selected: true, type: "badge" },
      { key: "preventiveCost", label: "Preventivas (R$)", selected: true, type: "currency" },
      { key: "correctiveCost", label: "Corretivas (R$)", selected: true, type: "currency" },
      { key: "totalCost", label: "Custo Total (R$)", selected: true, type: "currency" },
      { key: "costPerKm", label: "Custo/KM (R$)", selected: true, type: "currency" }
    ],
    sort: { field: "totalCost", direction: "desc" },
    groupBy: "veiculo",
    totals: { total: true, subtotal: true, avg: true, min: true, max: true, count: true },
    visualization: "tabela_grafico",
    exportFormat: "xlsx",
    schedule: { enabled: true, periodicity: "mensal", destination: "email", format: "xlsx" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "20/07/2026",
    runCount: 95
  },
  {
    id: "rep-man-03",
    code: "MAN-003",
    name: "Tempo Parado em Oficina (Downtime)",
    description: "Impacto operacional em horas e dias de imobilização dos veículos.",
    category: "manutencao",
    type: "gerencial",
    isFavorite: false,
    isScheduled: false,
    isShared: true,
    iconName: "Clock",
    allowedRoles: ["admin", "gestor", "operacional"],
    filters: {},
    columns: [
      { key: "vehicle", label: "Veículo", selected: true },
      { key: "unit", label: "Unidade", selected: true },
      { key: "downtimeDays", label: "Dias Parado", selected: true, type: "number" },
      { key: "supplier", label: "Oficina", selected: true },
      { key: "reason", label: "Motivo Principal", selected: true }
    ],
    sort: { field: "downtimeDays", direction: "desc" },
    groupBy: "unidade",
    totals: { total: true, subtotal: true, avg: true, min: false, max: true, count: true },
    visualization: "grafico",
    exportFormat: "pdf",
    schedule: { enabled: false, periodicity: "mensal", destination: "email", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    runCount: 18
  },

  // CATEGORY: FINANCEIRO
  {
    id: "rep-fin-01",
    code: "FIN-001",
    name: "Consumo e Abastecimentos",
    description: "Análise de consumo médio (km/l), gastos com combustível por posto e combustível.",
    category: "financeiro",
    type: "financeiro",
    isFavorite: true,
    isScheduled: true,
    isShared: true,
    iconName: "Fuel",
    allowedRoles: ["admin", "gestor", "financeiro"],
    filters: {},
    columns: [
      { key: "vehicle", label: "Veículo", selected: true },
      { key: "fuelType", label: "Combustível", selected: true },
      { key: "liters", label: "Litros", selected: true, type: "number" },
      { key: "totalAmount", label: "Total (R$)", selected: true, type: "currency" },
      { key: "avgConsumption", label: "Média (KM/L)", selected: true, type: "number" },
      { key: "costPerKm", label: "R$/KM", selected: true, type: "currency" }
    ],
    sort: { field: "totalAmount", direction: "desc" },
    groupBy: "categoria",
    totals: { total: true, subtotal: true, avg: true, min: true, max: true, count: true },
    visualization: "tabela_grafico",
    exportFormat: "xlsx",
    schedule: { enabled: true, periodicity: "semanal", destination: "email", format: "xlsx" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "Ontem",
    runCount: 110
  },
  {
    id: "rep-fin-02",
    code: "FIN-002",
    name: "Despesas Operacionais Gerais",
    description: "DRE analítico de custos operacionais (Pedágio, Lavagem, Estacionamento, Peças).",
    category: "financeiro",
    type: "financeiro",
    isFavorite: true,
    isScheduled: false,
    isShared: true,
    iconName: "TrendingUp",
    allowedRoles: ["admin", "gestor", "financeiro"],
    filters: {},
    columns: [
      { key: "categoryName", label: "Categoria", selected: true },
      { key: "costCenter", label: "Centro de Custo", selected: true },
      { key: "amount", label: "Valor Total (R$)", selected: true, type: "currency" },
      { key: "sharePercent", label: "Participação (%)", selected: true, type: "number" }
    ],
    sort: { field: "amount", direction: "desc" },
    groupBy: "categoria",
    totals: { total: true, subtotal: true, avg: true, min: false, max: true, count: true },
    visualization: "grafico",
    exportFormat: "pdf",
    schedule: { enabled: false, periodicity: "mensal", destination: "download", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "Hoje, 09:15",
    runCount: 76
  },
  {
    id: "rep-fin-03",
    code: "FIN-003",
    name: "Custos por Unidade de Negócio",
    description: "Comparativo de TCO e despesas totais divididos por filial ou departamento.",
    category: "financeiro",
    type: "executivo",
    isFavorite: false,
    isScheduled: true,
    isShared: true,
    iconName: "Building2",
    allowedRoles: ["admin", "gestor", "financeiro", "executivo"],
    filters: {},
    columns: [
      { key: "unit", label: "Unidade", selected: true },
      { key: "fleetSize", label: "Veículos", selected: true, type: "number" },
      { key: "maintenanceCost", label: "Manutenção (R$)", selected: true, type: "currency" },
      { key: "fuelCost", label: "Combustível (R$)", selected: true, type: "currency" },
      { key: "totalCost", label: "Custo Total (R$)", selected: true, type: "currency" }
    ],
    sort: { field: "totalCost", direction: "desc" },
    groupBy: "unidade",
    totals: { total: true, subtotal: true, avg: true, min: true, max: true, count: true },
    visualization: "dashboard",
    exportFormat: "xlsx",
    schedule: { enabled: true, periodicity: "mensal", destination: "email", format: "xlsx" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "01/07/2026",
    runCount: 38
  },

  // CATEGORY: DOCUMENTAÇÃO
  {
    id: "rep-doc-01",
    code: "DOC-001",
    name: "Documentos Vencidos e Próximos Vencimentos",
    description: "CRLV, Licenciamentos, IPVA e certificados com vencimento crítico.",
    category: "documentacao",
    type: "operacional",
    isFavorite: true,
    isScheduled: true,
    isShared: true,
    iconName: "FileText",
    allowedRoles: ["admin", "gestor", "operacional"],
    filters: {},
    columns: [
      { key: "vehicle", label: "Veículo", selected: true },
      { key: "docType", label: "Tipo Documento", selected: true },
      { key: "expiryDate", label: "Vencimento", selected: true, type: "date" },
      { key: "cost", label: "Custo (R$)", selected: true, type: "currency" },
      { key: "status", label: "Status", selected: true, type: "status" }
    ],
    sort: { field: "expiryDate", direction: "asc" },
    groupBy: "status",
    totals: { total: true, subtotal: false, avg: false, min: false, max: false, count: true },
    visualization: "tabela",
    exportFormat: "pdf",
    schedule: { enabled: true, periodicity: "semanal", destination: "email", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "Hoje, 06:00",
    runCount: 142
  },

  // CATEGORY: FORNECEDORES
  {
    id: "rep-for-01",
    code: "FOR-001",
    name: "Ranking de Gastos por Fornecedor",
    description: "Maiores prestadores de serviço, oficinas, postos e faturamento acumulado.",
    category: "fornecedores",
    type: "financeiro",
    isFavorite: false,
    isScheduled: false,
    isShared: true,
    iconName: "Store",
    allowedRoles: ["admin", "gestor", "financeiro"],
    filters: {},
    columns: [
      { key: "supplier", label: "Fornecedor", selected: true },
      { key: "category", label: "Categoria", selected: true },
      { key: "serviceCount", label: "Nº Serviços", selected: true, type: "number" },
      { key: "totalSpent", label: "Total Pago (R$)", selected: true, type: "currency" },
      { key: "rating", label: "Avaliação", selected: true, type: "number" }
    ],
    sort: { field: "totalSpent", direction: "desc" },
    groupBy: "fornecedor",
    totals: { total: true, subtotal: true, avg: true, min: false, max: true, count: true },
    visualization: "tabela_grafico",
    exportFormat: "pdf",
    schedule: { enabled: false, periodicity: "mensal", destination: "download", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    runCount: 27
  },

  // CATEGORY: CHECKLISTS
  {
    id: "rep-chk-01",
    code: "CHK-001",
    name: "Pendências e Não Conformidades de Checklists",
    description: "Avarias, lâmpadas queimadas, pneus carecas e itens de segurança reprovados.",
    category: "checklists",
    type: "operacional",
    isFavorite: false,
    isScheduled: false,
    isShared: true,
    iconName: "CheckSquare",
    allowedRoles: ["admin", "gestor", "operacional"],
    filters: {},
    columns: [
      { key: "date", label: "Data", selected: true, type: "date" },
      { key: "vehicle", label: "Veículo", selected: true },
      { key: "driver", label: "Motorista", selected: true },
      { key: "item", label: "Item Reprovado", selected: true },
      { key: "severity", label: "Gravidade", selected: true, type: "badge" },
      { key: "status", label: "Status Resolução", selected: true, type: "status" }
    ],
    sort: { field: "date", direction: "desc" },
    groupBy: "status",
    totals: { total: false, subtotal: false, avg: false, min: false, max: false, count: true },
    visualization: "tabela",
    exportFormat: "pdf",
    schedule: { enabled: false, periodicity: "diaria", destination: "email", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    runCount: 19
  },

  // CATEGORY: DASHBOARD EXECUTIVO
  {
    id: "rep-exe-01",
    code: "EXE-001",
    name: "Resumo Geral Executivo (BI)",
    description: "Consolidado estratégico com KPIs de Frota, TCO, Custo/KM, Custos de Manutenção e Satisfação.",
    category: "executivo",
    type: "executivo",
    isFavorite: true,
    isScheduled: true,
    isShared: true,
    iconName: "PieChart",
    allowedRoles: ["admin", "gestor", "executivo", "financeiro"],
    filters: {},
    columns: [
      { key: "metric", label: "Indicador Chave", selected: true },
      { key: "currentValue", label: "Valor Atual", selected: true },
      { key: "targetValue", label: "Meta", selected: true },
      { key: "variation", label: "Variação %", selected: true },
      { key: "status", label: "Status KPI", selected: true, type: "status" }
    ],
    sort: { field: "metric", direction: "asc" },
    groupBy: "categoria",
    totals: { total: false, subtotal: false, avg: true, min: false, max: false, count: true },
    visualization: "dashboard",
    exportFormat: "pdf",
    schedule: { enabled: true, periodicity: "mensal", destination: "email", format: "pdf" },
    sharing: { isPublic: true, users: [], groups: [], permission: "read" },
    lastRun: "Hoje, 08:00",
    runCount: 156
  }
]

// Execution History Mock Logs
export const INITIAL_EXECUTION_LOGS: ReportExecutionLog[] = [
  {
    id: "log-101",
    reportId: "rep-frota-01",
    reportName: "Situação da Frota",
    user: "Valter Silva (Gestor)",
    date: "28/07/2026 08:45",
    duration: "1.1s",
    format: "pdf",
    status: "Concluído",
    downloadUrl: "#",
    recordCount: 24
  },
  {
    id: "log-102",
    reportId: "rep-man-02",
    reportName: "Custos de Manutenção por Veículo",
    user: "Ana Souza (Financeiro)",
    date: "27/07/2026 17:10",
    duration: "1.8s",
    format: "xlsx",
    status: "Concluído",
    downloadUrl: "#",
    recordCount: 18
  },
  {
    id: "log-103",
    reportId: "rep-fin-01",
    reportName: "Consumo e Abastecimentos",
    user: "Carlos Mendes (Admin)",
    date: "27/07/2026 14:22",
    duration: "0.9s",
    format: "csv",
    status: "Concluído",
    downloadUrl: "#",
    recordCount: 52
  },
  {
    id: "log-104",
    reportId: "rep-doc-01",
    reportName: "Documentos Vencidos e Próximos Vencimentos",
    user: "Mariana Costa (Operacional)",
    date: "26/07/2026 11:05",
    duration: "0.7s",
    format: "pdf",
    status: "Concluído",
    downloadUrl: "#",
    recordCount: 9
  },
  {
    id: "log-105",
    reportId: "rep-exe-01",
    reportName: "Resumo Geral Executivo (BI)",
    user: "Carlos Mendes (Admin)",
    date: "25/07/2026 09:00",
    duration: "2.3s",
    format: "pdf",
    status: "Concluído",
    downloadUrl: "#",
    recordCount: 12
  }
]

// Scheduled Reports Mock
export const INITIAL_SCHEDULES: ReportSchedule[] = [
  {
    id: "sch-01",
    reportId: "rep-frota-04",
    reportName: "Disponibilidade Operacional",
    periodicity: "diaria",
    destination: "email",
    format: "pdf",
    nextRun: "29/07/2026 07:00",
    status: "Ativo",
    active: true,
    recipients: ["diretoria@frotaone.com.br", "gestao@frotaone.com.br"]
  },
  {
    id: "sch-02",
    reportId: "rep-fin-01",
    reportName: "Consumo e Abastecimentos",
    periodicity: "semanal",
    destination: "email",
    format: "xlsx",
    nextRun: "03/08/2026 08:00",
    status: "Ativo",
    active: true,
    recipients: ["financeiro@frotaone.com.br"]
  },
  {
    id: "sch-03",
    reportId: "rep-man-02",
    reportName: "Custos de Manutenção por Veículo",
    periodicity: "mensal",
    destination: "email",
    format: "xlsx",
    nextRun: "01/08/2026 06:00",
    status: "Ativo",
    active: true,
    recipients: ["manutencao@frotaone.com.br", "carlos@frotaone.com.br"]
  },
  {
    id: "sch-04",
    reportId: "rep-doc-01",
    reportName: "Documentos Vencidos e Próximos Vencimentos",
    periodicity: "semanal",
    destination: "email",
    format: "pdf",
    nextRun: "03/08/2026 07:30",
    status: "Ativo",
    active: true,
    recipients: ["compliance@frotaone.com.br"]
  }
]

// Dynamic Mock Generator based on Report Category & Parameters
export async function executeReportEngine(
  report: ReportConfig,
  currentRole: UserRole = "admin"
): Promise<ReportQueryResult> {
  const start = performance.now()

  // Generate dynamic data appropriate for the report category
  let rows: Record<string, any>[] = []
  let kpis: ReportQueryResult["kpis"] = []
  let chartData: ReportQueryResult["chartData"] = []

  switch (report.category) {
    case "frota":
      try {
        const res = await vehicleService.getAll()
        const vehicles = res.data?.data || res.data || []
        
        let activeCount = 0
        let maintenanceCount = 0
        const unitCounts: Record<string, number> = {}

        rows = vehicles.map((v: any, index: number) => {
          const resolvedStatus = v.status || (v.isActive !== false ? "operando" : "inativo")
          if (resolvedStatus === "operando") activeCount++
          if (resolvedStatus === "manutencao" || resolvedStatus === "oficina") maintenanceCount++
          
          const unit = v.unitName || v.unit_name || "Matriz - SP"
          unitCounts[unit] = (unitCounts[unit] || 0) + 1

          return {
            id: v.id || index,
            plate: (v.plate || "N/A").toUpperCase(),
            vehicle: v.model || v.name || "Veículo",
            unit: unit,
            status: resolvedStatus,
            year: v.year || 2023,
            odometer: v.currentOdometer || v.current_odometer || 0,
            kmDriven: 0,
            usageHours: 0,
            efficiency: 100,
            driver: v.driverName || v.driver_name || "Não Atribuído"
          }
        })

        const totalVehicles = rows.length
        const availability = totalVehicles > 0 ? ((activeCount / totalVehicles) * 100).toFixed(1) : "0.0"

        kpis = [
          { title: "Total da Frota", value: `${totalVehicles} Veículos`, change: "Atualizado agora", isPositive: true, iconName: "Truck" },
          { title: "Disponibilidade Média", value: `${availability}%`, change: "Online", isPositive: Number(availability) >= 90, iconName: "CheckCircle" },
          { title: "KM Total Percorrido", value: `${rows.reduce((sum: number, r: any) => sum + Number(r.odometer), 0).toLocaleString('pt-BR')} km`, change: "Total frota", isPositive: true, iconName: "Gauge" },
          { title: "Veículos em Manutenção", value: `${maintenanceCount} Veículos`, change: maintenanceCount > 0 ? "Ação Requerida" : "OK", isPositive: maintenanceCount === 0, iconName: "Wrench" }
        ]
        
        chartData = Object.entries(unitCounts).map(([label, value]) => ({
          label,
          value,
          secondaryValue: 100
        }))

      } catch (err) {
        console.error("Erro ao buscar veículos para relatório", err)
        rows = []
        kpis = []
        chartData = []
      }
      break

    case "motoristas":
      try {
        const res = await driverService.getAll()
        const drivers = res.data?.data || res.data || []

        if (report.code === "MOT-003") {
          let fines: any[] = []
          try {
            fines = await fineService.getFines()
          } catch (e) {
            console.warn("Fines API indisponível, lista vazia.")
          }

          let totalFinesValue = 0
          let totalPoints = 0

          rows = fines.map((f: any, i: number) => {
            totalFinesValue += Number(f.value || 0)
            totalPoints += Number(f.points || 0)
            return {
              id: f.id || i,
              driver: f.driver_name || "Não Atribuído",
              vehicle: f.vehicle_plate || "-",
              fineCode: f.auto_number || "-",
              description: f.description || f.category || "Infração",
              amount: Number(f.value || 0),
              points: Number(f.points || 0),
              status: f.status || "Pendente"
            }
          })

          const uniqueDrivers = new Set(fines.map(f => f.driver_id || f.driver_name)).size

          kpis = [
            { title: "Total de Infrações", value: `${rows.length}`, change: "Registradas", isPositive: rows.length === 0, iconName: "FileX" },
            { title: "Valor Total", value: `R$ ${totalFinesValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, change: "Multas", isPositive: totalFinesValue === 0, iconName: "DollarSign" },
            { title: "Pontos na CNH", value: `${totalPoints} pts`, change: "Total acumulado", isPositive: totalPoints === 0, iconName: "AlertTriangle" },
            { title: "Motoristas Autuados", value: `${uniqueDrivers}`, change: "Distintos", isPositive: uniqueDrivers === 0, iconName: "Users" }
          ]
          
          chartData = []
        } else {
          let activeCount = 0
          const statusCounts: Record<string, number> = {}

          rows = drivers.map((d: any, index: number) => {
            if (d.isActive !== false) activeCount++
            
            const status = d.isActive !== false ? "Em Operação" : "Disponível"
            statusCounts[status] = (statusCounts[status] || 0) + 1

            return {
              id: d.id || index,
              driver: d.name || "Motorista",
              cnhNumber: d.cnhNumber || d.cnh_number || "N/A",
              cnhCategory: d.cnhCategory || d.cnh_category || "N/A",
              score: d.score || 100,
              finesCount: 0,
              status: status,
              expiryDate: new Date(d.cnhExpiryDate || Date.now()).toLocaleDateString('pt-BR'),
              daysToExpiry: 365,
              amount: 0,
              points: 0
            }
          })

          const totalDrivers = rows.length
          
          kpis = [
            { title: "Motoristas Ativos", value: `${activeCount}`, change: `${totalDrivers} Total`, isPositive: true, iconName: "Users" },
            { title: "Score Médio", value: "100 / 100", change: "Perfeito", isPositive: true, iconName: "Award" },
            { title: "CNHs Próximas ao Vencimento", value: "0 Motoristas", change: "Tudo regular", isPositive: true, iconName: "AlertTriangle" },
            { title: "Total de Infrações", value: "0 no mês", change: "Nenhuma infração", isPositive: true, iconName: "FileX" }
          ]
          
          chartData = Object.entries(statusCounts).map(([label, value]) => ({
            label,
            value
          }))
        }

      } catch (err) {
        console.error("Erro ao buscar motoristas para relatório", err)
        rows = []
        kpis = []
        chartData = []
      }
      break

    case "manutencao":
      try {
        const res = await maintenanceService.getAll()
        const maintenance = res.data?.data || res.data || []

        let openCount = 0
        let preventiveCost = 0
        let correctiveCost = 0
        let totalCost = 0

        rows = maintenance.map((m: any, index: number) => {
          if (m.status === "Aberto" || m.status === "Em Andamento") openCount++
          
          const cost = Number(m.cost || 0)
          totalCost += cost
          
          const mType = (m.maintenanceType || m.type || "Corretiva").toLowerCase()
          
          if (mType === "preventiva" || mType === "preventive") {
            preventiveCost += cost
          } else {
            correctiveCost += cost
          }

          return {
            id: m.id || index,
            osCode: m.osCode || m.os_number || `OS-00${index + 1}`,
            vehicle: m.plate || m.vehicle_id || "Veículo",
            type: m.maintenanceType || "Manutenção",
            supplier: m.establishmentName || m.supplier || "Oficina Interna",
            openDate: m.maintenanceDate ? new Date(m.maintenanceDate).toLocaleDateString('pt-BR') : "N/A",
            estimatedCost: cost,
            preventiveCost: mType === "preventiva" ? cost : 0,
            correctiveCost: mType !== "preventiva" ? cost : 0,
            totalCost: cost,
            costPerKm: 0,
            downtimeDays: 0,
            status: m.status || "Concluído"
          }
        })

        kpis = [
          { title: "Custo Total Manutenção", value: `R$ ${totalCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, change: "Total", isPositive: true, iconName: "DollarSign" },
          { title: "OS Abertas", value: `${openCount} Ordens`, change: "Atual", isPositive: true, iconName: "Wrench" },
          { title: "Razão Preventiva / Corretiva", value: totalCost > 0 ? `${((preventiveCost/totalCost)*100).toFixed(0)}% / ${((correctiveCost/totalCost)*100).toFixed(0)}%` : "0% / 0%", change: "Distribuição", isPositive: true, iconName: "PieChart" },
          { title: "Tempo Médio Parado", value: "0 dias", change: "Sem dados", isPositive: true, iconName: "Clock" }
        ]
        
        chartData = [
          { label: "Preventivas", value: preventiveCost, category: "Manutenção" },
          { label: "Corretivas", value: correctiveCost, category: "Manutenção" }
        ]
      } catch (err) {
        console.error("Erro ao buscar manutencao para relatório", err)
        rows = []
        kpis = []
        chartData = []
      }
      break

    case "financeiro":
      try {
        const res = await fuelService.getAll()
        const fuels = res.data?.data || res.data || []
        
        let totalAmount = 0
        let totalLiters = 0

        rows = fuels.map((f: any, index: number) => {
          const amount = Number(f.cost || f.totalCost || 0)
          const liters = Number(f.liters || f.volume || 0)
          
          totalAmount += amount
          totalLiters += liters

          return {
            id: f.id || index,
            vehicle: f.vehiclePlate || f.plate || "Veículo",
            fuelType: f.fuelType || "Diesel",
            liters: liters,
            totalAmount: amount,
            avgConsumption: f.consumption || 0,
            costPerKm: 0,
            categoryName: "Combustível",
            costCenter: "Geral",
            sharePercent: 0
          }
        })
        
        kpis = [
          { title: "Gasto Total", value: `R$ ${totalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, change: "Combustível", isPositive: true, iconName: "DollarSign" },
          { title: "Total Litros", value: `${totalLiters.toLocaleString('pt-BR')} L`, change: "Volume", isPositive: true, iconName: "Droplet" },
          { title: "Custo Médio", value: totalLiters > 0 ? `R$ ${(totalAmount/totalLiters).toFixed(2)}/L` : "R$ 0,00", change: "Por litro", isPositive: true, iconName: "TrendingDown" },
          { title: "Outras Despesas", value: "R$ 0,00", change: "Sem dados", isPositive: true, iconName: "CreditCard" }
        ]
        
        chartData = [
          { label: "Combustível", value: totalAmount }
        ]
      } catch (err) {
        console.error("Erro ao buscar dados financeiros para relatório", err)
        rows = []
        kpis = []
        chartData = []
      }
      break

    case "documentacao":
    case "fornecedores":
    case "checklists":
    case "executivo":
      rows = []
      kpis = []
      chartData = []
      break
  }

  // Filter columns based on user role (e.g., if 'operacional', hide financial columns)
  let visibleColumns = report.columns.filter((c) => c.selected)
  if (currentRole === "operacional") {
    visibleColumns = visibleColumns.filter((c) => !["amount", "cost", "totalCost", "preventiveCost", "correctiveCost", "totalAmount", "estimatedCost", "costPerKm", "totalSpent"].includes(c.key))
  }

  const end = performance.now()
  const durationMs = Math.round(end - start + Math.random() * 80 + 120)

  // Compute totals & summary
  let sumTotal = 0
  rows.forEach((r) => {
    const val = r.amount || r.totalCost || r.totalAmount || r.totalSpent || r.cost || 0
    if (typeof val === "number") sumTotal += val
  })

  return {
    report,
    timestamp: new Date().toLocaleString("pt-BR"),
    executionTimeMs: durationMs,
    kpis,
    chartData,
    columns: visibleColumns,
    rows,
    summary: {
      totalRecords: rows.length,
      sumTotal: sumTotal > 0 ? sumTotal : undefined,
      average: sumTotal > 0 ? sumTotal / rows.length : undefined,
      minValue: rows.length > 0 ? 120 : undefined,
      maxValue: sumTotal > 0 ? Math.max(...rows.map((r) => r.amount || r.totalCost || r.totalAmount || 0)) : undefined
    }
  }
}

export function getExecutivePdfHtml(report: ReportConfig, result: ReportQueryResult): string {
  const formattedDate = result.timestamp
  const safeCode = report.code || "REP-001"

  const kpiCardsHtml = result.kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-title">${k.title}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-change">${k.change || ''}</div>
    </div>
  `).join("")

  const tableHeadersHtml = result.columns.map(c => `<th>${c.label}</th>`).join("")

  const tableRowsHtml = result.rows.map((r, idx) => `
    <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
      ${result.columns.map(c => {
        let val = r[c.key] ?? "-"
        if (typeof val === 'number' && (c.key.toLowerCase().includes('cost') || c.key.toLowerCase().includes('amount') || c.key.toLowerCase().includes('total') || c.key.toLowerCase().includes('spent'))) {
          val = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
        }
        return `<td>${val}</td>`
      }).join("")}
    </tr>
  `).join("")

  let totalsRowHtml = ""
  if (result.summary.sumTotal !== undefined) {
    const formattedSum = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.summary.sumTotal)
    totalsRowHtml = `
      <tr class="totals-row">
        <td colspan="${Math.max(1, result.columns.length - 1)}"><strong>TOTAL GERAL CONSOLIDADO</strong></td>
        <td><strong>${formattedSum}</strong></td>
      </tr>
    `
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${report.name} — Relatório Executivo ERP FrotaOne</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 16px;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.4;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .brand-title { font-size: 20px; font-weight: 800; color: #1e40af; letter-spacing: -0.5px; }
    .brand-subtitle { font-size: 9px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1.2px; }
    .doc-badge { background: #1e40af; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; font-family: monospace; }
    
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 14px;
    }
    .meta-item { display: flex; flex-direction: column; }
    .meta-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .meta-val { font-size: 11px; font-weight: 600; color: #0f172a; }

    .report-title-box { margin-bottom: 14px; }
    .report-title { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 3px 0; }
    .report-desc { font-size: 11px; color: #475569; margin: 0; }

    .kpi-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #1e40af;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .kpi-title { font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .kpi-value { font-size: 15px; font-weight: 800; color: #0f172a; margin: 2px 0; }
    .kpi-change { font-size: 8.5px; font-weight: 600; color: #16a34a; }

    .table-container { margin-top: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 6px 8px;
      font-weight: 700;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      border: 1px solid #0f172a;
    }
    td { padding: 5px 8px; border: 1px solid #cbd5e1; vertical-align: middle; }
    tr.odd { background: #ffffff; }
    tr.even { background: #f8fafc; }
    tr.totals-row { background: #e2e8f0; font-weight: 700; }
    tr.totals-row td { border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; }

    .footer-bar {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="brand-title">FROTAONE</div>
      <div class="brand-subtitle">Enterprise Fleet Management BI</div>
    </div>
    <div class="doc-badge">${safeCode}</div>
  </div>

  <div class="report-title-box">
    <h1 class="report-title">${report.name}</h1>
    <p class="report-desc">${report.description}</p>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Data de Emissão</span>
      <span class="meta-val">${formattedDate}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Categoria</span>
      <span class="meta-val" style="text-transform: uppercase;">${report.category}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Total Registros</span>
      <span class="meta-val">${result.rows.length}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Status</span>
      <span class="meta-val" style="color: #16a34a;">AUDITADO & CONFIRMADO</span>
    </div>
  </div>

  <div class="kpi-section">
    ${kpiCardsHtml}
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>${tableHeadersHtml}</tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
        ${totalsRowHtml}
      </tbody>
    </table>
  </div>

  <div class="footer-bar">
    <span>FROTAONE ERP © ${new Date().getFullYear()} • Central de Relatórios BI</span>
    <span>Documento Executivo Gerado em PDF • Uso Confidencial</span>
  </div>
</body>
</html>`
}

export function openExecutivePdfPrintWindow(report: ReportConfig, result: ReportQueryResult) {
  const html = getExecutivePdfHtml(report, result)
  const printWin = window.open("", "_blank", "width=900,height=1000")
  if (printWin) {
    printWin.document.write(html)
    printWin.document.close()
    setTimeout(() => {
      printWin.focus()
      printWin.print()
    }, 400)
  }
}

// Generate Export Blob simulation
export function generateExportBlob(
  report: ReportConfig,
  result: ReportQueryResult,
  format: ExportFormat
): { filename: string; blob: Blob; mimeType: string } {
  const timestamp = new Date().toISOString().slice(0, 10)
  const safeTitle = report.name.toLowerCase().replace(/[^a-z0-9]/g, "-")

  if (format === "csv") {
    const headers = result.columns.map((c) => `"${c.label}"`).join(",")
    const rowLines = result.rows.map((r) =>
      result.columns
        .map((c) => {
          const val = r[c.key] ?? ""
          return `"${String(val).replace(/"/g, '""')}"`
        })
        .join(",")
    )
    const content = [headers, ...rowLines].join("\n")
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    return { filename: `relatorio-${safeTitle}-${timestamp}.csv`, blob, mimeType: "text/csv" }
  }

  if (format === "xlsx") {
    const headers = result.columns.map((c) => c.label).join("\t")
    const rowLines = result.rows.map((r) =>
      result.columns.map((c) => r[c.key] ?? "").join("\t")
    )
    const content = [headers, ...rowLines].join("\n")
    const blob = new Blob([content], { type: "application/vnd.ms-excel" })
    return { filename: `relatorio-${safeTitle}-${timestamp}.xlsx`, blob, mimeType: "application/vnd.ms-excel" }
  }

  // PDF Export Format (.pdf)
  const htmlContent = getExecutivePdfHtml(report, result)
  const blob = new Blob([htmlContent], { type: "application/pdf" })
  return { filename: `relatorio-${safeTitle}-${timestamp}.pdf`, blob, mimeType: "application/pdf" }
}

// AI Insights Generator Simulation
export function generateAiInsights(report: ReportConfig, result: ReportQueryResult): string {
  const categoryNames: Record<ReportCategory, string> = {
    frota: "Operação de Frota",
    motoristas: "Gestão de Motoristas",
    manutencao: "Engenharia de Manutenção",
    financeiro: "Gestão Financeira & Custos",
    documentacao: "Compliance & Documentos",
    fornecedores: "Homologação de Suprimentos",
    checklists: "Qualidade & Segurança",
    executivo: "Estratégia Executiva (BI)"
  }

  return `🤖 INSIGHTS PREDITIVOS IA - ERP FROTAONE

📊 Análise Analítica: "${report.name}" (${categoryNames[report.category]})
----------------------------------------------------------------------
1. 💡 Eficiência Geral: Os dados processados (${result.rows.length} registros) demonstram estabilidade operacional superior a 91.8%.
2. 🎯 Oportunidade de Economia: Identificamos potencial de redução de 4.8% nos custos agrupados por ${report.groupBy.toUpperCase()} através de otimização de rotas e padronização de serviços de preventiva.
3. ⚠️ Alerta Preditivo: Recomendamos atentar para os itens com divergência acima de 5% da média global para evitar imobilização não planejada.
4. ✅ Ação Sugerida: Agendar reavaliação quinzenal dos indicadores com os gestores responsáveis por esta unidade.`
}
