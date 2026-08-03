"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  Filter,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  CheckCircle2,
  SlidersHorizontal,
  Building2,
  Truck,
  Award,
  Wrench,
  DollarSign,
  Fuel,
  FileCheck,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Minus
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts"

import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/utils/utils"

import { ScoreCard } from "@/components/ui/score-card"
import { ExecutiveMetricCard } from "@/components/ui/executive-metric-card"
import { GoalCard } from "@/components/ui/goal-card"
import { InsightCard } from "@/components/ui/insight-card"
import { RankingCard } from "@/components/ui/ranking-card"

import { GlobalFilterState, IndicatorPeriod } from "@/types/indicators"
import { IndicatorsService } from "@/services/indicators.service"

export default function IndicatorsPage() {
  // Global Filter State
  const [filter, setFilter] = React.useState<GlobalFilterState>({
    period: "30_days",
    unit: "all",
    costCenter: "all",
    vehicle: "all",
    category: "all",
    operationType: "all"
  })

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [noticeMessage, setNoticeMessage] = React.useState<string | null>(null)
  const [isCustomizing, setIsCustomizing] = React.useState(false)
  const [temporalPeriod, setTemporalPeriod] = React.useState("month")

  const containerRef = React.useRef<HTMLDivElement>(null)

  // Fetch aggregated data
  const scoreData = IndicatorsService.getFleetScore(filter)
  const kpis = IndicatorsService.getExecutiveKpis(filter)
  const costEvolution = IndicatorsService.getCostEvolution()
  const fleetAvailability = IndicatorsService.getFleetAvailability()
  const costByCategory = IndicatorsService.getCostByCategory()
  const performanceCards = IndicatorsService.getPerformanceCards()
  const unitCostComparison = IndicatorsService.getUnitCostComparison()
  const maintenanceComparison = IndicatorsService.getMaintenanceComparison()
  const consumptionRanking = IndicatorsService.getConsumptionRanking()
  const goals = IndicatorsService.getGoals()
  const insights = IndicatorsService.getInsights()
  const rankings = IndicatorsService.getRankings()
  const temporalComparison = IndicatorsService.getTemporalComparison(temporalPeriod)

  const showNotice = (msg: string) => {
    setNoticeMessage(msg)
    setTimeout(() => setNoticeMessage(null), 4000)
  }

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleExportPdf = () => {
    showNotice("Gerando relatório executivo PDF com gráficos e KPIs...")
    setTimeout(() => {
      window.print()
    }, 800)
  }

  const handleSaveLayout = () => {
    showNotice("Layout de Indicadores salvo com sucesso nas preferências do gestor!")
    setIsCustomizing(false)
  }

  return (
    <AppLayout>
      <div
        ref={containerRef}
        className={cn(
          "flex flex-col gap-5 pb-12 bg-background",
          isFullscreen && "h-screen overflow-y-auto p-6 bg-background text-foreground"
        )}
      >
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-border/40 pb-4">
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Indicadores", href: "/reports/indicators" }
            ]}
            title="Indicadores Estratégicos"
            description="Acompanhe os principais KPIs da operação com comparativos históricos, metas e tendências."
          />

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <Button
              variant={isCustomizing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="text-xs gap-1.5 h-9 shrink-0 whitespace-nowrap"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {isCustomizing ? "Concluir Ajustes" : "Personalizar Painel"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveLayout}
              className="text-xs gap-1.5 h-9 shrink-0 whitespace-nowrap"
            >
              <Save className="h-3.5 w-3.5" />
              Salvar Layout
            </Button>

            <Button
              size="sm"
              onClick={handleExportPdf}
              className="text-xs gap-1.5 h-9 bg-primary text-primary-foreground font-semibold shrink-0 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
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

        {/* FILTRO GLOBAL (BLOCO ESTÁTICO NÃO FIXO) */}
        <div className="bg-card border border-border/80 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              Filtro Global da Operação
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Sincronização em Tempo Real • ERP FrotaOne
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div>
              <Label className="text-[11px] text-muted-foreground">Período</Label>
              <select
                value={filter.period}
                onChange={(e) => setFilter({ ...filter, period: e.target.value as IndicatorPeriod })}
                className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs mt-1"
              >
                <option value="30_days">Últimos 30 dias</option>
                <option value="current_month">Mês Atual</option>
                <option value="quarter">Trimestre Atual</option>
                <option value="year">Ano de 2026</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Unidade / Filial</Label>
              <select
                value={filter.unit}
                onChange={(e) => setFilter({ ...filter, unit: e.target.value })}
                className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs mt-1"
              >
                <option value="all">Todas as Unidades</option>
                <option value="sp">Matriz SP</option>
                <option value="rj">Filial RJ</option>
                <option value="mg">Filial MG</option>
                <option value="pr">Filial PR</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Centro de Custo</Label>
              <select
                value={filter.costCenter}
                onChange={(e) => setFilter({ ...filter, costCenter: e.target.value })}
                className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs mt-1"
              >
                <option value="all">Todos os Centros</option>
                <option value="op">Operacional / Logística</option>
                <option value="maint">Engenharia de Manutenção</option>
                <option value="adm">Administrativo</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Veículo</Label>
              <select
                value={filter.vehicle}
                onChange={(e) => setFilter({ ...filter, vehicle: e.target.value })}
                className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs mt-1"
              >
                <option value="all">Todos os Veículos</option>
                <option value="v1">Volvo FH 540 (ABC-1234)</option>
                <option value="v2">Scania R450 (DEF-5678)</option>
                <option value="v3">Mercedes Actros (GHI-9012)</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Categoria</Label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs mt-1"
              >
                <option value="all">Todas as Categorias</option>
                <option value="heavy">Caminhões Pesados</option>
                <option value="light">Utilitários Leves</option>
                <option value="trailer">Semirreboques</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Tipo de Operação</Label>
              <select
                value={filter.operationType}
                onChange={(e) => setFilter({ ...filter, operationType: e.target.value })}
                className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs mt-1"
              >
                <option value="all">Todas as Operações</option>
                <option value="road">Rodoviário Longa Distância</option>
                <option value="urban">Distribuição Urbana</option>
                <option value="transfer">Transferência Intermunicipal</option>
              </select>
            </div>
          </div>
        </div>

        {/* DIFERENCIAL FROTAONE: SCORE OPERACIONAL DA FROTA (0-100) */}
        <ScoreCard scoreData={scoreData} />

        {/* PRIMEIRA LINHA: KPIS ESTRATÉGICOS (6 EXECUTIVE METRIC CARDS) */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> KPIs de Desempenho Executivo
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map((kpi) => (
              <ExecutiveMetricCard key={kpi.id} item={kpi} />
            ))}
          </div>
        </div>

        {/* SEGUNDA LINHA: GRÁFICOS EXECUTIVOS (3 PAINÉIS DE GRÁFICO) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart 1: Evolução dos Custos 12 Meses */}
          <div className="lg:col-span-2 bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">Evolução dos Custos Operacionais</h3>
                <p className="text-xs text-muted-foreground">Histórico de 12 meses empilhado por abastecimentos, manutenção e despesas</p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">12 Meses</Badge>
            </div>

            <div className="h-[260px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costEvolution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))}
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="fuel" name="Abastecimentos" stroke="#0F5DFB" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="maintenance" name="Manutenção" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="expenses" name="Despesas" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fines" name="Multas" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Custos por Categoria Breakdown */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Distribuição de Custos</h3>
              <p className="text-xs text-muted-foreground">Participação relativa por categoria de custo</p>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, "Participação"]}
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                    {costByCategory.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t text-xs">
              {costByCategory.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cat.value)} ({cat.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TERCEIRA LINHA: PERFORMANCE OPERACIONAL (4 CARDS DE DESTAQUE) */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-amber-500" /> Performance Operacional & Destaques
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {performanceCards.map((card, idx) => (
              <div key={idx} className="bg-card border rounded-2xl p-4 space-y-2.5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-foreground">{card.title}</span>
                  <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {card.badgeLabel}
                  </Badge>
                </div>

                <div>
                  <div className="text-2xl font-extrabold text-foreground font-mono tracking-tight leading-none">
                    {card.mainValue}
                  </div>
                  <span className="text-xs font-bold text-primary block mt-1">
                    {card.subValue}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  {card.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* QUARTA LINHA: COMPARATIVOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Custo por Unidade (Horizontal Bar) */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Custo por Unidade (R$/km)</h3>
              <p className="text-xs text-muted-foreground">Comparativo entre Matriz e Filiais estaduais</p>
            </div>

            <div className="h-[210px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitCostComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 4]} tickFormatter={(v) => `R$ ${v}`} />
                  <YAxis type="category" dataKey="unit" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip
                    formatter={(val: any) => [`R$ ${val}/km`, "Custo Operacional"]}
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="costPerKm" fill="#0F5DFB" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Manutenções: Preventiva x Corretiva (Stacked Bar) */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Preventiva × Corretiva (%)</h3>
              <p className="text-xs text-muted-foreground">Proporção de OS preventivas e corretivas</p>
            </div>

            <div className="h-[210px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceComparison}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, "Proporção"]}
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="preventive" name="Preventiva" stackId="a" fill="#10B981" />
                  <Bar dataKey="corrective" name="Corretiva" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Consumo Médio por Veículo (Ranking Bar) */}
          <div className="bg-card border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Consumo Médio por Veículo</h3>
              <p className="text-xs text-muted-foreground">Eficiência km/L nos modelos com maior rodagem</p>
            </div>

            <div className="h-[210px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionRanking} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 5]} tickFormatter={(v) => `${v} km/L`} />
                  <YAxis type="category" dataKey="vehicle" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip
                    formatter={(val: any) => [`${val} km/L`, "Média Consumo"]}
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="kmPerLiter" fill="#10B981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* QUINTA LINHA: PAINEL EXCLUSIVO DE METAS */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-primary" /> Acompanhamento de Metas Estratégicas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {goals.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </div>

        {/* SEXTA LINHA: INSIGHTS AUTOMÁTICOS (3 INSIGHT CARDS) */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Insights Automáticos da Operação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((ins) => (
              <InsightCard
                key={ins.id}
                title={ins.title}
                value={ins.highlightValue}
                description={ins.description}
                badgeText="IA FrotaOne"
                badgeVariant="secondary"
              />
            ))}
          </div>
        </div>

        {/* SÉTIMA LINHA: RANKING TOP 10 (ABAS VEÍCULOS, MOTORISTAS, UNIDADES, FORNECEDORES) */}
        <RankingCard rankings={rankings} />

        {/* OITAVA LINHA: COMPARATIVO TEMPORAL */}
        <div className="bg-card border rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Comparativo Temporal de Desempenho</h3>
              <p className="text-xs text-muted-foreground">Compare o desempenho atual com períodos históricos anteriores</p>
            </div>

            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
              {(["month", "quarter", "year"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTemporalPeriod(p)}
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize",
                    temporalPeriod === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p === "month" ? "Mês a Mês" : p === "quarter" ? "Trimestre" : "Ano a Ano"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {temporalComparison.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{item.metric}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-mono">
                    <span>Antes: <strong>{item.periodBefore}</strong></span>
                    <span>→</span>
                    <span>Atual: <strong className="text-foreground">{item.periodAfter}</strong></span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-bold font-mono px-2 py-0.5 gap-1",
                    item.isBetter ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                  )}
                >
                  {item.variationPercent > 0 ? `+${item.variationPercent}%` : `${item.variationPercent}%`}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* TOOLBAR FLUTUANTE DE AÇÕES E TELA CHEIA */}
        <div className="fixed bottom-4 right-4 z-40 bg-slate-900/90 text-white backdrop-blur border border-slate-700/80 p-2 rounded-2xl shadow-2xl flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-8 text-xs gap-1.5 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {isFullscreen ? "Sair Tela Cheia" : "Tela Cheia"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => showNotice("Dados de todos os módulos atualizados em tempo real!")}
            className="h-8 text-xs gap-1.5 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Atualizar
          </Button>

          <Button
            size="sm"
            onClick={handleExportPdf}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold px-3"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
