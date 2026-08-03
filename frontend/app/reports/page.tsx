"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Calendar,
  Download,
  Star,
  Search,
  Filter,
  Play,
  Settings,
  Clock,
  CheckCircle2,
  Share2,
  ShieldAlert,
  FileSpreadsheet,
  FileText,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  UserCheck
} from "lucide-react"

import { AppLayout } from "../../components/layout/AppLayout"
import { PageHeader } from "../../components/ui/page-header"
import { MetricCard } from "../../components/ui/metric-card"
import { ReportCard } from "../../components/ui/report-card"
import { CategoryCard } from "../../components/ui/category-card"
import { DataTable } from "../../components/ui/data-table"
import { Toolbar } from "../../components/ui/toolbar"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"

import { ReportConfigSheet } from "../../components/reports/report-config-sheet"
import { ReportPreview } from "../../components/reports/report-preview"

import {
  ReportConfig,
  ReportCategory,
  ReportExecutionLog,
  ReportSchedule,
  UserRole,
  ReportQueryResult
} from "../../types/reports"

import {
  DEFAULT_REPORTS,
  INITIAL_EXECUTION_LOGS,
  INITIAL_SCHEDULES,
  executeReportEngine
} from "../../services/report-engine"

import { useSearchParams } from "next/navigation"

export function ReportsContent() {
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get("search") || ""

  // State management
  const [isExecuting, setIsExecuting] = React.useState(false)
  const [reports, setReports] = React.useState<ReportConfig[]>(DEFAULT_REPORTS)
  const [executionLogs, setExecutionLogs] = React.useState<ReportExecutionLog[]>([])
  const [schedules, setSchedules] = React.useState<ReportSchedule[]>([])

  // Active View Mode: "hub" | "preview"
  const [viewMode, setViewMode] = React.useState<"hub" | "preview">("hub")
  const [activeQueryResult, setActiveQueryResult] = React.useState<ReportQueryResult | null>(null)

  // Filters & Controls
  const [currentRole, setCurrentRole] = React.useState<UserRole>("admin")
  const [selectedCategory, setSelectedCategory] = React.useState<ReportCategory | "todos">("todos")
  const [searchValue, setSearchValue] = React.useState(urlSearch)
  const [activeBlockTab, setActiveBlockTab] = React.useState("biblioteca")

  React.useEffect(() => {
    if (urlSearch) {
      setSearchValue(urlSearch)
    }
  }, [urlSearch])

  // Sheet Controls
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [selectedReportForConfig, setSelectedReportForConfig] = React.useState<ReportConfig | null>(null)

  // Filter reports based on category, search, and user role permissions
  const filteredReports = React.useMemo(() => {
    return reports.filter((rep) => {
      // Category filter
      if (selectedCategory !== "todos" && rep.category !== selectedCategory) return false

      // Role RBAC filter
      if (!rep.allowedRoles.includes(currentRole) && currentRole !== "admin") return false

      // Search filter
      if (searchValue.trim() !== "") {
        const query = searchValue.toLowerCase()
        const matchesName = rep.name.toLowerCase().includes(query)
        const matchesDesc = rep.description.toLowerCase().includes(query)
        const matchesCode = rep.code.toLowerCase().includes(query)
        if (!matchesName && !matchesDesc && !matchesCode) return false
      }

      return true
    })
  }, [reports, selectedCategory, currentRole, searchValue])

  const favoriteReports = React.useMemo(() => {
    return filteredReports.filter((r) => r.isFavorite)
  }, [filteredReports])

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { todos: reports.length }
    reports.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1
    })
    return counts
  }, [reports])

  // Handlers
  const handleExecuteReport = async (report: ReportConfig) => {
    setIsExecuting(true)
    try {
      const result = await executeReportEngine(report, currentRole)
      setActiveQueryResult(result)
      setViewMode("preview")

      // Record in history log
    const newLog: ReportExecutionLog = {
      id: `log-${Date.now()}`,
      reportId: report.id,
      reportName: report.name,
      user: `Usuário (${currentRole.toUpperCase()})`,
      date: new Date().toLocaleString("pt-BR"),
      duration: `${(result.executionTimeMs / 1000).toFixed(1)}s`,
      format: report.exportFormat,
      status: "Concluído",
      recordCount: result.rows.length
    }

    setExecutionLogs((prev) => [newLog, ...prev])
    } catch (error) {
      console.error("Erro ao executar o relatório", error)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleOpenConfig = (report: ReportConfig) => {
    setSelectedReportForConfig(report)
    setIsSheetOpen(true)
  }

  const handleCreateNewReport = () => {
    const newReport: ReportConfig = {
      id: `rep-new-${Date.now()}`,
      code: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      name: "Novo Relatório Personalizado",
      description: "Relatório customizado parametrizado.",
      category: "frota",
      type: "operacional",
      isFavorite: false,
      isScheduled: false,
      isShared: false,
      filters: {},
      columns: [
        { key: "plate", label: "Placa", selected: true },
        { key: "vehicle", label: "Veículo", selected: true },
        { key: "unit", label: "Unidade", selected: true },
        { key: "status", label: "Status", selected: true }
      ],
      sort: { field: "plate", direction: "asc" },
      groupBy: "none",
      totals: { total: true, subtotal: false, avg: true, min: false, max: false, count: true },
      visualization: "tabela_grafico",
      exportFormat: "pdf",
      schedule: { enabled: false, periodicity: "semanal", destination: "email", format: "pdf" },
      sharing: { isPublic: false, users: [], groups: [], permission: "read" },
      allowedRoles: ["admin", "gestor", "operacional", "financeiro"]
    }
    setSelectedReportForConfig(newReport)
    setIsSheetOpen(true)
  }

  const handleDuplicateReport = (report: ReportConfig) => {
    const cloned: ReportConfig = {
      ...report,
      id: `rep-clone-${Date.now()}`,
      code: `${report.code}-COPY`,
      name: `${report.name} (Cópia)`,
      isFavorite: false
    }
    setReports((prev) => [cloned, ...prev])
  }

  const handleToggleFavorite = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, isFavorite: !r.isFavorite } : r))
    )
  }

  const handleSaveConfig = (updated: ReportConfig) => {
    setReports((prev) => {
      const exists = prev.some((r) => r.id === updated.id)
      if (exists) {
        return prev.map((r) => (r.id === updated.id ? updated : r))
      }
      return [updated, ...prev]
    })
    setIsSheetOpen(false)
  }

  const handleSaveAndExecute = async (updated: ReportConfig) => {
    handleSaveConfig(updated)
    await handleExecuteReport(updated)
  }

  // Execution History Table Columns
  const historyColumns: ColumnDef<ReportExecutionLog>[] = [
    {
      accessorKey: "reportName",
      header: "Nome do Relatório",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{row.getValue("reportName")}</span>
      )
    },
    { accessorKey: "user", header: "Usuário" },
    { accessorKey: "date", header: "Data / Hora" },
    { accessorKey: "duration", header: "Tempo" },
    {
      accessorKey: "format",
      header: "Formato",
      cell: ({ row }) => (
        <Badge variant="outline" className="uppercase font-mono text-[10px]">
          {row.getValue("format")}
        </Badge>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
          {row.getValue("status")}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Download",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-primary gap-1"
          onClick={() => {
            const target = reports.find((r) => r.id === row.original.reportId) || reports[0]
            handleExecuteReport(target)
          }}
        >
          <Download className="h-3 w-3" /> Baixar
        </Button>
      )
    }
  ]

  // Schedules Table Columns
  const scheduleColumns: ColumnDef<ReportSchedule>[] = [
    {
      accessorKey: "reportName",
      header: "Nome do Relatório",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{row.getValue("reportName")}</span>
      )
    },
    {
      accessorKey: "periodicity",
      header: "Periodicidade",
      cell: ({ row }) => (
        <span className="capitalize font-medium text-foreground">
          {row.getValue("periodicity")}
        </span>
      )
    },
    {
      accessorKey: "destination",
      header: "Destino",
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">{row.getValue("destination")}</span>
      )
    },
    {
      accessorKey: "format",
      header: "Formato",
      cell: ({ row }) => (
        <Badge variant="outline" className="uppercase font-mono text-[10px]">
          {row.getValue("format")}
        </Badge>
      )
    },
    { accessorKey: "nextRun", header: "Próxima Execução" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
          {row.getValue("status")}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-primary gap-1"
            onClick={() => {
              const target = reports.find((r) => r.id === row.original.reportId) || reports[0]
              handleExecuteReport(target)
            }}
          >
            <Play className="h-3 w-3 fill-current" /> Executar Agora
          </Button>
        </div>
      )
    }
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-6">
        {isExecuting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 bg-card p-6 rounded-2xl shadow-xl border">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-bold text-lg">Processando Relatório...</h3>
                <p className="text-sm text-muted-foreground">Buscando e cruzando dados em tempo real</p>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW MODE VIEW */}
        {viewMode === "preview" && activeQueryResult ? (
          <ReportPreview
            queryResult={activeQueryResult}
            onBack={() => setViewMode("hub")}
            onEditFilters={() => handleOpenConfig(activeQueryResult.report)}
            onDuplicate={() => handleDuplicateReport(activeQueryResult.report)}
            onSaveConfig={() => handleSaveConfig(activeQueryResult.report)}
          />
        ) : (
          /* CENTRAL HUB MAIN VIEW */
          <>
            {/* CABEÇALHO DA PÁGINA */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full border-b border-border/40 pb-4">
              <div className="flex-1 min-w-0">
                <PageHeader
                  breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Relatórios" }
                  ]}
                  title="Central de Relatórios"
                  description="Crie, personalize, exporte e compartilhe relatórios operacionais e financeiros da frota."
                />
              </div>

              {/* ACTION BUTTONS IN A SINGLE LINE */}
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto max-w-full py-1 shrink-0 scrollbar-none">
                {/* ROLE RBAC SWITCHER (SIMULATION WIDGET) */}
                <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded-xl border border-border/60 text-xs shrink-0">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-muted-foreground">Perfil:</span>
                  <select
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                    className="bg-background border border-border rounded-lg text-xs font-semibold px-2 py-1 text-foreground focus:outline-none"
                  >
                    <option value="admin">Administrador</option>
                    <option value="gestor">Gestor</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="operacional">Operacional</option>
                  </select>
                </div>

                <Button
                  size="sm"
                  onClick={handleCreateNewReport}
                  className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shrink-0"
                >
                  <Plus className="h-4 w-4" /> Novo Relatório
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveBlockTab("agendamentos")}
                  className="h-9 text-xs gap-1.5 shrink-0"
                >
                  <Calendar className="h-4 w-4 text-blue-500" /> Agendamentos
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const firstFav = favoriteReports[0] || reports[0]
                    handleExecuteReport(firstFav)
                  }}
                  className="h-9 text-xs gap-1.5 shrink-0"
                >
                  <Download className="h-4 w-4 text-emerald-500" /> Exportar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveBlockTab("favoritos")}
                  className="h-9 text-xs gap-1.5 shrink-0"
                >
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Favoritos
                </Button>
              </div>
            </div>

            {/* PRIMEIRA LINHA: METRIC CARDS (6 KPIS) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard
                title="Executados Hoje"
                value={executionLogs.length}
                trend={executionLogs.length}
                trendLabel="Hoje"
              />
              <MetricCard
                title="Relatórios Agendados"
                value={schedules.length}
                trend={0}
                trendLabel="Ativos"
              />
              <MetricCard
                title="Favoritos"
                value={reports.filter((r) => r.isFavorite).length}
                trend={0}
                trendLabel="Salvos"
              />
              <MetricCard
                title="Compartilhados"
                value={reports.filter((r) => r.isShared).length}
                trend={0}
                trendLabel="com equipe"
              />
              <MetricCard
                title="Tempo Médio"
                value={executionLogs.length > 0 ? `${(executionLogs.reduce((acc, log) => acc + parseFloat(log.duration), 0) / executionLogs.length).toFixed(1)}s` : "0s"}
                trend={0}
                trendLabel="Geração rápida"
              />
              <MetricCard
                title="Exportações"
                value={executionLogs.length} // Assumindo exportação ao executar
                trend={0}
                trendLabel="Este mês"
              />
            </div>

            {/* NAVBAR TABS (4 BLOCKS) & CATEGORY FILTERS */}
            <div className="space-y-4">
              <Tabs
                value={activeBlockTab}
                onValueChange={setActiveBlockTab}
                className="w-full"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/50 pb-2">
                  <TabsList className="bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="favoritos" className="text-xs gap-1.5 py-1.5 font-bold">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Relatórios Favoritos
                    </TabsTrigger>
                    <TabsTrigger value="biblioteca" className="text-xs gap-1.5 py-1.5 font-bold">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Biblioteca de Relatórios
                    </TabsTrigger>
                    <TabsTrigger value="historico" className="text-xs gap-1.5 py-1.5 font-bold">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Histórico de Execução
                    </TabsTrigger>
                    <TabsTrigger value="agendamentos" className="text-xs gap-1.5 py-1.5 font-bold">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" /> Agendamentos
                    </TabsTrigger>
                  </TabsList>

                  {/* TOOLBAR SEARCH & DENSITY */}
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Buscar relatório..."
                      className="w-full pl-9 pr-4 py-1.5 text-xs border border-border bg-card rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* CATEGORIES CARDS (FOR BIBLIOTECA & FAVORITOS) */}
                {(activeBlockTab === "biblioteca" || activeBlockTab === "favoritos") && (
                  <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
                    <CategoryCard
                      category="todos"
                      label="Todos"
                      count={categoryCounts.todos || 0}
                      isActive={selectedCategory === "todos"}
                      onClick={() => setSelectedCategory("todos")}
                    />
                    <CategoryCard
                      category="frota"
                      label="Frota"
                      count={categoryCounts.frota || 0}
                      isActive={selectedCategory === "frota"}
                      onClick={() => setSelectedCategory("frota")}
                    />
                    <CategoryCard
                      category="motoristas"
                      label="Motoristas"
                      count={categoryCounts.motoristas || 0}
                      isActive={selectedCategory === "motoristas"}
                      onClick={() => setSelectedCategory("motoristas")}
                    />
                    <CategoryCard
                      category="manutencao"
                      label="Manutenção"
                      count={categoryCounts.manutencao || 0}
                      isActive={selectedCategory === "manutencao"}
                      onClick={() => setSelectedCategory("manutencao")}
                    />
                    <CategoryCard
                      category="financeiro"
                      label="Financeiro"
                      count={categoryCounts.financeiro || 0}
                      isActive={selectedCategory === "financeiro"}
                      onClick={() => setSelectedCategory("financeiro")}
                    />
                    <CategoryCard
                      category="documentacao"
                      label="Documentação"
                      count={categoryCounts.documentacao || 0}
                      isActive={selectedCategory === "documentacao"}
                      onClick={() => setSelectedCategory("documentacao")}
                    />
                    <CategoryCard
                      category="fornecedores"
                      label="Fornecedores"
                      count={categoryCounts.fornecedores || 0}
                      isActive={selectedCategory === "fornecedores"}
                      onClick={() => setSelectedCategory("fornecedores")}
                    />
                    <CategoryCard
                      category="checklists"
                      label="Checklists"
                      count={categoryCounts.checklists || 0}
                      isActive={selectedCategory === "checklists"}
                      onClick={() => setSelectedCategory("checklists")}
                    />
                    <CategoryCard
                      category="executivo"
                      label="Executivo"
                      count={categoryCounts.executivo || 0}
                      isActive={selectedCategory === "executivo"}
                      onClick={() => setSelectedCategory("executivo")}
                    />
                  </div>
                )}

                {/* BLOCO 1: FAVORITOS */}
                <TabsContent value="favoritos" className="pt-2">
                  {favoriteReports.length === 0 ? (
                    <div className="p-8 text-center bg-card border rounded-2xl space-y-2">
                      <Star className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <h3 className="text-sm font-bold text-foreground">Nenhum favorito selecionado</h3>
                      <p className="text-xs text-muted-foreground">
                        Clique na estrela dos relatórios da biblioteca para destacá-los nesta seção.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {favoriteReports.map((report) => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          onExecute={handleExecuteReport}
                          onConfigure={handleOpenConfig}
                          onDuplicate={handleDuplicateReport}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* BLOCO 2: BIBLIOTECA DE RELATÓRIOS */}
                <TabsContent value="biblioteca" className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredReports.map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        onExecute={handleExecuteReport}
                        onConfigure={handleOpenConfig}
                        onDuplicate={handleDuplicateReport}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </TabsContent>

                {/* BLOCO 3: HISTÓRICO DE EXECUÇÃO */}
                <TabsContent value="historico" className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">
                      Histórico de Execuções Recentes
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {executionLogs.length} Relatórios Registrados
                    </span>
                  </div>

                  <DataTable
                    columns={historyColumns}
                    data={executionLogs}
                    density="comfortable"
                  />
                </TabsContent>

                {/* BLOCO 4: AGENDAMENTOS */}
                <TabsContent value="agendamentos" className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">
                      Relatórios com Agendamento Automático
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {schedules.length} Agendamentos Ativos
                    </span>
                  </div>

                  <DataTable
                    columns={scheduleColumns}
                    data={schedules}
                    density="comfortable"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>

      {/* CONFIGURATION SHEET SIDE DRAWER */}
      <ReportConfigSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        report={selectedReportForConfig}
        onSaveConfig={handleSaveConfig}
        onSaveAndExecute={handleSaveAndExecute}
      />
    </AppLayout>
  )
}

export default function ReportsPage() {
  return (
    <React.Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Carregando relatórios...</div>}>
      <ReportsContent />
    </React.Suspense>
  )
}
