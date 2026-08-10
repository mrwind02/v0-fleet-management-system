"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ColumnDef } from "@tanstack/react-table"
import {
  ClipboardCheck,
  Activity,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
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
  FileCode,
  User,
  Settings,
  Wrench
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
import { ResultBadge } from "@/components/ui/result-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/utils/utils"

import { ChecklistExecutionItem, ChecklistFilterState } from "@/types/checklist"
import { ChecklistService } from "@/services/checklist.service"
import { ChecklistBuilderSheet } from "@/components/checklist/checklist-builder-sheet"

export default function ChecklistPage() {
  const router = useRouter()

  // State Management
  const [filter, setFilter] = React.useState<ChecklistFilterState>({
    search: "",
    model: "all",
    vehicle: "all",
    driver: "all",
    unit: "all",
    status: "all",
    result: "all",
    period: "all"
  })

  const [isBuilderSheetOpen, setIsBuilderSheetOpen] = React.useState(false)
  const [noticeMessage, setNoticeMessage] = React.useState<string | null>(null)

  // Fetch Mock Data
  const kpis = ChecklistService.getKpis()
  const executions = ChecklistService.getExecutions(filter)

  const showNotice = (msg: string) => {
    setNoticeMessage(msg)
    setTimeout(() => setNoticeMessage(null), 4000)
  }

  const handleRowClick = (execution: ChecklistExecutionItem) => {
    router.push(`/maintenance/checklist/${execution.id}`)
  }

  const handleCreateModelSubmit = (formData: Record<string, any>) => {
    showNotice(`Novo modelo de checklist "${formData.name}" salvo com sucesso!`)
  }

  // Dynamic Chart Calculations derived strictly from executions
  const totalExecs = executions.length
  const approvedCount = executions.filter(e => e.result === "Aprovado").length
  const ressalvasCount = executions.filter(e => e.result === "Aprovado com Ressalvas").length
  const reprovadoCount = executions.filter(e => e.result === "Reprovado").length

  const chartResults = [
    { name: "Aprovados", value: totalExecs > 0 ? Math.round((approvedCount / totalExecs) * 100) : 100, color: "#10B981" },
    { name: "Com Ressalvas", value: totalExecs > 0 ? Math.round((ressalvasCount / totalExecs) * 100) : 0, color: "#F59E0B" },
    { name: "Reprovados", value: totalExecs > 0 ? Math.round((reprovadoCount / totalExecs) * 100) : 0, color: "#EF4444" }
  ]

  const nonConformityMap: Record<string, number> = {}
  executions.forEach(e => {
    if (e.nonConformitiesCount > 0) {
      const itemKey = e.modelName.includes("Pneus") || e.observerNotes.toLowerCase().includes("pneu")
        ? "Pneus & Pressão"
        : e.observerNotes.toLowerCase().includes("óleo") || e.observerNotes.toLowerCase().includes("cárter")
        ? "Motor & Óleo"
        : e.observerNotes.toLowerCase().includes("lanterna") || e.observerNotes.toLowerCase().includes("lâmpada")
        ? "Lanternas & Elétrica"
        : "Freios & Pneumática"
      nonConformityMap[itemKey] = (nonConformityMap[itemKey] || 0) + e.nonConformitiesCount
    }
  })

  const chartNonConformities = Object.keys(nonConformityMap).length > 0
    ? Object.entries(nonConformityMap).map(([item, count]) => ({ item, count }))
    : [
        { item: "Freios & Pneumática", count: reprovadoCount || 1 },
        { item: "Pneus & Pressão", count: ressalvasCount || 1 },
        { item: "Lanternas & Elétrica", count: 1 }
      ]

  const chartEvolution = [
    { month: "Jan", approved: Math.max(1, Math.round(approvedCount * 0.7)), rejected: Math.max(0, reprovadoCount) },
    { month: "Fev", approved: Math.max(1, Math.round(approvedCount * 0.85)), rejected: Math.max(0, reprovadoCount) },
    { month: "Mar", approved: Math.max(1, approvedCount), rejected: Math.max(0, reprovadoCount) }
  ]

  // DataTable Columns Definition (Execuções Apenas)
  const columns: ColumnDef<ChecklistExecutionItem>[] = [
    {
      accessorKey: "date",
      header: "Data / Hora",
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-xs font-bold text-foreground">{row.original.date}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{row.original.time}</div>
        </div>
      )
    },
    {
      accessorKey: "modelName",
      header: "Modelo de Inspeção",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-foreground text-xs">{row.original.modelName}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{row.original.code}</div>
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
    { accessorKey: "driverName", header: "Motorista" },
    {
      accessorKey: "result",
      header: "Resultado",
      cell: ({ row }) => <ResultBadge result={row.original.result} />
    },
    {
      accessorKey: "nonConformitiesCount",
      header: "Não Conf.",
      cell: ({ row }) => (
        <span className={cn("font-mono text-xs font-bold", row.original.nonConformitiesCount > 0 ? "text-rose-600" : "text-emerald-600")}>
          {row.original.nonConformitiesCount}
        </span>
      )
    },
    {
      accessorKey: "osGenerated",
      header: "OS Gerada",
      cell: ({ row }) => (
        row.original.osGenerated ? (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px] font-bold font-mono">
            {row.original.osNumber || "Sim"}
          </Badge>
        ) : (
          <span className="text-[11px] text-muted-foreground">Não</span>
        )
      )
    },
    {
      accessorKey: "durationMinutes",
      header: "Duração",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.durationMinutes} min</span>
    },
    {
      id: "actions",
      header: "Ação",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/maintenance/checklist/${row.original.id}`) }}>
              <FileText className="h-3.5 w-3.5 mr-2 text-primary" /> Ver Detalhes da Inspeção
            </DropdownMenuItem>
            {row.original.osNumber && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/manutencao/ordens-servico/${row.original.osNumber}`) }}>
                <Wrench className="h-3.5 w-3.5 mr-2 text-purple-600" /> Ver Ordem de Serviço
              </DropdownMenuItem>
            )}
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
              { label: "Operação", href: "#" },
              { label: "Checklists", href: "/maintenance/checklist" }
            ]}
            title="Checklists"
            description="Gerencie modelos de inspeção, acompanhe execuções e transforme não conformidades em ações corretivas."
          />

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <Button
              onClick={() => setIsBuilderSheetOpen(true)}
              className="text-xs gap-1.5 h-9 bg-primary text-primary-foreground font-semibold shrink-0 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Novo Modelo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => showNotice("Abrindo fluxo de Nova Execução de Checklist no dispositivo...")}
              className="text-xs gap-1.5 h-9 shrink-0 whitespace-nowrap"
            >
              <ClipboardCheck className="h-3.5 w-3.5" /> Nova Execução
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
          {/* Chart 1: Evolução dos Checklists */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Evolução dos Checklists</h3>
              <p className="text-xs text-muted-foreground">Volume mensal de inspeções aprovadas vs reprovadas</p>
            </div>
            <div className="h-[210px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartEvolution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="approved" name="Aprovados" stroke="#10B981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="rejected" name="Reprovados" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Resultado das Inspeções (Donut) */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Resultado das Inspeções</h3>
              <p className="text-xs text-muted-foreground">Distribuição percentual dos resultados de inspeção</p>
            </div>
            <div className="h-[210px] w-full pt-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartResults} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                    {chartResults.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val}%`, "Proporção"]} contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Itens Mais Reprovados (Bar) */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Itens Mais Reprovados</h3>
              <p className="text-xs text-muted-foreground">Principais não conformidades identificadas na frota</p>
            </div>
            <div className="h-[210px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartNonConformities} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="item" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="#EF4444" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* LINHA 3: INSIGHTS AUTOMÁTICOS */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Insights & Alertas de Qualidade
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              title="Veículo Crítico"
              value="Scania R450 (DEF-5678)"
              description="18 ocorrências de não conformidade registradas nos últimos 90 dias."
              badgeText="Ação Requerida"
              badgeVariant="destructive"
            />
            <InsightCard
              title="Item Mais Crítico"
              value="Pneus & Pressão"
              description="42 reprovações no sistema de rodagem este mês necessitando calibração."
              badgeText="Manutenção"
              badgeVariant="warning"
            />
            <InsightCard
              title="Melhor Motorista"
              value="Carlos Henrique"
              description="100% de conformidade técnica e pontualidade na execução dos checklists."
              badgeText="Destaque"
              badgeVariant="secondary"
            />
          </div>
        </div>

        {/* TOOLBAR DA TABELA */}
        <div className="bg-card border rounded-2xl p-3.5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, placa, motorista ou modelo..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <select
                value={filter.result}
                onChange={(e) => setFilter({ ...filter, result: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="all">Todos os Resultados</option>
                <option value="Aprovado">Aprovados</option>
                <option value="Aprovado com Ressalvas">Com Ressalvas</option>
                <option value="Reprovado">Reprovados</option>
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
            </div>
          </div>
        </div>

        {/* TABELA PRINCIPAL (EXCLUSIVAMENTE EXECUÇÕES DE CHECKLIST) */}
        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">Execuções de Checklist Operacional</h3>
              <p className="text-xs text-muted-foreground">Exibição exclusiva de vistorias e inspeções realizadas pelos motoristas</p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{executions.length} Execuções</span>
          </div>

          <DataTable
            columns={columns}
            data={executions}
            density="comfortable"
            onRowClick={handleRowClick}
          />
        </div>
      </div>

      {/* NEW MODEL BUILDER 820px LATERAL SHEET */}
      <ChecklistBuilderSheet
        isOpen={isBuilderSheetOpen}
        onClose={() => setIsBuilderSheetOpen(false)}
        onSubmit={handleCreateModelSubmit}
      />
    </AppLayout>
  )
}
