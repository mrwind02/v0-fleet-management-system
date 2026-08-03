"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ColumnDef } from "@tanstack/react-table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  Copy,
  Sparkles,
  Printer,
  FileSpreadsheet,
  FileText,
  FileCode,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Table as TableIcon,
  PieChart as PieIcon,
  BarChart3
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MetricCard } from "@/components/ui/metric-card"
import { ChartCard } from "@/components/ui/chart-card"
import { DataTable, TableDensity } from "@/components/ui/data-table"
import { Toolbar } from "@/components/ui/toolbar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ReportConfig, ReportQueryResult, ExportFormat } from "@/types/reports"
import { generateExportBlob, generateAiInsights, openExecutivePdfPrintWindow } from "@/services/report-engine"

interface ReportPreviewProps {
  queryResult: ReportQueryResult
  onBack: () => void
  onEditFilters: () => void
  onDuplicate: () => void
  onSaveConfig: () => void
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"]

export function ReportPreview({
  queryResult,
  onBack,
  onEditFilters,
  onDuplicate,
  onSaveConfig
}: ReportPreviewProps) {
  const { report, kpis, chartData, columns, rows, timestamp, executionTimeMs } = queryResult
  const [searchValue, setSearchValue] = React.useState("")
  const [density, setDensity] = React.useState<TableDensity>("comfortable")
  const [aiInsight, setAiInsight] = React.useState<string | null>(null)
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportNotice, setExportNotice] = React.useState<string | null>(null)

  // Construct TanStack columns dynamically from report columns
  const tableColumns: ColumnDef<Record<string, any>>[] = React.useMemo(() => {
    return columns.map((col) => ({
      accessorKey: col.key,
      header: col.label,
      cell: ({ row }) => {
        const val = row.getValue(col.key)
        if (val === undefined || val === null) return "-"

        if (col.type === "currency" || typeof val === "number" && (col.key.toLowerCase().includes("cost") || col.key.toLowerCase().includes("amount") || col.key.toLowerCase().includes("price") || col.key.toLowerCase().includes("total"))) {
          return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val as number)
        }

        if (col.type === "badge" || col.key === "plate" || col.key === "osCode") {
          return (
            <Badge variant="outline" className="font-mono text-[11px] bg-muted/50 border-border">
              {String(val)}
            </Badge>
          )
        }

        if (col.type === "status" || col.key === "status") {
          const s = String(val)
          let statusStyle = "bg-green-500/10 text-green-600 border-green-500/20"
          if (s.includes("Manutenção") || s.includes("Aberto") || s.includes("Vencido") || s.includes("Crítico")) {
            statusStyle = "bg-red-500/10 text-red-600 border-red-500/20"
          } else if (s.includes("Alerta") || s.includes("Em Execução") || s.includes("Próximo")) {
            statusStyle = "bg-amber-500/10 text-amber-600 border-amber-500/20"
          }

          return (
            <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${statusStyle}`}>
              {s}
            </Badge>
          )
        }

        return String(val)
      }
    }))
  }, [columns])

  const handleExport = (format: ExportFormat) => {
    setIsExporting(true)

    if (format === "pdf" || format === "print") {
      openExecutivePdfPrintWindow(report, queryResult)
      setIsExporting(false)
      setExportNotice(`Relatório Executivo PDF preparado para impressão / salvamento!`)
      setTimeout(() => setExportNotice(null), 4000)
      return
    }

    setTimeout(() => {
      const exportData = generateExportBlob(report, queryResult, format)
      const url = URL.createObjectURL(exportData.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = exportData.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setIsExporting(false)
      setExportNotice(`Relatório baixado em ${format.toUpperCase()} com sucesso!`)
      setTimeout(() => setExportNotice(null), 4000)
    }, 400)
  }

  const handleGenerateAi = () => {
    const text = generateAiInsights(report, queryResult)
    setAiInsight(text)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-5 pb-8"
    >
      {/* TOP BAR / BACK NAVIGATION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card border border-border/70 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-9 px-3 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                {report.code}
              </span>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold px-2 py-0.5">
                {report.category}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                Executado em {timestamp} ({executionTimeMs}ms)
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground mt-0.5">{report.name}</h1>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditFilters}
            className="h-9 text-xs gap-1.5"
          >
            <Edit className="h-3.5 w-3.5" /> Editar Filtros
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAi}
            className="h-9 text-xs gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
          >
            <Sparkles className="h-3.5 w-3.5" /> Insights IA
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold">
                <Download className="h-3.5 w-3.5" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 text-xs">
                <FileText className="h-3.5 w-3.5 text-red-500" /> Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")} className="gap-2 text-xs">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> Exportar Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2 text-xs">
                <FileCode className="h-3.5 w-3.5 text-blue-500" /> Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("print")} className="gap-2 text-xs">
                <Printer className="h-3.5 w-3.5 text-slate-500" /> Impressão Direta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              <DropdownMenuItem onClick={onSaveConfig} className="gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-green-500" /> Salvar Configuração
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate} className="gap-2 text-xs">
                <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Duplicar Relatório
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* EXPORT NOTIFICATION NOTICE */}
      <AnimatePresence>
        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2"
          >
            <Check className="h-4 w-4 shrink-0" />
            {exportNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI INSIGHT PANEL */}
      <AnimatePresence>
        {aiInsight && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed relative"
          >
            <button
              onClick={() => setAiInsight(null)}
              className="absolute top-3 right-3 text-xs text-purple-600 hover:underline font-sans"
            >
              Fechar
            </button>
            {aiInsight}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI METRIC CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => (
          <MetricCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            trend={kpi.isPositive ? 4.2 : -1.5}
            trendLabel={kpi.change}
          />
        ))}
      </div>

      {/* CHART & VISUALIZATION BLOCK */}
      {(report.visualization === "grafico" ||
        report.visualization === "tabela_grafico" ||
        report.visualization === "dashboard") &&
        chartData.length > 0 && (
          <ChartCard
            title={`Visualização Gráfica — ${report.name}`}
            description={`Distribuição de dados agrupados por ${report.groupBy.toUpperCase()}`}
          >
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Valor / Total">
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

      {/* DATA TABLE BLOCK */}
      <div className="space-y-3">
        <Toolbar
          searchValue={searchValue}
          onSearch={setSearchValue}
          searchPlaceholder="Buscar no relatório gerado..."
          density={density}
          onDensityChange={setDensity}
          extraActions={
            <div className="text-xs font-semibold text-muted-foreground px-2">
              {rows.length} Registros Processados
            </div>
          }
        />

        <DataTable
          columns={tableColumns}
          data={rows}
          density={density}
          searchValue={searchValue}
          emptyStateTitle="Sem registros encontrados"
          emptyStateDescription="Tente ajustar os filtros dinâmicos ou parâmetros do relatório."
        />
      </div>
    </motion.div>
  )
}
