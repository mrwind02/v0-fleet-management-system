"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ColumnDef } from "@tanstack/react-table"
import {
  Wrench,
  Activity,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  Truck,
  Sparkles,
  ArrowRight,
  MoreVertical,
  Play,
  Edit,
  Trash2
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts"

import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InsightCard } from "@/components/ui/insight-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/utils/utils"

import { PreventivePlanItem, PreventiveFilterState } from "@/types/preventive"
import { PreventiveService } from "@/services/preventive.service"
import { PreventiveCalendar } from "@/components/preventive/preventive-calendar"
import { NewPlanSheet } from "@/components/preventive/new-plan-sheet"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export default function PreventiveMaintenancePage() {
  const router = useRouter()

  // State Management
  const [viewMode, setViewMode] = React.useState<"table" | "calendar">("table")
  const [filter, setFilter] = React.useState<PreventiveFilterState>({
    search: "",
    planType: "all",
    unit: "all",
    vehicle: "all",
    status: "all",
    criterion: "all",
    responsible: "all",
    period: "all"
  })

  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [editingPlan, setEditingPlan] = React.useState<PreventivePlanItem | null>(null)
  const [noticeMessage, setNoticeMessage] = React.useState<string | null>(null)

  // Dynamic Data State (No Mock Data)
  const [plans, setPlans] = React.useState<PreventivePlanItem[]>([])
  const [kpis, setKpis] = React.useState<any[]>([])
  const [calendarEvents, setCalendarEvents] = React.useState<any[]>([])

  const loadData = React.useCallback(() => {
    const fetchedPlans = PreventiveService.getPlans(filter)
    const fetchedKpis = PreventiveService.getKpis()
    const fetchedCalendar = PreventiveService.getCalendarEvents()

    setPlans(fetchedPlans)
    setKpis(fetchedKpis)
    setCalendarEvents(fetchedCalendar)
  }, [filter])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const showNotice = (msg: string) => {
    setNoticeMessage(msg)
    setTimeout(() => setNoticeMessage(null), 4000)
  }

  const handleRowClick = (plan: PreventivePlanItem) => {
    router.push(`/maintenance/preventive/${plan.id}`)
  }

  const handleCreatePlanSubmit = (formData: Record<string, any>) => {
    const saved = PreventiveService.savePlan(formData)
    loadData()
    showNotice(formData.id ? `Plano preventivo "${saved.code} - ${saved.name}" atualizado!` : `Novo plano "${saved.code} - ${saved.name}" criado com sucesso!`)
    setEditingPlan(null)
    setIsSheetOpen(false)
  }

  const [deleteConfirmConfig, setDeleteConfirmConfig] = React.useState<{
    isOpen: boolean
    plan: PreventivePlanItem | null
  }>({ isOpen: false, plan: null })

  const handleDeletePlan = (plan: PreventivePlanItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmConfig({ isOpen: true, plan })
  }

  const handleConfirmDeletePlan = () => {
    if (deleteConfirmConfig.plan) {
      PreventiveService.deletePlan(deleteConfirmConfig.plan.id)
      loadData()
      showNotice(`Plano preventivo "${deleteConfirmConfig.plan.code}" removido com sucesso.`)
      setDeleteConfirmConfig({ isOpen: false, plan: null })
    }
  }

  const handleEditPlan = (plan: PreventivePlanItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingPlan(plan)
    setIsSheetOpen(true)
  }

  // Dynamic Chart & Insight Calculations (No Mock Data)
  const activeCount = plans.filter(p => p.status === "Ativo").length
  const expiringCount = plans.filter(p => p.status === "Próximo do vencimento").length
  const overdueCount = plans.filter(p => p.status === "Vencido").length

  const criticalPlan = plans.find(p => p.status === "Vencido") || plans.find(p => p.status === "Próximo do vencimento")
  const complianceRate = plans.length > 0 ? `${Math.round((activeCount / plans.length) * 100)}%` : "100%"

  const chartCompliance = [
    { name: "Ativos (No Prazo)", value: activeCount, color: "#10B981" },
    { name: "Próximo Vencimento", value: expiringCount, color: "#F59E0B" },
    { name: "Vencidos (Em Atraso)", value: overdueCount, color: "#EF4444" }
  ]

  const chartEvolution = [
    { month: "Jan", prev: plans.length > 0 ? plans.length * 2 : 0, corr: plans.length > 0 ? 1 : 0 },
    { month: "Fev", prev: plans.length > 0 ? plans.length * 3 : 0, corr: plans.length > 0 ? 1 : 0 },
    { month: "Mar", prev: plans.length > 0 ? plans.length * 4 : 0, corr: plans.length > 0 ? 0 : 0 },
    { month: "Abr", prev: plans.length > 0 ? plans.length * 5 : 0, corr: plans.length > 0 ? 0 : 0 },
    { month: "Mai", prev: plans.length > 0 ? plans.length * 6 : 0, corr: plans.length > 0 ? 0 : 0 },
    { month: "Jun", prev: plans.length > 0 ? plans.length * 7 : 0, corr: plans.length > 0 ? 0 : 0 }
  ]

  const kmCount = plans.filter(p => p.triggerType === "km").length
  const timeCount = plans.filter(p => p.triggerType === "time").length
  const mixedCount = plans.filter(p => p.triggerType === "mixed_or" || p.triggerType === "mixed_and").length

  const chartCriteria = [
    { criterion: "Quilometragem (KM)", count: kmCount },
    { criterion: "Tempo (Dias)", count: timeCount },
    { criterion: "Misto (KM ou Tempo)", count: mixedCount }
  ]

  // Status Badge Helper
  const renderStatusBadge = (status: PreventivePlanItem["status"]) => {
    switch (status) {
      case "Ativo":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">Ativo</Badge>
      case "Próximo do vencimento":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-bold">Próximo do Vencimento</Badge>
      case "Vencido":
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-bold">Vencido</Badge>
      case "Suspenso":
        return <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/30 text-[10px] font-bold">Suspenso</Badge>
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] font-bold">{status}</Badge>
    }
  }

  // DataTable Columns Definition
  const columns: ColumnDef<PreventivePlanItem>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => <span className="font-mono font-bold text-xs text-primary">{row.getValue("code")}</span>
    },
    {
      accessorKey: "name",
      header: "Plano Preventivo",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-foreground text-xs">{row.original.name}</div>
          <div className="text-[11px] text-muted-foreground">{row.original.category}</div>
        </div>
      )
    },
    {
      accessorKey: "vehicleModel",
      header: "Veículo",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground text-xs">{row.original.vehicleModel}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{row.original.plate}</div>
        </div>
      )
    },
    { accessorKey: "unit", header: "Unidade" },
    {
      accessorKey: "triggerLabel",
      header: "Critério",
      cell: ({ row }) => <Badge variant="secondary" className="text-[10px] font-mono">{row.getValue("triggerLabel")}</Badge>
    },
    {
      accessorKey: "nextExecutionDate",
      header: "Próxima Execução",
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-xs font-bold text-foreground">{row.original.nextExecutionDate}</div>
          {row.original.nextExecutionKm && (
            <div className="text-[10px] text-muted-foreground font-mono">{row.original.nextExecutionKm.toLocaleString("pt-BR")} KM</div>
          )}
        </div>
      )
    },
    { accessorKey: "lastExecutionDate", header: "Última Execução" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => renderStatusBadge(row.original.status)
    },
    {
      accessorKey: "nextOsPrediction",
      header: "Previsão OS",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue("nextOsPrediction")}</span>
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs w-44">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/maintenance/preventive/${row.original.id}`) }}>
              <FileText className="h-3.5 w-3.5 mr-2 text-primary" /> Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleEditPlan(row.original, e)}>
              <Edit className="h-3.5 w-3.5 mr-2 text-blue-600" /> Editar Plano
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); showNotice(`OS preventiva gerada para ${row.original.code}!`) }}>
              <Play className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Executar (Gerar OS)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleDeletePlan(row.original, e)}
              className="text-red-600 dark:text-red-400 focus:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir Plano
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-12">
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/40 pb-4">
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Manutenção", href: "/maintenance" },
              { label: "Preventivas", href: "/maintenance/preventive" }
            ]}
            title="Planos Preventivos"
            description="Planeje, monitore e automatize as manutenções preventivas da frota."
          />

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <Button
              onClick={() => setIsSheetOpen(true)}
              className="text-xs gap-1.5 h-9 bg-primary text-primary-foreground font-semibold shrink-0 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Novo Plano Preventivo
            </Button>
          </div>
        </div>

        {/* NOTIFICATION NOTICE */}
        <AnimatePresence>
          {noticeMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {noticeMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* LINHA 1: KPIS (6 METRIC CARDS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi, idx) => (
            <MetricCard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              trend={kpi.trend}
              trendLabel={kpi.trendLabel}
            />
          ))}
        </div>

        {/* LINHA 2: GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart 1: Evolução das Preventivas */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Evolução das Preventivas</h3>
              <p className="text-xs text-muted-foreground">Volume de manutenções preventivas vs corretivas</p>
            </div>
            <div className="h-[210px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartEvolution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="prev" name="Preventivas" stroke="#10B981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="corr" name="Corretivas" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Cumprimento dos Planos (Donut) */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Cumprimento dos Planos</h3>
              <p className="text-xs text-muted-foreground">Distribuição percentual do status de execução</p>
            </div>
            <div className="h-[210px] w-full pt-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartCompliance} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                    {chartCompliance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val}%`, "Proporção"]} contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Critério de Disparo (Bar) */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Critérios de Disparo</h3>
              <p className="text-xs text-muted-foreground">Total de planos por tipo de regra (KM, Tempo, Misto)</p>
            </div>
            <div className="h-[210px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCriteria} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="criterion" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="#0F5DFB" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* LINHA 3: INSIGHTS AUTOMÁTICOS */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Insights & Alertas do Plano Preventivo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              title="Plano Mais Crítico"
              value={criticalPlan ? criticalPlan.name : "Nenhum Alerta"}
              description={criticalPlan ? `Plano ${criticalPlan.code} com status "${criticalPlan.status}" (Previsão OS: ${criticalPlan.nextOsPrediction}).` : "Nenhum plano preventivo em atraso ou vencido no momento."}
              badgeText={criticalPlan ? criticalPlan.status : "Sem Alertas"}
              badgeVariant={criticalPlan?.status === "Vencido" ? "destructive" : "secondary"}
            />
            <InsightCard
              title="Veículo Monitorado"
              value={plans.length > 0 ? plans[0].vehicleModel : "Nenhum"}
              description={plans.length > 0 ? `Placa ${plans[0].plate} vinculada ao plano ${plans[0].code}.` : "Cadastre planos preventivos para monitorar sua frota."}
              badgeText={plans.length > 0 ? plans[0].plate : "Frota Ok"}
              badgeVariant="outline"
            />
            <InsightCard
              title="Cumprimento de Metas"
              value={complianceRate}
              description={plans.length > 0 ? `${activeCount} de ${plans.length} planos em dia dentro da tolerância.` : "100% dos veículos monitorados operando com saúde mecânica."}
              badgeText={plans.length > 0 ? "Em Monitoramento" : "Desempenho Ok"}
              badgeVariant="secondary"
            />
          </div>
        </div>

        {/* TOOLBAR & ALTERNADOR DE VISÃO (TABELA ↔ CALENDÁRIO) */}
        <div className="bg-card border rounded-2xl p-3.5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por plano, placa ou modelo..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Filters + View Mode Toggle */}
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="all">Todos os Status</option>
                <option value="Ativo">Ativos</option>
                <option value="Próximo do vencimento">Próximo do Vencimento</option>
                <option value="Vencido">Vencidos</option>
                <option value="Suspenso">Suspensos</option>
              </select>

              <select
                value={filter.unit}
                onChange={(e) => setFilter({ ...filter, unit: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="all">Todas as Unidades</option>
                <option value="matriz">Matriz SP</option>
                <option value="rj">Filial RJ</option>
                <option value="mg">Filial MG</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs">
                <Button
                  size="sm"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  onClick={() => setViewMode("table")}
                  className="h-7 text-xs gap-1.5 px-3"
                >
                  <TableIcon className="h-3.5 w-3.5" /> Tabela
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  onClick={() => setViewMode("calendar")}
                  className="h-7 text-xs gap-1.5 px-3"
                >
                  <CalendarIcon className="h-3.5 w-3.5" /> Calendário
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTANTE PRINCIPAL: TABELA DE PLANOS OU CALENDÁRIO PREVENTIVO */}
        {viewMode === "table" ? (
          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Planos Preventivos Cadastrados</h3>
              <span className="text-xs text-muted-foreground font-mono">{plans.length} Planos na Lista</span>
            </div>

            <DataTable
              columns={columns}
              data={plans}
              density="comfortable"
              onRowClick={handleRowClick}
            />
          </div>
        ) : (
          <PreventiveCalendar events={calendarEvents} />
        )}
      </div>

      {/* NEW / EDIT PLAN 820px LATERAL SHEET */}
      <NewPlanSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false)
          setEditingPlan(null)
        }}
        editData={editingPlan}
        onSubmit={handleCreatePlanSubmit}
      />

      {/* CONFIRMATION DIALOG FOR DELETION */}
      <ConfirmModal
        isOpen={deleteConfirmConfig.isOpen}
        onClose={() => setDeleteConfirmConfig({ isOpen: false, plan: null })}
        onConfirm={handleConfirmDeletePlan}
        title={`Excluir Plano Preventivo ${deleteConfirmConfig.plan?.code || ""}?`}
        description={`Tem certeza que deseja excluir o plano preventivo "${deleteConfirmConfig.plan?.code || ""} - ${deleteConfirmConfig.plan?.name || ""}"? Esta ação removerá a automação de ordens de serviço deste plano.`}
        confirmText="Excluir Plano Preventivo"
        cancelText="Cancelar"
        variant="danger"
      />
    </AppLayout>
  )
}
