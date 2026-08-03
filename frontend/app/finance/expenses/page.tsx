"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/ui/metric-card"
import { ChartCard } from "@/components/ui/chart-card"
import { InsightCard } from "@/components/ui/insight-card"
import { CategoryBadge } from "@/components/ui/category-badge"
import { StatusPill } from "@/components/ui/status-pill"
import { ExpenseFormSheet } from "@/components/expenses/ExpenseFormSheet"
import { NfeImportModal } from "@/components/expenses/NfeImportModal"
import { expenseService, Expense, ExpenseMetrics, ExpenseCharts, ExpenseInsights } from "@/services/expense.service"
import { vehicleService, driverService, unitService } from "@/services/api"
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts"
import {
  Plus, Download, Upload, Search, Wallet, AlertTriangle, FileText, Clock, Truck, User,
  MoreHorizontal, Eye, Trash2, Tag, DollarSign, TrendingUp, TrendingDown, ShieldCheck, AlertCircle, ChevronDown, ChevronUp, Bell, FileCode
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import useSWR from "swr"

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0)
}

function fmtDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("pt-BR")
}

function getStatusVariant(status: string): any {
  const map: Record<string, string> = {
    "Aprovada": "success",
    "Reembolsada": "success",
    "Pendente": "warning",
    "Aguardando Aprovação": "warning",
    "Cancelada": "destructive",
  }
  return map[status] || "default"
}

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"]

export default function ExpensesPage() {
  const router = useRouter()

  const [isAlertsOpen, setIsAlertsOpen] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedUnit, setSelectedUnit] = useState("all")
  const [selectedVehicle, setSelectedVehicle] = useState("all")
  const [selectedDriver, setSelectedDriver] = useState("all")
  const [selectedCostCenter, setSelectedCostCenter] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isNfeImportOpen, setIsNfeImportOpen] = useState(false)
  const [importedNfeData, setImportedNfeData] = useState<any | null>(null)

  const fetchFiltersDeps = [searchQuery, selectedCategory, selectedUnit, selectedVehicle, selectedDriver, selectedCostCenter, selectedStatus, selectedPaymentMethod].join('|')

  const fetchData = async () => {
    try {
      let apiExpenses: Expense[] = []
      try {
        apiExpenses = await expenseService.getAll({
          search: searchQuery,
          category: selectedCategory,
          unit: selectedUnit,
          vehicle_id: selectedVehicle,
          driver_id: selectedDriver,
          cost_center: selectedCostCenter,
          status: selectedStatus,
          payment_method: selectedPaymentMethod,
        })
      } catch (e) {}

      let localExpenses: Expense[] = []
      if (typeof window !== "undefined") {
        const savedLocal = localStorage.getItem("frotaone_expense_records")
        if (savedLocal) {
          try {
            localExpenses = JSON.parse(savedLocal)
            // Auto-purge se contiver dados fictícios legados
            if (Array.isArray(localExpenses) && localExpenses.some(e => e.description?.includes("Almoço Motorista e ajudante") || e.description?.includes("Pedágio Rodovia dos Imigrantes"))) {
              localStorage.removeItem("frotaone_expense_records")
              localExpenses = []
            }
          } catch (e) {}
        }
      }

      const merged = [...(Array.isArray(apiExpenses) ? apiExpenses : [])]
      if (Array.isArray(localExpenses)) {
        localExpenses.forEach(le => {
          if (!merged.some(e => String(e.id) === String(le.id))) {
            merged.unshift(le)
          }
        })
      }

      // Filter local list based on selected filters
      const filtered = merged.filter(e => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          const matchDesc = e.description?.toLowerCase().includes(q)
          const matchVeh = e.vehicle_plate?.toLowerCase().includes(q) || e.vehicle_info?.toLowerCase().includes(q)
          const matchDriver = e.driver_name?.toLowerCase().includes(q) || e.driver_full_name?.toLowerCase().includes(q)
          if (!matchDesc && !matchVeh && !matchDriver) return false
        }
        if (selectedCategory !== "all" && e.category_name !== selectedCategory) return false
        if (selectedUnit !== "all" && e.unit_name !== selectedUnit) return false
        if (selectedVehicle !== "all" && e.vehicle_id !== selectedVehicle) return false
        if (selectedDriver !== "all" && e.driver_id !== selectedDriver) return false
        if (selectedCostCenter !== "all" && e.cost_center !== selectedCostCenter) return false
        if (selectedStatus !== "all" && e.status !== selectedStatus) return false
        if (selectedPaymentMethod !== "all" && e.payment_method !== selectedPaymentMethod) return false
        return true
      })

      // Compute REAL metrics from actual expenses
      const totalMonth = filtered.reduce((acc, e) => acc + (Number(e.amount) || 0), 0)
      const pendingCount = filtered.filter(e => e.status === "Pendente" || e.status === "Aguardando Aprovação").length
      const noAttachmentCount = filtered.filter(e => !e.has_attachment && !e.attachments?.length).length
      const reimbursementsPending = filtered.filter(e => e.status === "Aguardando Aprovação" || e.is_reimbursable).reduce((acc, e) => acc + (Number(e.amount) || 0), 0)

      const computedMetrics: ExpenseMetrics = {
        totalMonth,
        pendingCount,
        reimbursementsPending,
        noAttachmentCount,
        avgPerVehicle: 0,
        avgPerDriver: 0
      }

      // Compute REAL chart data from actual expenses
      const monthCostMap: Record<string, number> = {}
      const categoryCostMap: Record<string, number> = {}
      const unitCostMap: Record<string, number> = {}

      filtered.forEach(e => {
        if (e.date) {
          const d = new Date(e.date)
          if (!isNaN(d.getTime())) {
            const monthStr = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
            monthCostMap[monthStr] = (monthCostMap[monthStr] || 0) + (Number(e.amount) || 0)
          }
        }
        const cat = e.category_name || "Outros"
        categoryCostMap[cat] = (categoryCostMap[cat] || 0) + (Number(e.amount) || 0)

        const u = e.unit_name || "Matriz"
        unitCostMap[u] = (unitCostMap[u] || 0) + (Number(e.amount) || 0)
      })

      const computedCharts: ExpenseCharts = {
        byMonth: Object.entries(monthCostMap).map(([name, value]) => ({ name, value })),
        byCategory: Object.entries(categoryCostMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
        byUnit: Object.entries(unitCostMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
      }

      // Compute REAL insights
      const topCategory = computedCharts.byCategory[0] || { name: "-", value: 0 }
      const totalAmount = filtered.reduce((acc, e) => acc + (Number(e.amount) || 0), 0)
      
      const vehicleCostMap: Record<string, number> = {}
      const driverReimbMap: Record<string, number> = {}
      filtered.forEach(e => {
        if (e.vehicle_info || e.vehicle_plate) {
           const vName = e.vehicle_info || e.vehicle_plate || "-"
           vehicleCostMap[vName] = (vehicleCostMap[vName] || 0) + (Number(e.amount) || 0)
        }
        if (e.is_reimbursable && (e.driver_full_name || e.driver_name)) {
           const dName = e.driver_full_name || e.driver_name || "-"
           driverReimbMap[dName] = (driverReimbMap[dName] || 0) + (Number(e.reimbursement_amount || e.amount) || 0)
        }
      })
      const topVehicle = Object.entries(vehicleCostMap).sort((a,b) => b[1] - a[1])[0] || ["-", 0]
      const topDriver = Object.entries(driverReimbMap).sort((a,b) => b[1] - a[1])[0] || ["-", 0]

      const computedInsights = {
        topCategory: { name: topCategory.name, amount: topCategory.value, percent: totalAmount > 0 ? Math.round((topCategory.value / totalAmount) * 100) : 0 },
        topVehicle: { name: topVehicle[0], amount: topVehicle[1], period: "no período" },
        topDriver: { name: topDriver[0], amount: topDriver[1], type: "em reembolsos" }
      }

      let vehRes: any = null
      let drvRes: any = null
      let unitRes: any = null
      try {
        [vehRes, drvRes, unitRes] = await Promise.all([vehicleService.getAll(), driverService.getAll(), unitService.getAll()])
      } catch (e) {}

      const uArr = Array.isArray(unitRes?.data) ? unitRes.data : (unitRes?.data?.data || [])

      return {
        expenses: filtered,
        metrics: computedMetrics,
        charts: computedCharts,
        insights: computedInsights,
        categories: ["Pedágio", "Manutenção Leve", "Alimentação", "Hospedagem", "Lavagem", "Peças", "Outros"],
        vehicles: vehRes?.data?.data || [],
        drivers: drvRes?.data?.data || [],
        units: Array.isArray(uArr) ? uArr : []
      }
    } catch (e) {
      console.error("Error loading expenses page data:", e)
      return { expenses: [], metrics: null, charts: null, insights: null, categories: [], vehicles: [], drivers: [], units: [] }
    }
  }

  const { data, isLoading, mutate } = useSWR(`expenses_dashboard_data_${fetchFiltersDeps}`, fetchData, { revalidateOnFocus: false })

  const expenses = data?.expenses || []
  const metrics = data?.metrics || { totalMonth: 0, pendingCount: 0, reimbursementsPending: 0, noAttachmentCount: 0, avgPerVehicle: 0, avgPerDriver: 0 }
  const charts = data?.charts || null
  const insights = data?.insights || null
  const categories = data?.categories || []
  const vehicles = data?.vehicles || []
  const drivers = data?.drivers || []
  const units = data?.units || []

  const handleDeleteExpense = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return
    try {
      await expenseService.delete(id)
      toast.success("Despesa excluída com sucesso.")
      mutate()
    } catch {
      toast.error("Erro ao excluir despesa.")
    }
  }

  // Sparkline mockup datasets
  const spark1 = [{ value: 12 }, { value: 15 }, { value: 18 }, { value: 14 }, { value: 22 }, { value: 20 }]
  const spark2 = [{ value: 5 }, { value: 8 }, { value: 12 }, { value: 9 }, { value: 11 }, { value: 14 }]
  const spark3 = [{ value: 300 }, { value: 450 }, { value: 400 }, { value: 550 }, { value: 600 }, { value: 630 }]
  const spark4 = [{ value: 2 }, { value: 4 }, { value: 3 }, { value: 5 }, { value: 4 }, { value: 4 }]
  const spark5 = [{ value: 10 }, { value: 9 }, { value: 8.5 }, { value: 9.2 }, { value: 8.8 }, { value: 9.0 }]

  const noAttachmentInCurrentList = expenses.filter(e => !e.has_attachment).length

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-8 w-full animate-in fade-in duration-300">
        {/* ── Cabeçalho ── */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Financeiro" },
            { label: "Despesas" },
          ]}
          title="Despesas Operacionais"
          description="Consolidação e gestão de custos operacionais diversos da frota."
          actions={
            <>
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold bg-blue-50/80 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" onClick={() => setIsNfeImportOpen(true)}>
                <FileCode className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" /> Importar NF-e (CPF / CNPJ)
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.info("Exportando relatório de despesas...")}>
                <Download className="h-3.5 w-3.5 mr-1" /> Exportar
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-semibold shadow-sm"
                onClick={() => {
                  setImportedNfeData(null)
                  setIsFormOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Nova Despesa
              </Button>
            </>
          }
        />

        {/* ── 1. KPIs Integrados com Alertas Incorporados ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <MetricCard
            title="Total Gasto no Mês"
            value={fmtCurrency(metrics?.totalMonth || 0)}
            trendLabel="Mês vigente"
            icon={<Wallet className="h-4 w-4" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/40"
            iconColor="text-blue-600 dark:text-blue-400"
          />

          <MetricCard
            title="Despesas Pendentes"
            value={`${metrics?.pendingCount || 0}`}
            trendLabel="Aguardando aprovação"
            icon={<Clock className="h-4 w-4" />}
            iconBgColor="bg-amber-100 dark:bg-amber-900/40"
            iconColor="text-amber-600 dark:text-amber-400"
          />

          <MetricCard
            title="Sem Comprovante"
            value={`${metrics?.noAttachmentCount || 0}`}
            trendLabel="Pendente de anexo"
            icon={<AlertTriangle className="h-4 w-4" />}
            iconBgColor="bg-orange-100 dark:bg-orange-900/40"
            iconColor="text-orange-600 dark:text-orange-400"
          />

          <MetricCard
            title="Acima do Limite"
            value={`${expenses.filter(e => Number(e.amount) > 1000).length}`}
            trendLabel="Teto de R$ 1.000,00"
            icon={<AlertCircle className="h-4 w-4" />}
            iconBgColor="bg-red-100 dark:bg-red-900/40"
            iconColor="text-red-600 dark:text-red-400"
          />

          <MetricCard
            title="Total de Lançamentos"
            value={`${expenses.length}`}
            trendLabel="Registros totais"
            icon={<TrendingDown className="h-4 w-4" />}
            iconBgColor="bg-emerald-100 dark:bg-emerald-900/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />

          <MetricCard
            title="Reembolsos a Pagar"
            value={fmtCurrency(metrics?.reimbursementsPending || 0)}
            trendLabel="Aguardando reembolso"
            icon={<DollarSign className="h-4 w-4" />}
            iconBgColor="bg-purple-100 dark:bg-purple-900/40"
            iconColor="text-purple-600 dark:text-purple-400"
          />
        </div>

        {/* ── 2. Área Analítica (Gráficos Imediatamente Após KPIs) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Evolução Mensal (Últimos 12 Meses)"
            description="Histórico consolidado de despesas operacionais"
            action={<span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">Mês a Mês</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts?.byMonth && charts.byMonth.length > 0 ? charts.byMonth : []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} />
                <YAxis fontSize={10} tickLine={false} tickFormatter={(v) => `R$ ${v/1000}k`} />
                <Tooltip formatter={(v: number) => [fmtCurrency(v), "Gasto Total"]} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Gastos por Categoria"
            description="Distribuição por grupos de custo operacional"
            action={charts?.byCategory && charts.byCategory[0] ? <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">Principais Custos</span> : null}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts?.byCategory && charts.byCategory.length > 0 ? charts.byCategory : []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} />
                <YAxis fontSize={10} tickLine={false} tickFormatter={(v) => `R$ ${v/1000}k`} />
                <Tooltip formatter={(v: number) => [fmtCurrency(v), "Valor"]} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Distribuição por Unidade"
            description="Divisão proporcional por filial e matriz"
            action={charts?.byUnit && charts.byUnit[0] ? <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">Concentração</span> : null}
          >
            <div className="flex items-center w-full h-[220px]">
              <div style={{ width: 130, height: 200, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts?.byUnit && charts.byUnit.length > 0 ? charts.byUnit : []}
                      cx="50%" cy="50%" innerRadius={40} outerRadius={58} dataKey="value" stroke="none" paddingAngle={2}
                    >
                      {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmtCurrency(v), "Total Unidade"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2 pl-2 overflow-hidden">
                {(charts?.byUnit && charts.byUnit.length > 0 ? charts.byUnit : []).map((entry, index) => {
                  const dataArr = (charts?.byUnit && charts.byUnit.length > 0 ? charts.byUnit : []);
                  const total = dataArr.reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-xs pr-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                        <span className="font-medium text-foreground truncate text-[11px]" title={entry.name}>{entry.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold shrink-0 ml-1">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* ── 3. Insights Cards (3 Cards Compactos) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            title="Maior Categoria"
            value={insights?.topCategory?.name || "-"}
            description={`${fmtCurrency(insights?.topCategory?.amount || 0)} · ${insights?.topCategory?.percent || 0}% do custo acumulado`}
            icon={<Tag className="h-4 w-4" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/40"
            iconColor="text-blue-600 dark:text-blue-400"
            actionLabel="Ver Categoria →"
            onAction={() => setSelectedCategory(insights?.topCategory?.name || "all")}
          />
          <InsightCard
            title="Maior Veículo Gerador"
            value={insights?.topVehicle?.name || "-"}
            description={`${fmtCurrency(insights?.topVehicle?.amount || 0)} em custos adicionais ${insights?.topVehicle?.period || "no período"}`}
            icon={<Truck className="h-4 w-4" />}
            iconBgColor="bg-purple-100 dark:bg-purple-900/40"
            iconColor="text-purple-600 dark:text-purple-400"
            actionLabel="Filtrar Veículo →"
            onAction={() => toast.info("Filtro de veículo aplicado.")}
          />
          <InsightCard
            title="Maior Solicitante de Reembolso"
            value={insights?.topDriver?.name || "-"}
            description={`${fmtCurrency(insights?.topDriver?.amount || 0)} acumulados ${insights?.topDriver?.type || "em reembolsos"}`}
            icon={<User className="h-4 w-4" />}
            iconBgColor="bg-emerald-100 dark:bg-emerald-900/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
            actionLabel="Ver Reembolsos →"
            onAction={() => setSelectedPaymentMethod("Reembolso")}
          />
        </div>

        {/* ── 4. Toolbar & Tabela de Despesas (com Alerta Contextual Integrado) ── */}
        <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
          {/* Micro-alerta contextual de filtro */}
          {noAttachmentInCurrentList > 0 && (
            <div className="flex items-center justify-between px-3 py-2 text-xs rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  <strong>Atenção:</strong> {noAttachmentInCurrentList} lançamento(s) na listagem atual ainda não possuem comprovante anexado.
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] hover:bg-orange-500/20 text-orange-800 dark:text-orange-200 font-semibold"
                onClick={() => toast.info("Mostrando despesas sem comprovante")}
              >
                Filtrar Sem Comprovante
              </Button>
            </div>
          )}

          {/* Toolbar Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por descrição, fornecedor, responsável, veículo, motorista..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filtro Categoria */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-background border rounded-lg"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Filtro Unidade */}
              <select
                value={selectedUnit}
                onChange={e => setSelectedUnit(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-background border rounded-lg"
              >
                <option value="all">Todas as Unidades</option>
                <option value="Matriz São Paulo">Matriz São Paulo</option>
                <option value="Filial Curitiba">Filial Curitiba</option>
                <option value="Filial Rio de Janeiro">Filial Rio de Janeiro</option>
                <option value="Filial Belo Horizonte">Filial Belo Horizonte</option>
              </select>

              {/* Filtro Status */}
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-background border rounded-lg"
              >
                <option value="all">Todos os Status</option>
                <option value="Pendente">Pendente</option>
                <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                <option value="Aprovada">Aprovada</option>
                <option value="Reembolsada">Reembolsada</option>
                <option value="Cancelada">Cancelada</option>
              </select>

              {/* Filtro Pagamento */}
              <select
                value={selectedPaymentMethod}
                onChange={e => setSelectedPaymentMethod(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-background border rounded-lg"
              >
                <option value="all">Todas as Formas Pagto</option>
                <option value="Cartão Corporativo">Cartão Corporativo</option>
                <option value="Sem Parar">Sem Parar / Tag</option>
                <option value="Reembolso">Reembolso</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Pix">Pix</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
                <option value="Faturamento">Faturamento</option>
              </select>

              {(selectedCategory !== "all" || selectedUnit !== "all" || selectedStatus !== "all" || selectedPaymentMethod !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 px-2"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedUnit("all")
                    setSelectedVehicle("all")
                    setSelectedDriver("all")
                    setSelectedCostCenter("all")
                    setSelectedStatus("all")
                    setSelectedPaymentMethod("all")
                  }}
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Tabela de Despesas */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Descrição</th>
                  <th className="py-2.5 px-3">Veículo</th>
                  <th className="py-2.5 px-3">Motorista</th>
                  <th className="py-2.5 px-3">Unidade</th>
                  <th className="py-2.5 px-3">Centro de Custo</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3">Situação</th>
                  <th className="py-2.5 px-3 text-center">Comprovante</th>
                  <th className="py-2.5 px-3 text-center w-10">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                        <span>Carregando despesas...</span>
                      </div>
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-muted-foreground">
                      <Wallet className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="font-medium text-sm">Nenhuma despesa encontrada</p>
                      <p className="text-xs mt-1">Ajuste os filtros ou crie um novo lançamento.</p>
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => router.push(`/finance/expenses/${e.id}`)}
                      className="border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-medium whitespace-nowrap">{fmtDate(e.date)}</td>
                      <td className="py-2.5 px-3">
                        <CategoryBadge category={e.category_name} />
                      </td>
                      <td className="py-2.5 px-3 max-w-[220px] truncate font-medium text-foreground" title={e.description}>
                        {e.description}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                        {e.vehicle_info || (e.vehicle_plate ? `${e.vehicle_brand || ''} ${e.vehicle_model || ''} (${e.vehicle_plate})` : "—")}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                        {e.driver_full_name || e.driver_name || "—"}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">{e.unit_name}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">{e.cost_center}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-foreground whitespace-nowrap">
                        {fmtCurrency(Number(e.amount))}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusPill status={getStatusVariant(e.status)} label={e.status} className="text-[10px]" />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {e.has_attachment ? (
                          <span title="Comprovante Anexado">
                            <FileText className="h-4 w-4 mx-auto text-blue-600 dark:text-blue-400" />
                          </span>
                        ) : (
                          <span className="text-muted-foreground opacity-30">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={ev => ev.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/finance/expenses/${e.id}`)}>
                              <Eye className="h-3.5 w-3.5 mr-2" /> Visualizar Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={ev => handleDeleteExpense(e.id, ev)} className="text-red-600">
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir Despesa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. Accordion de Alertas Detalhados (Recolhido por padrão no rodapé) ── */}
        <div className="border rounded-xl bg-card overflow-hidden">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Central Detalhada de Avisos & Políticas Financeiras</span>
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                4 avisos ativos
              </span>
            </div>
            {isAlertsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isAlertsOpen && (
            <div className="p-4 border-t space-y-3 bg-muted/10 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">12 Despesas Pendentes de Aprovação</strong>
                  <span>Lançamentos aguardando revisão e liberação pelo gestor responsável da unidade.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">8 Despesas sem Comprovante Fiscais</strong>
                  <span>Não possuem foto ou PDF do recibo anexado para auditoria e conciliação.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">4 Lançamentos Acima do Teto de Política</strong>
                  <span>Despesas que ultrapassaram o limite pré-estabelecido por categoria ou tipo de deslocamento.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Economia Operacional do Mês (-9%)</strong>
                  <span>Custos operacionais reduziram R$ 2.120 em comparação ao encerramento do mês anterior.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Importação de NF-e (CPF / CNPJ) */}
      <NfeImportModal
        open={isNfeImportOpen}
        onOpenChange={setIsNfeImportOpen}
        onImportSuccess={(importedData) => {
          setImportedNfeData(importedData)
          setIsFormOpen(true)
        }}
      />

      {/* Sheet para Criar/Editar Despesa */}
      <ExpenseFormSheet
        open={isFormOpen}
        onOpenChange={(val) => {
          setIsFormOpen(val)
          if (!val) setImportedNfeData(null)
        }}
        editData={importedNfeData}
        onSuccess={() => {
          setImportedNfeData(null)
          mutate()
        }}
      />
    </AppLayout>
  )
}
