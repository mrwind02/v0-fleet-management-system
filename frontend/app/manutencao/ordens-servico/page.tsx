"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { ChartCard } from "@/components/ui/chart-card"
import { InsightCard } from "@/components/ui/insight-card"
import { AlertPanel, AlertItem } from "@/components/ui/alert-panel"
import { DataTable, TableDensity } from "@/components/ui/data-table"
import { Toolbar } from "@/components/ui/toolbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusPill } from "@/components/ui/status-pill"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { WorkOrderFormSheet } from "@/components/work-orders/WorkOrderFormSheet"
import { workOrderService, WorkOrder, WorkOrderMetrics } from "@/services/work-order.service"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/utils/utils"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label
} from "recharts"
import {
  ClipboardList, Wrench, Package, AlertTriangle, DollarSign, Truck,
  Plus, Download, Upload, MoreHorizontal, Clock, Building2, TrendingDown
} from "lucide-react"


const STATUS_COLORS: Record<string, string> = {
  "Aberta": "#3b82f6",
  "Aguardando Aprovação": "#f59e0b",
  "Aguardando Peças": "#8b5cf6",
  "Em Execução": "#22c55e",
  "Pausada": "#6b7280",
  "Concluída": "#10b981",
  "Cancelada": "#ef4444",
}

const TYPE_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"]

function getStatusVariant(status: string): any {
  const map: Record<string, string> = {
    "Em Execução": "success",
    "Concluída": "success",
    "Aberta": "default",
    "Aguardando Aprovação": "warning",
    "Aguardando Peças": "warning",
    "Pausada": "default",
    "Cancelada": "destructive",
  }
  return map[status] || "default"
}

export default function WorkOrdersPage() {
  const router = useRouter()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [metrics, setMetrics] = useState<WorkOrderMetrics | null>(null)
  const [costByMonth, setCostByMonth] = useState<any[]>([])
  const [byType, setByType] = useState<any[]>([])
  const [byStatus, setByStatus] = useState<any[]>([])
  const [insights, setInsights] = useState<any>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")
  const [density, setDensity] = useState<TableDensity>("comfortable")

  useEffect(() => {
    const saved = localStorage.getItem("fleet:table-density") as TableDensity
    if (saved) setDensity(saved)
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setIsLoading(true)
    try {
      const [wos, met, cost, type, status, ins] = await Promise.all([
        workOrderService.getAll(),
        workOrderService.getMetrics(),
        workOrderService.getCostByMonth(),
        workOrderService.getByType(),
        workOrderService.getByStatus(),
        workOrderService.getInsights(),
      ])
      setWorkOrders(wos)
      setMetrics(met)
      setCostByMonth(cost)
      setByType(type)
      setByStatus(status)
      setInsights(ins)

      // Build dynamic alerts
      const dynamicAlerts: AlertItem[] = []
      if (met.overdue > 0) dynamicAlerts.push({ id: "overdue", type: "error", title: `${met.overdue} OS atrasada(s)`, description: "Prazo de conclusão ultrapassado." })
      if (met.vehiclesDown > 0) dynamicAlerts.push({ id: "vehicles", type: "error", title: `${met.vehiclesDown} veículo(s) parado(s) com OS aberta`, description: "Verifique o andamento dessas ordens." })
      if (met.waitingApproval > 0) dynamicAlerts.push({ id: "approval", type: "warning", title: `${met.waitingApproval} OS aguardando aprovação`, description: "Pendentes de autorização do gestor." })
      if (met.waitingParts > 0) dynamicAlerts.push({ id: "parts", type: "warning", title: `${met.waitingParts} OS aguardando peças`, description: "Verificar pedidos com fornecedores." })
      if (dynamicAlerts.length === 0) dynamicAlerts.push({ id: "ok", type: "info" as any, title: "Tudo em ordem!", description: "Nenhum alerta crítico no momento." })
      setAlerts(dynamicAlerts)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDensityChange = (d: TableDensity) => {
    setDensity(d)
    localStorage.setItem("fleet:table-density", d)
  }

  const fmtCurrency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("pt-BR") : "-"

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: "number",
      header: "Nº OS",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-blue-600">
          #{String(row.original.number).padStart(6, "0")}
        </span>
      ),
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold">{row.original.vehicle_plate || "-"}</span>
          <span className="text-[10px] text-muted-foreground">
            {row.original.vehicle_brand} {row.original.vehicle_model}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-medium bg-muted/30">{row.original.type}</Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Prioridade",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority as any} />,
    },
    {
      accessorKey: "workshop_name",
      header: "Oficina",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.workshop_name || "-"}</span>,
    },
    {
      accessorKey: "responsible",
      header: "Responsável",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.responsible || "-"}</span>,
    },
    {
      accessorKey: "opened_at",
      header: "Abertura",
      cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.opened_at)}</span>,
    },
    {
      accessorKey: "estimated_at",
      header: "Previsão",
      cell: ({ row }) => {
        const est = row.original.estimated_at
        const isOverdue = est && new Date(est) < new Date() && row.original.status !== "Concluída"
        return (
          <span className={cn("text-xs", isOverdue ? "text-red-600 font-semibold" : "")}>
            {fmtDate(est)}
          </span>
        )
      },
    },
    {
      accessorKey: "cost_total",
      header: "Valor",
      cell: ({ row }) => (
        <span className="text-xs font-medium">{fmtCurrency(row.original.cost_total || 0)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill status={getStatusVariant(row.original.status)} label={row.original.status} className="text-[10px]" />
      ),
    },
    {
      id: "actions",
      cell: () => (
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const totalStatus = byStatus.reduce((acc, cur) => acc + cur.value, 0)

  const sparkline = costByMonth.map(m => ({ value: m.value }))

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 pb-2 w-full animate-in fade-in duration-300">

        <PageHeader
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Manutenção" }, { label: "Ordens de Serviço" }]}
          title="Ordens de Serviço"
          description="Gerencie todas as intervenções realizadas na frota, acompanhando serviços, custos e andamento das manutenções."
          actions={
            <>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                <Upload className="mr-2 h-4 w-4" /> Importar
              </Button>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Nova Ordem de Serviço
              </Button>
            </>
          }
        />

        {/* ── KPIs ── */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
            <MetricCard
              title="Total de OS"
              value={metrics.total}
              trendLabel="em aberto"
              icon={<ClipboardList className="h-4 w-4" />}
              iconBgColor="bg-blue-100 dark:bg-blue-900/40"
              iconColor="text-blue-600 dark:text-blue-400"
              sparklineData={sparkline}
              sparklineColor="#3b82f6"
            />
            <MetricCard
              title="Em Execução"
              value={metrics.inProgress}
              trendLabel="atualmente"
              icon={<Wrench className="h-4 w-4" />}
              iconBgColor="bg-green-100 dark:bg-green-900/40"
              iconColor="text-green-600 dark:text-green-400"
            />
            <MetricCard
              title="Aguardando Peças"
              value={metrics.waitingParts}
              trendLabel="bloqueadas"
              icon={<Package className="h-4 w-4" />}
              iconBgColor="bg-purple-100 dark:bg-purple-900/40"
              iconColor="text-purple-600 dark:text-purple-400"
            />
            <MetricCard
              title="Atrasadas"
              value={metrics.overdue}
              trendLabel="acima do prazo"
              icon={<AlertTriangle className="h-4 w-4" />}
              iconBgColor="bg-red-100 dark:bg-red-900/40"
              iconColor="text-red-600 dark:text-red-400"
            />
            <MetricCard
              title="Custo do Mês"
              value={fmtCurrency(metrics.costMonth)}
              trendLabel="mês atual"
              icon={<DollarSign className="h-4 w-4" />}
              iconBgColor="bg-orange-100 dark:bg-orange-900/40"
              iconColor="text-orange-600 dark:text-orange-400"
            />
            <MetricCard
              title="Veículos Parados"
              value={metrics.vehiclesDown}
              trendLabel="com OS aberta"
              icon={<Truck className="h-4 w-4" />}
              iconBgColor="bg-slate-100 dark:bg-slate-800"
              iconColor="text-slate-600 dark:text-slate-400"
            />
          </div>
        )}

        {/* ── Charts + Alerts ── */}
        {metrics && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
            <div className="xl:col-span-3 flex flex-col gap-2">

              {/* Chart Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

                {/* Cost by Month */}
                <ChartCard title="Custos por Mês" description="Últimos 12 meses (OS concluídas)">
                  <div className="h-[180px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={costByMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => [fmtCurrency(v), "Custo"]} />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                {/* By Type */}
                <ChartCard title="Tipos de Manutenção" description="Distribuição de OS por tipo">
                  <div className="h-[180px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byType} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {byType.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                {/* By Status Donut */}
                <ChartCard title="Status das OS" description="Visão geral de andamento">
                  <div className="flex items-center w-full" style={{ height: 180 }}>
                    <div style={{ width: 150, height: 180, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={byStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                            {byStatus.map((entry, i) => (
                              <Cell key={i} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                            ))}
                            <Label
                              content={({ viewBox }: any) => {
                                const { cx, cy } = viewBox
                                return (
                                  <g>
                                    <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 10, fill: "var(--muted-foreground)" }}>Total</text>
                                    <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: "var(--foreground)" }}>{totalStatus}</text>
                                  </g>
                                )
                              }}
                            />
                          </Pie>
                          <Tooltip formatter={(v: number, name) => [`${v} OS`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1.5 pl-2">
                      {byStatus.map((entry) => {
                        const pct = totalStatus > 0 ? ((entry.value / totalStatus) * 100).toFixed(0) : "0"
                        return (
                          <div key={entry.name} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] || "#94a3b8" }} />
                            <span className="text-[10px] text-foreground leading-none flex-1 truncate">{entry.name}</span>
                            <span className="text-[9px] text-muted-foreground">{pct}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Insight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <InsightCard
                  title="Oficina"
                  value={insights?.topWorkshop?.name || "—"}
                  description={insights?.topWorkshop ? `${insights.topWorkshop.os_count} OS este mês` : "Sem dados"}
                  icon={<Building2 className="h-4 w-4" />}
                  iconBgColor="bg-blue-100 dark:bg-blue-900/40"
                  iconColor="text-blue-600 dark:text-blue-400"
                  badgeText="Mais ativa"
                  badgeVariant="default"
                />
                <InsightCard
                  title="Veículo Crítico"
                  value={insights?.criticalVehicle
                    ? `${insights.criticalVehicle.brand} ${insights.criticalVehicle.model}`
                    : "—"}
                  description={insights?.criticalVehicle
                    ? `${fmtCurrency(insights.criticalVehicle.total_cost)} em manutenção`
                    : "Sem dados"}
                  icon={<Truck className="h-4 w-4" />}
                  iconBgColor="bg-red-100 dark:bg-red-900/40"
                  iconColor="text-red-600 dark:text-red-400"
                  badgeText="Maior custo"
                  badgeVariant="destructive"
                />
                <InsightCard
                  title="Eficiência"
                  value={insights?.avgExecutionDays
                    ? `${insights.avgExecutionDays.toFixed(1)} dias`
                    : "—"}
                  description="Tempo médio de execução (90 dias)"
                  icon={<Clock className="h-4 w-4" />}
                  iconBgColor="bg-green-100 dark:bg-green-900/40"
                  iconColor="text-green-600 dark:text-green-400"
                  badgeText="Média"
                  badgeVariant="default"
                />
              </div>
            </div>

            {/* Alerts */}
            <div className="xl:col-span-1">
              <AlertPanel
                title="Alertas Operacionais"
                alerts={alerts}
                className="h-full border-orange-200/50 dark:border-orange-900/30"
              />
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="mt-2">
          <Toolbar
            searchValue={globalFilter}
            onSearch={setGlobalFilter}
            searchPlaceholder="Buscar ordem de serviço..."
            density={density}
            onDensityChange={handleDensityChange}
            extraActions={
              <Button variant="secondary" size="sm" className="h-8 text-xs font-medium">
                Ações em lote
              </Button>
            }
          />
          <DataTable
            columns={columns}
            data={workOrders}
            density={density}
            searchKey="responsible"
            searchValue={globalFilter}
            onRowClick={(row) => router.push(`/manutencao/ordens-servico/${row.id}`)}
            emptyStateTitle="Nenhuma Ordem de Serviço encontrada"
            emptyStateDescription="Crie uma nova OS para começar a registrar manutenções da frota."
          />
        </div>
      </div>

      <WorkOrderFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchAll}
      />
    </AppLayout>
  )
}
