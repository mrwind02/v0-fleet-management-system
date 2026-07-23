"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { documentDashboardService, DocumentDashboardMetrics } from "@/services/document-dashboard"
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
import { FileText, FileCheck, FileWarning, AlertCircle, FileClock, ShieldCheck, Download, Plus, MoreHorizontal, TrendingUp } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/utils/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis, CartesianGrid } from "recharts"

type MockDocument = {
  id: string
  name: string
  category: "Veículo" | "Motorista" | "Seguro" | "Empresa" | "Contrato" | "Licença"
  relatedTo: string
  number: string
  issueDate: string
  expiryDate: string
  daysRemaining: number
  status: "Válido" | "Próximo do Vencimento" | "Vencido" | "Em Análise" | "Pendente" | "Aprovado" | "Arquivado"
  responsible: string
  lastUpdate: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<MockDocument[]>([])
  const [metrics, setMetrics] = useState<DocumentDashboardMetrics | null>(null)
  const [complianceData, setComplianceData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
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
      const [metricsData, compData, catData] = await Promise.all([
        documentDashboardService.getMetrics(),
        documentDashboardService.getComplianceData(),
        documentDashboardService.getCategoryData()
      ])
      
      setMetrics(metricsData)
      setComplianceData(compData)
      setCategoryData(catData)
      
      // Gerando dados mockados para a tabela
      const mockDocs: MockDocument[] = Array.from({ length: 45 }).map((_, i) => {
        const statuses: MockDocument["status"][] = ["Válido", "Próximo do Vencimento", "Vencido", "Em Análise", "Pendente"]
        const categories: MockDocument["category"][] = ["Veículo", "Motorista", "Seguro", "Empresa", "Contrato"]
        const status = statuses[i % statuses.length]
        
        let days = 300
        if (status === "Vencido") days = - (Math.floor(Math.random() * 30) + 1)
        else if (status === "Próximo do Vencimento") days = Math.floor(Math.random() * 25) + 1
        
        return {
          id: `doc-${i}`,
          name: i % 2 === 0 ? "Apólice de Seguro Frota" : "CNH Categoria E",
          category: categories[i % categories.length],
          relatedTo: i % 2 === 0 ? "Volvo FH16 (ABC1234)" : "João da Silva",
          number: `DOC-${10000 + i}`,
          issueDate: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('pt-BR'),
          expiryDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          daysRemaining: days,
          status,
          responsible: i % 3 === 0 ? "Admin" : "RH",
          lastUpdate: new Date(Date.now() - Math.random() * 1000000).toLocaleDateString('pt-BR')
        }
      })
      
      setDocuments(mockDocs)
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

  const handleRowClick = (doc: MockDocument) => {
    router.push(`/documents/${doc.id}`)
  }

  const mockAlerts: AlertItem[] = [
    { id: "1", type: "error", title: "5 documentos vencidos", description: "Impedindo operação de 3 veículos." },
    { id: "2", type: "warning", title: "12 vencem nos próximos 30 dias", description: "Verifique as renovações pendentes." },
    { id: "3", type: "warning", title: "Seguro da Scania R450 vence em 7 dias", description: "Aguardando aprovação da diretoria." },
    { id: "4", type: "error", title: "CNH de João Silva vence em 15 dias" }
  ]

  const columns: ColumnDef<MockDocument>[] = [
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
      cell: ({ row }) => <span className="text-xs font-mono">{row.original.number}</span>
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
            <span className={cn(
              "text-xs font-bold", 
              isExpired ? "text-red-600" : isWarning ? "text-orange-600" : "text-green-600"
            )}>
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
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.responsible}</span>
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

  const COLORS = ['#22c55e', '#f97316', '#ef4444'] // Success, Warning, Error
  const CAT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b']

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
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                Importar
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
            
            {/* Left Column: Charts & Insights (spans 3 columns) */}
            <div className="xl:col-span-3 flex flex-col gap-2">
              
              {/* Dashboard de Conformidade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <ChartCard title="Conformidade da Frota" description="Status geral dos documentos">
                  <div className="h-[180px] w-full relative">
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={complianceData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                            {complianceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value} docs`, 'Quantidade']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 text-[10px] font-medium text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Válidos</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> A Vencer</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Vencidos</span>
                  </div>
                </ChartCard>

                <ChartCard title="Documentos por Categoria" description="Distribuição na base">
                  <div className="h-[180px] w-full mt-2 relative">
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} opacity={0.3} />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={70} />
                          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
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
                
                <ChartCard title="Vencimentos por Mês" description="Previsão de renovações">
                  <div className="h-[180px] w-full mt-2 relative">
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: "Jan", value: 45 }, { name: "Fev", value: 30 }, { name: "Mar", value: 65 }, 
                          { name: "Abr", value: 20 }, { name: "Mai", value: 85 }, { name: "Jun", value: 40 }
                        ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                          <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Insight Cards (Executive Row) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <InsightCard 
                  title="Operação" 
                  value="3 Veículos" 
                  description="Impedidos por documentação vencida" 
                  icon={<AlertCircle className="h-4 w-4" />}
                  iconBgColor="bg-red-100 dark:bg-red-900/40"
                  iconColor="text-red-600 dark:text-red-400"
                  badgeText="Crítico"
                  badgeVariant="destructive"
                  actionLabel="Ver veículos bloqueados"
                />
                <InsightCard 
                  title="Prioridade" 
                  value="12 Docs" 
                  description="Vencem em até 30 dias" 
                  icon={<FileClock className="h-4 w-4" />}
                  iconBgColor="bg-orange-100 dark:bg-orange-900/40"
                  iconColor="text-orange-600 dark:text-orange-400"
                  badgeText="Atenção"
                  badgeVariant="warning"
                  actionLabel="Renovar agora"
                />
                <InsightCard 
                  title="Tendência" 
                  value="+15%" 
                  description="Vencimentos previstos p/ próx. mês" 
                  icon={<TrendingUp className="h-4 w-4" />}
                  iconBgColor="bg-blue-100 dark:bg-blue-900/40"
                  iconColor="text-blue-600 dark:text-blue-400"
                  badgeText="Info"
                  badgeVariant="default"
                  actionLabel="Ver previsão de custos"
                />
              </div>
            </div>

            {/* Right Column: Alerts (spans 1 column) */}
            <div className="xl:col-span-1">
              <AlertPanel 
                title="Atenção Operacional" 
                alerts={mockAlerts} 
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

      <NewDocumentModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </AppLayout>
  )
}
