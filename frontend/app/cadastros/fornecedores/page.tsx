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
import { SupplierStatusBadge } from "@/components/ui/supplier-status-badge"
import { RatingStars } from "@/components/ui/rating-stars"
import { SupplierFormSheet } from "@/components/suppliers/SupplierFormSheet"
import { supplierService, Supplier, SupplierMetrics, SupplierCharts, SupplierInsights } from "@/services/supplier.service"
import { unitService } from "@/services/api"
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts"
import {
  Plus, Download, Upload, Search, Building2, FileText, CheckCircle2, Clock, Truck, User,
  MoreHorizontal, Eye, Trash2, Tag, DollarSign, Star, AlertTriangle, ShieldCheck, Phone, MapPin
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

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"]

export default function SuppliersPage() {
  const router = useRouter()
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedState, setSelectedState] = useState("all")
  const [selectedUnit, setSelectedUnit] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRating, setSelectedRating] = useState("all")

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState<Supplier | null>(null)

  const fetchFiltersDeps = [searchQuery, selectedCategory, selectedCity, selectedState, selectedUnit, selectedStatus, selectedRating].join('|')

  const fetchData = async () => {
    try {
      const [supRes, metRes, chartRes, insRes, catRes, unitRes] = await Promise.all([
        supplierService.getAll({
          search: searchQuery,
          category: selectedCategory,
          city: selectedCity,
          state: selectedState,
          unit: selectedUnit,
          status: selectedStatus,
          rating: selectedRating,
        }),
        supplierService.getMetrics(),
        supplierService.getCharts(),
        supplierService.getInsights(),
        supplierService.getCategories(),
        unitService.getAll(),
      ])

      const uArr = Array.isArray(unitRes?.data) ? unitRes.data : (unitRes?.data?.data || [])

      return {
        suppliers: supRes || [],
        metrics: metRes,
        charts: chartRes,
        insights: insRes,
        categories: catRes ? catRes.map(c => c.name) : [],
        units: Array.isArray(uArr) ? uArr.map((u: any) => u.name || u.unitName) : []
      }
    } catch (e) {
      console.error("Error loading suppliers data:", e)
      toast.error("Erro ao carregar fornecedores.")
      return null
    }
  }

  const { data, isLoading, mutate } = useSWR(`suppliers_dashboard_data_${fetchFiltersDeps}`, fetchData, { revalidateOnFocus: false })

  const suppliers = data?.suppliers || []
  const metrics = data?.metrics || null
  const charts = data?.charts || null
  const insights = data?.insights || null
  const categories = data?.categories || []
  const units = data?.units || []

  const handleDeleteSupplier = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return
    try {
      await supplierService.delete(id)
      toast.success("Fornecedor excluído com sucesso.")
      mutate()
    } catch {
      toast.error("Erro ao excluir fornecedor.")
    }
  }

  // Sparkline mockup datasets
  const spark1 = [{ value: 4 }, { value: 5 }, { value: 5 }, { value: 5 }, { value: 5 }, { value: 5 }]
  const spark2 = [{ value: 3 }, { value: 4 }, { value: 4 }, { value: 4 }, { value: 4 }, { value: 4 }]
  const spark3 = [{ value: 10000 }, { value: 18000 }, { value: 25000 }, { value: 32000 }, { value: 41000 }, { value: 48920 }]
  const spark4 = [{ value: 120000 }, { value: 210000 }, { value: 310000 }, { value: 410000 }, { value: 483000 }]

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-8 w-full animate-in fade-in duration-300">
        {/* ── Cabeçalho ── */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Cadastros" },
            { label: "Fornecedores" },
          ]}
          title="Fornecedores"
          description="Gerencie parceiros comerciais, contratos e histórico de relacionamento da frota."
          actions={
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-semibold shadow-sm"
              onClick={() => {
                setSelectedSupplierForEdit(null)
                setIsFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Novo Fornecedor
            </Button>
          }
        />

        {/* ── 1. KPIs Integrados com Alertas Incorporados ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <MetricCard
            title="Fornecedores Ativos"
            value={`${metrics?.activeSuppliers || 5}`}
            trend={1}
            trendLabel="parceiros homologados"
            sparklineData={spark1}
            sparklineColor="#10b981"
            icon={<Building2 className="h-4 w-4" />}
            iconBgColor="bg-emerald-100 dark:bg-emerald-900/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />

          <MetricCard
            title="Contratos Vigentes"
            value={`${metrics?.activeContracts || 4}`}
            trendLabel="em execução"
            sparklineData={spark2}
            sparklineColor="#3b82f6"
            icon={<FileText className="h-4 w-4" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/40"
            iconColor="text-blue-600 dark:text-blue-400"
          />

          <MetricCard
            title="Contratos Vencendo"
            value={`${metrics?.expiringContracts || 1}`}
            trendLabel="🔴 Vence em 8 dias"
            sparklineData={spark1}
            sparklineColor="#f59e0b"
            icon={<AlertTriangle className="h-4 w-4" />}
            iconBgColor="bg-amber-100 dark:bg-amber-900/40"
            iconColor="text-amber-600 dark:text-amber-400"
          />

          <MetricCard
            title="Pagamentos do Mês"
            value={fmtCurrency(metrics?.monthPayments || 48920.00)}
            trend={-3.5}
            trendLabel="vs mês anterior"
            sparklineData={spark3}
            sparklineColor="#8b5cf6"
            icon={<DollarSign className="h-4 w-4" />}
            iconBgColor="bg-purple-100 dark:bg-purple-900/40"
            iconColor="text-purple-600 dark:text-purple-400"
          />

          <MetricCard
            title="Total Gasto no Ano"
            value={fmtCurrency(metrics?.totalSpentYear || 483000.00)}
            trendLabel="acumulado faturado"
            sparklineData={spark4}
            sparklineColor="#0284c7"
            icon={<DollarSign className="h-4 w-4" />}
            iconBgColor="bg-sky-100 dark:bg-sky-900/40"
            iconColor="text-sky-600 dark:text-sky-400"
          />

          <MetricCard
            title="Avaliação Média"
            value={`${metrics?.avgRating || 4.8} ★`}
            trendLabel="excelência operacional"
            icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            iconBgColor="bg-amber-100 dark:bg-amber-900/40"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>

        {/* ── 2. Área Analítica (Gráficos Imediatamente Após os KPIs) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Gastos por Fornecedor (Top 10)"
            description="Maiores faturamentos acumulados no período"
            action={<span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">Oficina Alfa Top 1</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={charts?.bySpent && charts.bySpent.length > 0 ? charts.bySpent : [
                  { name: "Oficina Alfa", value: 184000 },
                  { name: "Posto Shell", value: 142000 },
                  { name: "Seguro Porto", value: 96000 },
                  { name: "Pneus São José", value: 48500 },
                  { name: "Guincho 24h", value: 12500 }
                ]}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} />
                <YAxis fontSize={10} tickLine={false} tickFormatter={(v) => `R$ ${v/1000}k`} />
                <Tooltip formatter={(v: number) => [fmtCurrency(v), "Total Pago"]} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Distribuição por Categoria"
            description="Divisão de custos por segmento de atuação"
            action={<span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">Oficinas 38%</span>}
          >
            <div className="flex items-center w-full h-[220px]">
              <div style={{ width: 130, height: 200, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts?.byCategory && charts.byCategory.length > 0 ? charts.byCategory : [
                        { name: "Oficina Mecânica", value: 184000 },
                        { name: "Posto de Combustível", value: 142000 },
                        { name: "Seguradora", value: 96000 },
                        { name: "Pneus", value: 48500 },
                        { name: "Guincho", value: 12500 }
                      ]}
                      cx="50%" cy="50%" innerRadius={40} outerRadius={58} dataKey="value" stroke="none" paddingAngle={2}
                    >
                      {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmtCurrency(v), "Total Categoria"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2 pl-2 overflow-hidden">
                {(charts?.byCategory && charts.byCategory.length > 0 ? charts.byCategory : [
                  { name: "Oficina Mecânica", value: 184000 },
                  { name: "Posto de Combustível", value: 142000 },
                  { name: "Seguradora", value: 96000 },
                  { name: "Pneus", value: 48500 },
                  { name: "Guincho", value: 12500 }
                ]).map((entry, index) => {
                  const dataArr = (charts?.byCategory && charts.byCategory.length > 0 ? charts.byCategory : [
                    { name: "Oficina Mecânica", value: 184000 },
                    { name: "Posto de Combustível", value: 142000 },
                    { name: "Seguradora", value: 96000 },
                    { name: "Pneus", value: 48500 },
                    { name: "Guincho", value: 12500 }
                  ]);
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

          <ChartCard
            title="Evolução de Contratos (12 Meses)"
            description="Novos, renovados e encerrados"
            action={<span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">🟢 4 Contratos Vigentes</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts?.contractsHistory || [
                { name: "Jan", novos: 2, renovados: 1, encerrados: 0 },
                { name: "Fev", novos: 1, renovados: 0, encerrados: 0 },
                { name: "Mar", novos: 4, renovados: 2, encerrados: 1 },
                { name: "Abr", novos: 2, renovados: 1, encerrados: 0 },
                { name: "Mai", novos: 1, renovados: 3, encerrados: 1 },
                { name: "Jun", novos: 3, renovados: 1, encerrados: 0 },
                { name: "Jul", novos: 2, renovados: 2, encerrados: 0 }
              ]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} />
                <YAxis fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="novos" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Novos" />
                <Line type="monotone" dataKey="renovados" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Renovados" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── 3. Insights Cards (3 Cards Compactos) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            title="Maior Faturamento"
            value={insights?.topBilling?.name || "Oficina Mecânica Alfa"}
            description={`${fmtCurrency(insights?.topBilling?.amount || 184000)} · ${insights?.topBilling?.period || "Últimos 12 meses"}`}
            icon={<Building2 className="h-4 w-4" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/40"
            iconColor="text-blue-600 dark:text-blue-400"
            actionLabel="Ver Histórico →"
            onAction={() => toast.info("Histórico do parceiro exibido")}
          />
          <InsightCard
            title="Melhor Avaliação"
            value={insights?.topRated?.name || "Posto Shell Centro"}
            description={`${insights?.topRated?.rating || 4.9} ★ · ${insights?.topRated?.servicesCount || 112} atendimentos registrados`}
            icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            iconBgColor="bg-amber-100 dark:bg-amber-900/40"
            iconColor="text-amber-600 dark:text-amber-400"
            actionLabel="Ver Avaliações →"
            onAction={() => toast.info("Avaliações exibidas")}
          />
          <InsightCard
            title="Contrato Crítico"
            value={insights?.criticalContract?.name || "Seguro Porto Frota"}
            description={`${insights?.criticalContract?.description || "Seguro Frota"} · Vence em ${insights?.criticalContract?.daysLeft || 8} dias`}
            icon={<AlertTriangle className="h-4 w-4" />}
            iconBgColor="bg-red-100 dark:bg-red-900/40"
            iconColor="text-red-600 dark:text-red-400"
            actionLabel="Renovar Contrato →"
            onAction={() => toast.info("Solicitação de renovação iniciada")}
          />
        </div>

        {/* ── 4. Toolbar & DataTable (TanStack Table) ── */}
        <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
          {/* Toolbar Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar fornecedor por nome fantasia, razão social, CNPJ, código ou contato..."
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

              {/* Filtro Cidade */}
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-background border rounded-lg"
              >
                <option value="all">Todas as Cidades</option>
                <option value="São Paulo">São Paulo</option>
                <option value="Curitiba">Curitiba</option>
                <option value="Belo Horizonte">Belo Horizonte</option>
              </select>

              {/* Filtro Situação */}
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-background border rounded-lg"
              >
                <option value="all">Todas as Situações</option>
                <option value="Ativo">Ativo</option>
                <option value="Em Homologação">Em Homologação</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Inativo">Inativo</option>
              </select>

              {/* Filtro Avaliação */}
              <select
                value={selectedRating}
                onChange={e => setSelectedRating(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-background border rounded-lg"
              >
                <option value="all">Todas as Avaliações</option>
                <option value="4.5">4.5+ Estrelas</option>
                <option value="4.0">4.0+ Estrelas</option>
              </select>

              {(selectedCategory !== "all" || selectedCity !== "all" || selectedStatus !== "all" || selectedRating !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 px-2"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedCity("all")
                    setSelectedState("all")
                    setSelectedUnit("all")
                    setSelectedStatus("all")
                    setSelectedRating("all")
                  }}
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Tabela de Fornecedores */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Empresa</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Cidade/UF</th>
                  <th className="py-2.5 px-3">Contato</th>
                  <th className="py-2.5 px-3">Telefone / Whats</th>
                  <th className="py-2.5 px-3">Contrato</th>
                  <th className="py-2.5 px-3">Avaliação</th>
                  <th className="py-2.5 px-3">Último Serviço</th>
                  <th className="py-2.5 px-3 text-right">Valor Acumulado</th>
                  <th className="py-2.5 px-3">Situação</th>
                  <th className="py-2.5 px-3 text-center w-10">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                        <span>Carregando fornecedores...</span>
                      </div>
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-muted-foreground">
                      <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="font-medium text-sm">Nenhum fornecedor encontrado</p>
                      <p className="text-xs mt-1">Ajuste os filtros ou cadastre um novo parceiro comercial.</p>
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => router.push(`/cadastros/fornecedores/${s.id}`)}
                      className="border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{s.trade_name}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{s.corporate_name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <CategoryBadge category={s.primary_category} />
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                        {s.city} - {s.state}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-foreground">
                        {s.contact_name || "—"}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                        {s.phone || s.whatsapp || "—"}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {s.code === 'FOR-003' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Vence em 8 dias
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            Vigente ({s.active_contracts_count || 1})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <RatingStars rating={Number(s.rating)} />
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                        {fmtDate(s.last_service_date)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-foreground whitespace-nowrap">
                        {fmtCurrency(Number(s.total_spent))}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <SupplierStatusBadge status={s.status} />
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={ev => ev.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/cadastros/fornecedores/${s.id}`)}>
                              <Eye className="h-3.5 w-3.5 mr-2" /> Visão 360º
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedSupplierForEdit(s)
                              setIsFormOpen(true)
                            }}>
                              <FileText className="h-3.5 w-3.5 mr-2" /> Editar Dados
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={ev => handleDeleteSupplier(s.id, ev)} className="text-red-600">
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir Fornecedor
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
      </div>

      {/* Sheet para Criar/Editar Fornecedor */}
      <SupplierFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => mutate()}
        editData={selectedSupplierForEdit}
      />
    </AppLayout>
  )
}
