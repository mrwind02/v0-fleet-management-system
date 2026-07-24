"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { documentDashboardService, DocumentDashboardMetrics } from "@/services/document-dashboard"
import { documentService } from "@/services/document.service"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { DataTable, TableDensity } from "@/components/ui/data-table"
import { Toolbar } from "@/components/ui/toolbar"
import { Badge } from "@/components/ui/badge"
import { StatusPill } from "@/components/ui/status-pill"
import { PageHeader } from "@/components/ui/page-header"
import { InsightCard } from "@/components/ui/insight-card"
import { AlertPanel, AlertItem } from "@/components/ui/alert-panel"
import { ChartCard } from "@/components/ui/chart-card"
import { NewDocumentModal } from "./new-document-modal"
import { FileText, FileWarning, AlertCircle, FileClock, ShieldCheck, Download, Plus, MoreHorizontal } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/utils/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis, CartesianGrid, Label } from "recharts"

type RealDocument = {
  id: string
  name: string
  category: string
  relatedTo: string
  number: string
  issueDate: string
  expiryDate: string
  daysRemaining: number
  status: string
  responsible: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<RealDocument[]>([])
  const [metrics, setMetrics] = useState<DocumentDashboardMetrics | null>(null)
  const [complianceData, setComplianceData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [expiryData, setExpiryData] = useState<any[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState("")
  const [density, setDensity] = useState<TableDensity>("comfortable")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const savedDensity = localStorage.getItem("fleet:table-density") as TableDensity
    if (savedDensity) setDensity(savedDensity)
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [metricsData, compData, catData, expiryMonthData, docsData] = await Promise.all([
        documentDashboardService.getMetrics(),
        documentDashboardService.getComplianceData(),
        documentDashboardService.getCategoryData(),
        documentDashboardService.getExpiryByMonth(),
        documentService.getDocuments()
      ])

      setMetrics(metricsData)
      setComplianceData(compData)
      setCategoryData(catData)
      setExpiryData(expiryMonthData)

      // Build real-time alerts from metrics
      const dynamicAlerts: AlertItem[] = []
      if (metricsData.expiredDocuments > 0) {
        dynamicAlerts.push({
          id: "expired",
          type: "error",
          title: `${metricsData.expiredDocuments} documento(s) vencido(s)`,
          description: "Requer atenção imediata para regularização."
        })
      }
      if (metricsData.expiringDocuments > 0) {
        dynamicAlerts.push({
          id: "expiring",
          type: "warning",
          title: `${metricsData.expiringDocuments} documento(s) vencem nos próximos 30 dias`,
          description: "Verifique as renovações pendentes."
        })
      }
      if (metricsData.pendingApproval > 0) {
        dynamicAlerts.push({
          id: "pending",
          type: "info" as any,
          title: `${metricsData.pendingApproval} documento(s) em análise / pendentes`,
          description: "Aguardando aprovação ou complemento."
        })
      }
      setAlerts(dynamicAlerts)

      const formattedDocs = (docsData || []).map((doc: any) => ({
        ...doc,
        relatedTo: doc.vehicle_plate
          ? `Veículo ${doc.vehicle_plate}`
          : doc.driver_name
          ? `Motorista ${doc.driver_name}`
          : doc.related_to || "-",
        issueDate: doc.issue_date ? new Date(doc.issue_date).toLocaleDateString("pt-BR") : "-",
        expiryDate: doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString("pt-BR") : "-",
        daysRemaining: doc.expiry_date
          ? Math.ceil((new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      }))

      setDocuments(formattedDocs)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDensityChange = (newDensity: TableDensity) => {
    setDensity(newDensity)
    localStorage.setItem("fleet:table-density", newDensity)
  }

  const handleRowClick = (doc: RealDocument) => {
    router.push(`/documents/${doc.id}`)
  }

  const columns: ColumnDef<RealDocument>[] = [
    {
      accessorKey: "name",
      header: "Documento",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="font-semibold text-foreground text-xs truncate max-w-[150px]" title={row.original.name}>
            {row.original.name}
          </span>
        </div>
      )
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-medium bg-muted/30">
          {row.original.category}
        </Badge>
      )
    },
    {
      accessorKey: "relatedTo",
      header: "Relacionado",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.relatedTo}</span>
    },
    {
      accessorKey: "number",
      header: "Número",
      cell: ({ row }) => <span className="text-xs font-mono">{row.original.number || "-"}</span>
    },
    {
      accessorKey: "issueDate",
      header: "Emissão",
      cell: ({ row }) => <span className="text-xs">{row.original.issueDate}</span>
    },
    {
      accessorKey: "expiryDate",
      header: "Validade",
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.expiryDate}</span>
    },
    {
      accessorKey: "daysRemaining",
      header: "Indicador",
      cell: ({ row }) => {
        const days = row.original.daysRemaining
        const isExpired = days < 0
        const isWarning = days >= 0 && days <= 30
        return (
          <div className="flex flex-col">
            <span className={cn("text-xs font-bold", isExpired ? "text-red-600" : isWarning ? "text-orange-600" : "text-green-600")}>
              {isExpired ? "Vencido" : "Vence em"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {isExpired ? `há ${Math.abs(days)} dias` : `${days} dias`}
            </span>
          </div>
        )
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        let variant: any = "default"
        if (status === "Válido" || status === "Aprovado") variant = "success"
        else if (status === "Vencido") variant = "destructive"
        else if (status === "Próximo do Vencimento" || status === "Pendente") variant = "warning"
        return <StatusPill status={variant} label={status} className="text-[10px]" />
      }
    },
    {
      accessorKey: "responsible",
      header: "Responsável",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.responsible || "-"}</span>
    },
    {
      id: "actions",
      cell: () => (
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )
    }
  ]

  const COMPLIANCE_COLORS = ["#22c55e", "#f97316", "#ef4444"]
  const CAT_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"]

  const totalCompliance = complianceData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 pb-2 w-full animate-in fade-in duration-300">

        <PageHeader
          breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Frota" }, { label: "Documentos" }]}
          title="Documentos"
          description="Gerencie toda a documentação de veículos, motoristas e seguros da empresa."
          actions={
            <>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Novo Documento
              </Button>
            </>
          }
        />

        {metrics && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-2 mb-2">

            {/* Left Column: Charts & Insights */}
            <div className="xl:col-span-3 flex flex-col gap-2">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Compliance Donut */}
                <ChartCard title="Conformidade da Frota" description="Status geral dos documentos">
                  <div className="flex items-center w-full" style={{ height: 180 }}>
                    <div style={{ width: 150, height: 180, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={complianceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {complianceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COMPLIANCE_COLORS[index % COMPLIANCE_COLORS.length]} />
                            ))}
                            <Label
                              content={({ viewBox }: any) => {
                                const { cx, cy } = viewBox
                                return (
                                  <g>
                                    <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 10, fill: "var(--muted-foreground)" }}>Total</text>
                                    <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: "var(--foreground)" }}>
                                      {totalCompliance}
                                    </text>
                                  </g>
                                )
                              }}
                            />
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value} docs`, "Quantidade"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-2 pl-2">
                      {complianceData.map((entry, index) => {
                        const percentage = totalCompliance > 0 ? ((entry.value / totalCompliance) * 100).toFixed(1) : "0.0"
                        return (
                          <div key={entry.name} className="flex items-start gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: COMPLIANCE_COLORS[index % COMPLIANCE_COLORS.length] }}></div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-medium text-foreground leading-none mb-0.5">{entry.name}</span>
                              <span className="text-[9px] text-muted-foreground leading-none">{entry.value} docs ({percentage}%)</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </ChartCard>

                {/* Category Bar Chart */}
                <ChartCard title="Documentos por Categoria" description="Distribuição na base">
                  <div className="h-[180px] w-full mt-2 relative">
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} opacity={0.3} />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={70} />
                          <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CAT_COLORS[index % CAT_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </ChartCard>

                {/* Expiry Forecast Bar Chart */}
                <ChartCard title="Vencimentos por Mês" description="Previsão dos próximos 6 meses">
                  <div className="h-[180px] w-full mt-2 relative">
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expiryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} formatter={(value) => [`${value} docs`, "Vencimentos"]} />
                          <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Insight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <InsightCard
                  title="Total de Documentos"
                  value={`${metrics.totalDocuments}`}
                  description="Documentos cadastrados no sistema"
                  icon={<FileText className="h-4 w-4" />}
                  iconBgColor="bg-blue-100 dark:bg-blue-900/40"
                  iconColor="text-blue-600 dark:text-blue-400"
                  badgeText={`${metrics.complianceIndex}% conformidade`}
                  badgeVariant="default"
                />
                <InsightCard
                  title="A Vencer (30 dias)"
                  value={`${metrics.expiringDocuments} Docs`}
                  description="Requerem renovação em breve"
                  icon={<FileClock className="h-4 w-4" />}
                  iconBgColor="bg-orange-100 dark:bg-orange-900/40"
                  iconColor="text-orange-600 dark:text-orange-400"
                  badgeText={metrics.expiringDocuments > 0 ? "Atenção" : "Ok"}
                  badgeVariant={metrics.expiringDocuments > 0 ? "warning" : "default"}
                />
                <InsightCard
                  title="Vencidos"
                  value={`${metrics.expiredDocuments} Docs`}
                  description="Documentos fora da validade"
                  icon={<FileWarning className="h-4 w-4" />}
                  iconBgColor="bg-red-100 dark:bg-red-900/40"
                  iconColor="text-red-600 dark:text-red-400"
                  badgeText={metrics.expiredDocuments > 0 ? "Crítico" : "Ok"}
                  badgeVariant={metrics.expiredDocuments > 0 ? "destructive" : "default"}
                />
              </div>
            </div>

            {/* Right Column: Alerts */}
            <div className="xl:col-span-1">
              <AlertPanel
                title="Atenção Operacional"
                alerts={alerts.length > 0 ? alerts : [{ id: "ok", type: "info" as any, title: "Documentação em dia", description: "Nenhum alerta no momento." }]}
                className="h-full border-red-200/50 dark:border-red-900/30"
              />
            </div>

          </div>
        )}

        <div className="mt-2">
          <Toolbar
            searchValue={globalFilter}
            onSearch={setGlobalFilter}
            searchPlaceholder="Buscar por documento, veículo ou responsável..."
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
            data={documents}
            density={density}
            searchKey="name"
            searchValue={globalFilter}
            onRowClick={handleRowClick}
            emptyStateTitle="Nenhum documento encontrado"
            emptyStateDescription="Tente ajustar os filtros ou adicione um novo documento."
          />
        </div>

      </div>

      <NewDocumentModal open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={fetchData} />
    </AppLayout>
  )
}
