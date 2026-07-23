"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { vehicleService } from "@/services/api"
import { vehicleDashboardService, VehicleDashboardMetrics } from "@/services/vehicle-dashboard"
import { AppLayout } from "@/components/layout/AppLayout"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { DataTable, TableDensity } from "@/components/ui/data-table"
import { Toolbar } from "@/components/ui/toolbar"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Plus, Download, Car, Wrench, Activity, AlertCircle, CalendarClock, DollarSign, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

// Extended type combining real API data with mock data as requested
type ExtendedVehicle = {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  driverName?: string
  isActive: boolean
  
  // Mocked fields for premium corporate feel
  unit: string
  status: "active" | "maintenance" | "inactive"
  currentOdometer: number
  nextMaintenance: string
  docStatus: "ok" | "warning" | "expired"
  monthlyCost: number
  lastUpdate: string
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<ExtendedVehicle[]>([])
  const [metrics, setMetrics] = useState<VehicleDashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState("")
  const [density, setDensity] = useState<TableDensity>("comfortable")

  useEffect(() => {
    // Carrega preferência de densidade salva
    const savedDensity = localStorage.getItem("fleet:table-density") as TableDensity
    if (savedDensity) setDensity(savedDensity)

    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [metricsData, vehiclesRes] = await Promise.all([
        vehicleDashboardService.getMetrics(),
        vehicleService.getAll()
      ])
      
      setMetrics(metricsData)
      
      const mappedVehicles: ExtendedVehicle[] = (vehiclesRes.data.data || []).map((v: any) => {
        return {
          id: v.id,
          plate: v.plate,
          brand: v.brand,
          model: v.model,
          year: v.year,
          driverName: v.driverName || "Não Atribuído",
          isActive: v.isActive,
          
          unit: "Matriz - SP", // Could be from DB later
          status: v.isActive ? "active" : "inactive",
          currentOdometer: v.currentOdometer || 0,
          nextMaintenance: "-", // Could be computed from maintenance records
          docStatus: "ok", // Could be computed from documents
          monthlyCost: 0, // Could be from expenses
          lastUpdate: new Date(v.updatedAt || Date.now()).toLocaleDateString('pt-BR')
        }
      })
      
      setVehicles(mappedVehicles)
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

  const handleRowClick = (vehicle: ExtendedVehicle) => {
    router.push(`/vehicles/${vehicle.id}`)
  }

  const columns: ColumnDef<ExtendedVehicle>[] = [
    {
      accessorKey: "vehicle",
      header: "Veículo",
      cell: ({ row }) => {
        const v = row.original
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{v.brand} {v.model}</span>
            <span className="text-muted-foreground text-[10px]">{v.year}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "plate",
      header: "Placa",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono bg-muted/20 text-xs px-1.5 py-0">
          {row.original.plate.toUpperCase()}
        </Badge>
      )
    },
    {
      accessorKey: "driverName",
      header: "Motorista",
      cell: ({ row }) => {
        const name = row.original.driverName
        if (name === "Não Atribuído") return <span className="text-muted-foreground italic text-xs">Sem motorista</span>
        return (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[9px] font-bold text-blue-700 dark:text-blue-400">
              {name?.charAt(0)}
            </div>
            <span className="text-xs font-medium">{name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "unit",
      header: "Unidade",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.unit}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'active') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 shadow-none text-[10px]">Em Operação</Badge>
        if (status === 'maintenance') return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 shadow-none text-[10px]">Manutenção</Badge>
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 shadow-none text-[10px]">Inativo</Badge>
      }
    },
    {
      accessorKey: "currentOdometer",
      header: "Quilometragem",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.currentOdometer.toLocaleString('pt-BR')} km</span>
      )
    },
    {
      accessorKey: "nextMaintenance",
      header: "Próx. Manutenção",
      cell: ({ row }) => {
        const val = row.original.nextMaintenance
        const isDelayed = val === "Atrasada"
        return (
          <span className={isDelayed ? "text-red-500 font-semibold" : "text-muted-foreground"}>
            {val}
          </span>
        )
      }
    },
    {
      accessorKey: "docStatus",
      header: "Documentos",
      cell: ({ row }) => {
        const doc = row.original.docStatus
        if (doc === 'ok') return <span className="text-green-500 font-medium">Regular</span>
        if (doc === 'warning') return <span className="text-orange-500 font-medium">Vencendo</span>
        return <span className="text-red-500 font-medium">Vencido</span>
      }
    },
    {
      accessorKey: "monthlyCost",
      header: "Custo Mês",
      cell: ({ row }) => (
        <span className="font-medium">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.monthlyCost)}
        </span>
      )
    },
    {
      accessorKey: "lastUpdate",
      header: "Atualização",
      cell: ({ row }) => (
        <div className="flex items-center text-muted-foreground gap-1">
          <Clock className="w-3 h-3" />
          {row.original.lastUpdate}
        </div>
      )
    }
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center text-xs font-semibold text-muted-foreground mb-1">
              <span className="cursor-pointer hover:underline">Frota</span>
              <ChevronRight className="h-3 w-3 mx-1.5" />
              <span className="text-foreground">Veículos</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Centro Operacional de Veículos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gerencie o ciclo de vida, manutenção e custos da frota.</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" className="h-9 text-xs shadow-sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="h-9 text-xs shadow-sm">
              Importar
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm"
              onClick={() => router.push('/vehicles/new')}
            >
              <Plus className="h-4 w-4 mr-1" /> Novo Veículo
            </Button>
          </div>
        </div>

        {/* KPIs Row */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              title="Total de Veículos"
              value={metrics.totalVehicles.toString()}
              icon={<Car className="h-4 w-4" />}
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <MetricCard
              title="Em Operação"
              value={metrics.activeVehicles.toString()}
              icon={<Activity className="h-4 w-4" />}
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            />
            <MetricCard
              title="Em Manutenção"
              value={metrics.maintenanceVehicles.toString()}
              icon={<Wrench className="h-4 w-4" />}
              iconBgColor="bg-orange-100 dark:bg-orange-900/30"
              iconColor="text-orange-600 dark:text-orange-400"
            />
            <MetricCard
              title="Docs Vencendo"
              value={metrics.expiringDocuments.toString()}
              icon={<AlertCircle className="h-4 w-4" />}
              iconBgColor="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-600 dark:text-red-400"
            />
            <MetricCard
              title="Disponibilidade"
              value={`${metrics.fleetAvailability}%`}
              icon={<CalendarClock className="h-4 w-4" />}
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <MetricCard
              title="Custo Total Mês"
              value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(metrics.monthlyCost)}
              icon={<DollarSign className="h-4 w-4" />}
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            />
          </div>
        )}

        {/* Toolbar & DataTable */}
        <div className="mt-2">
          <Toolbar 
            searchValue={globalFilter}
            onSearch={setGlobalFilter}
            searchPlaceholder="Buscar por placa, modelo, motorista..."
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
            data={vehicles} 
            density={density}
            searchKey="plate" // using simple filtering by plate for this demo
            searchValue={globalFilter}
            onRowClick={handleRowClick}
            emptyStateTitle="Nenhum veículo encontrado"
            emptyStateDescription="Tente ajustar os filtros ou cadastrar um novo veículo."
          />
        </div>

      </div>
    </AppLayout>
  )
}
