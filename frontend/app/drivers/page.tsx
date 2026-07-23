"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { driverService } from "@/services/api"
import { driverDashboardService, DriverDashboardMetrics } from "@/services/driver-dashboard"
import { AppLayout } from "@/components/layout/AppLayout"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { DataTable, TableDensity } from "@/components/ui/data-table"
import { Toolbar } from "@/components/ui/toolbar"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { InsightCard } from "@/components/ui/insight-card"
import { Users, UserCheck, UserMinus, Car, FileWarning, GraduationCap, Download, Plus, TrendingUp } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/utils/utils"

// Extended type combining real API data with mock data
type ExtendedDriver = {
  id: string
  name: string
  registration: string // matricula
  cnhNumber: string
  cnhCategory: string
  
  // Mocked fields
  currentVehicle: string | null
  unit: string
  status: "Em Operação" | "Disponível" | "Férias" | "Afastado" | "Suspenso"
  score: number
  nextExpiration: string
  finesCount: number
  lastUpdate: string
}

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<ExtendedDriver[]>([])
  const [metrics, setMetrics] = useState<DriverDashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState("")
  const [density, setDensity] = useState<TableDensity>("comfortable")

  useEffect(() => {
    const savedDensity = localStorage.getItem("fleet:table-density") as TableDensity
    if (savedDensity) setDensity(savedDensity)
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [metricsData, driversRes] = await Promise.all([
        driverDashboardService.getMetrics(),
        driverService.getAll()
      ])
      
      setMetrics(metricsData)
      
      const mappedDrivers: ExtendedDriver[] = (driversRes.data.data || []).map((d: any) => {
        return {
          id: d.id,
          name: d.name,
          registration: d.cnh ? d.cnh.substring(0, 6) : `N/A`,
          cnhNumber: d.cnh || "N/A",
          cnhCategory: d.cnhCategory || "E",
          
          currentVehicle: d.isActive ? "Veículo Designado" : null, // From DB later
          unit: "Matriz - SP",
          status: d.isActive ? "Em Operação" : "Disponível",
          score: 100, // Real score calculation later
          nextExpiration: new Date(d.cnhExpiryDate || Date.now()).toLocaleDateString('pt-BR'),
          finesCount: 0, // Should come from DB
          lastUpdate: new Date(d.updatedAt || Date.now()).toLocaleDateString('pt-BR')
        }
      })
      
      setDrivers(mappedDrivers)
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

  const handleRowClick = (driver: ExtendedDriver) => {
    router.push(`/drivers/${driver.id}`)
  }

  const columns: ColumnDef<ExtendedDriver>[] = [
    {
      accessorKey: "name",
      header: "Motorista",
      cell: ({ row }) => {
        const d = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400 shrink-0">
              {d.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-xs">{d.name}</span>
              <span className="text-muted-foreground text-[10px]">{d.registration}</span>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "cnhNumber",
      header: "CNH",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs">{row.original.cnhNumber}</span>
          <span className="text-[10px] text-muted-foreground">Cat. {row.original.cnhCategory}</span>
        </div>
      )
    },
    {
      accessorKey: "currentVehicle",
      header: "Veículo Atual",
      cell: ({ row }) => (
        <span className="text-xs">
          {row.original.currentVehicle || <span className="text-muted-foreground italic">Sem veículo</span>}
        </span>
      )
    },
    {
      accessorKey: "unit",
      header: "Unidade",
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.unit}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const getStyles = () => {
          switch (status) {
            case "Em Operação": return "bg-green-100 text-green-700 hover:bg-green-100"
            case "Disponível": return "bg-blue-100 text-blue-700 hover:bg-blue-100"
            case "Férias": return "bg-purple-100 text-purple-700 hover:bg-purple-100"
            case "Suspenso": return "bg-red-100 text-red-700 hover:bg-red-100"
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-100"
          }
        }
        return <Badge className={cn("border-0 shadow-none text-[10px]", getStyles())}>{status}</Badge>
      }
    },
    {
      accessorKey: "score",
      header: "Indicador",
      cell: ({ row }) => {
        const score = row.original.score
        const getColor = () => {
          if (score >= 90) return "text-green-600 bg-green-50 dark:bg-green-900/20"
          if (score >= 70) return "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
          return "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
        }
        return (
          <span className={cn("font-bold text-xs px-2 py-1 rounded-md", getColor())}>
            {score}
          </span>
        )
      }
    },
    {
      accessorKey: "nextExpiration",
      header: "Próx. Vencimento",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.nextExpiration}</span>
    },
    {
      accessorKey: "finesCount",
      header: "Multas",
      cell: ({ row }) => {
        const fines = row.original.finesCount
        return (
          <span className={cn("text-xs font-semibold", fines > 0 ? "text-red-500" : "text-muted-foreground")}>
            {fines}
          </span>
        )
      }
    }
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 pb-2 w-full animate-in fade-in duration-300">
        
        <PageHeader 
          breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Frota" }, { label: "Motoristas" }]}
          title="Motoristas"
          description="Gerencie todos os condutores cadastrados na empresa."
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
                onClick={() => router.push('/drivers/new')}
              >
                <Plus className="h-4 w-4 mr-1" /> Novo Motorista
              </Button>
            </>
          }
        />

        {/* Reduced Clutter: MetricCards removed */}

        {/* Insight Cards (Executive Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2 mt-2">
          <InsightCard 
            title="Prioridade" 
            value="12 Motoristas" 
            description="Curso MOPP vencendo em 30 dias" 
            icon={<GraduationCap className="h-4 w-4" />}
            iconBgColor="bg-orange-100 dark:bg-orange-900/40"
            iconColor="text-orange-600 dark:text-orange-400"
            badgeText="Atenção"
            badgeVariant="warning"
            actionLabel="Verificar vencimentos"
          />
          <InsightCard 
            title="Desempenho" 
            value="+14%" 
            description="Aumento de produtividade geral" 
            icon={<TrendingUp className="h-4 w-4" />}
            iconBgColor="bg-green-100 dark:bg-green-900/40"
            iconColor="text-green-600 dark:text-green-400"
            badgeText="Excelente"
            badgeVariant="success"
            actionLabel="Ver relatório completo"
          />
          <InsightCard 
            title="Operação" 
            value="15 Condutores" 
            description="Disponíveis para alocação" 
            icon={<UserCheck className="h-4 w-4" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/40"
            iconColor="text-blue-600 dark:text-blue-400"
            badgeText="Info"
            badgeVariant="default"
            actionLabel="Alocar motoristas"
          />
        </div>

        <div className="mt-2">

          <Toolbar 
            searchValue={globalFilter}
            onSearch={setGlobalFilter}
            searchPlaceholder="Buscar por nome, matrícula, CNH..."
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
            data={drivers} 
            density={density}
            searchKey="name" 
            searchValue={globalFilter}
            onRowClick={handleRowClick}
            emptyStateTitle="Nenhum motorista encontrado"
            emptyStateDescription="Tente ajustar os filtros ou cadastrar um novo motorista."
          />
        </div>

      </div>
    </AppLayout>
  )
}
