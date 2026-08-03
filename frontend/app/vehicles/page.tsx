"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { vehicleService, fuelService, expenseService, workOrderService } from "@/services/api"
import { fineService } from "@/services/fine.service"
import { vehicleDashboardService, VehicleDashboardMetrics } from "@/services/vehicle-dashboard"
import { AppLayout } from "@/components/layout/AppLayout"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { DataTable, TableDensity } from "@/components/ui/data-table"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Plus, Download, Car, Wrench, Activity, AlertCircle, CalendarClock, DollarSign, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import useSWR from "swr"

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
  status: "operando" | "manutencao" | "oficina" | "inativo" | "vendido"
  currentOdometer: number
  nextMaintenance: string
  docStatus: "ok" | "warning" | "expired"
  monthlyCost: number
  lastUpdate: string
}

function formatDriverName(name?: string): string {
  if (!name || name === "Não Atribuído" || name === "Sem motorista") return "Não Atribuído"
  if (name === name.toUpperCase()) {
    const lowercaseWords = ["de", "da", "do", "das", "dos", "e"]
    return name
      .toLowerCase()
      .split(" ")
      .map((word, i) => {
        if (i > 0 && lowercaseWords.includes(word)) return word
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(" ")
  }
  return name
}

export default function VehiclesPage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [density, setDensity] = useState<TableDensity>("compact")

  useEffect(() => {
    const savedDensity = localStorage.getItem("fleet:table-density") as TableDensity
    if (savedDensity) setDensity(savedDensity)
  }, [])

  const fetchData = async () => {
    try {
      let finesList: any[] = []
      try {
        const fines = await fineService.getFines()
        finesList = Array.isArray(fines) ? fines : []
      } catch (e) {}

      let fuelList: any[] = []
      try {
        const fuelRes = await fuelService.getAll()
        fuelList = fuelRes.data?.data || fuelRes.data || (Array.isArray(fuelRes) ? fuelRes : [])
      } catch (e) {}

      let expenseList: any[] = []
      try {
        const expenseRes = await expenseService.getAll()
        expenseList = Array.isArray(expenseRes) ? expenseRes : (expenseRes as any)?.data?.data || (expenseRes as any)?.data || []
      } catch (e) {}

      let workOrderList: any[] = []
      try {
        const woRes = await workOrderService.getAll()
        workOrderList = Array.isArray(woRes) ? woRes : (woRes as any)?.data?.data || (woRes as any)?.data || []
      } catch (e) {}

      const vehiclesRes = await vehicleService.getAll()
      const rawApiVehicles = vehiclesRes.data?.data || vehiclesRes.data || []

      // Delete old local caches
      if (typeof window !== "undefined") {
        localStorage.removeItem("frotaone_created_vehicles")
        localStorage.removeItem("frotaone_fuel_records")
        localStorage.removeItem("frotaone_expense_records")
      }

      const allRaw = [...rawApiVehicles]

      const mappedVehicles: ExtendedVehicle[] = allRaw.map((v: any) => {
        let realUnit = v.unitName || v.unit_name || "-"
        let realDriver = v.driverName || v.driver_name || "Não Atribuído"


        const vehicleFines = finesList.filter((f: any) => 
          (f.vehiclePlate && v.plate && f.vehiclePlate.toUpperCase() === v.plate.toUpperCase()) || 
          (f.vehicle_plate && v.plate && f.vehicle_plate.toUpperCase() === v.plate.toUpperCase()) ||
          (f.vehicleId && String(f.vehicleId) === String(v.id)) ||
          (f.vehicle_id && String(f.vehicle_id) === String(v.id)) ||
          (f.vehicle && v.plate && String(f.vehicle).toUpperCase().includes(v.plate.toUpperCase()))
        )
        const finesSum = vehicleFines.reduce((acc: number, f: any) => acc + (Number(f.amount || f.value) || 0), 0)

        const vehicleFuelings = fuelList.filter((f: any) =>
          (f.vehicleId && String(f.vehicleId) === String(v.id)) ||
          (f.vehicle_id && String(f.vehicle_id) === String(v.id)) ||
          (f.vehiclePlate && v.plate && f.vehiclePlate.toUpperCase() === v.plate.toUpperCase()) ||
          (f.vehicle_plate && v.plate && f.vehicle_plate.toUpperCase() === v.plate.toUpperCase())
        )
        const fuelSum = vehicleFuelings.reduce((acc: number, f: any) => acc + (Number(f.cost || f.totalCost) || 0), 0)

        const vehicleExpenses = expenseList.filter((ex: any) =>
          (ex.vehicleId && String(ex.vehicleId) === String(v.id)) ||
          (ex.vehicle_id && String(ex.vehicle_id) === String(v.id)) ||
          (ex.vehiclePlate && v.plate && ex.vehiclePlate.toUpperCase() === v.plate.toUpperCase()) ||
          (ex.vehicle_plate && v.plate && ex.vehicle_plate.toUpperCase() === v.plate.toUpperCase()) ||
          (ex.vehicle_info && v.plate && String(ex.vehicle_info).toUpperCase().includes(v.plate.toUpperCase()))
        )
        const expenseSum = vehicleExpenses.reduce((acc: number, ex: any) => acc + (Number(ex.amount || ex.value) || 0), 0)

        const vehicleWorkOrders = workOrderList.filter((wo: any) => {
          const isConcluded = wo.status?.toLowerCase() === 'concluída' || wo.status?.toLowerCase() === 'concluida'
          const matchesVehicle = (wo.vehicle_id && String(wo.vehicle_id) === String(v.id)) ||
                                 (wo.vehicleId && String(wo.vehicleId) === String(v.id)) ||
                                 (wo.vehicle_plate && v.plate && wo.vehicle_plate.toUpperCase() === v.plate.toUpperCase()) ||
                                 (wo.vehiclePlate && v.plate && wo.vehiclePlate.toUpperCase() === v.plate.toUpperCase())
          return isConcluded && matchesVehicle
        })
        const woSum = vehicleWorkOrders.reduce((acc: number, wo: any) => acc + (Number(wo.cost_total || wo.costTotal) || 0), 0)

        const totalVehicleCost = finesSum + fuelSum + expenseSum + woSum

        return {
          id: v.id,
          plate: v.plate || "S/PLACA",
          brand: v.brand || "",
          model: v.model || "",
          year: v.year || 2024,
          driverName: formatDriverName(realDriver),
          isActive: v.isActive !== false,
          unit: realUnit,
          status: v.status || (v.isActive !== false ? "operando" : "inativo"),
          currentOdometer: v.currentOdometer || v.current_odometer || 0,
          nextMaintenance: "-",
          docStatus: "ok",
          monthlyCost: totalVehicleCost,
          lastUpdate: new Date(v.updatedAt || v.updated_at || Date.now()).toLocaleDateString('pt-BR')
        }
      })

      const totalCount = mappedVehicles.length
      const activeCount = mappedVehicles.filter((v) => v.status === "operando").length
      const maintenanceCount = mappedVehicles.filter((v) => v.status === "manutencao" || v.status === "oficina").length
      const inactiveCount = mappedVehicles.filter((v) => v.status === "inativo").length
      const totalMonthlyCost = mappedVehicles.reduce((sum, v) => sum + (v.monthlyCost || 0), 0)
      const availability = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 100

      const computedMetrics: VehicleDashboardMetrics = {
        totalVehicles: totalCount,
        activeVehicles: activeCount,
        maintenanceVehicles: maintenanceCount,
        inactiveVehicles: inactiveCount,
        averageConsumption: 0,
        fleetAvailability: availability,
        monthlyCost: totalMonthlyCost,
        expiringDocuments: 0
      }
      
      const result = { vehicles: mappedVehicles, metrics: computedMetrics }
      if (typeof window !== "undefined") {
        localStorage.setItem("swr_cache_vehicles", JSON.stringify(result))
      }
      return result
    } catch (error) {
      console.error(error)
      return { vehicles: [], metrics: null }
    }
  }

  const { data, isLoading } = useSWR('dashboard_vehicles_and_metrics', fetchData, {
    revalidateOnFocus: false
  })

  const vehicles = data?.vehicles || []
  const metrics = data?.metrics || null
  const isTableLoading = isLoading && vehicles.length === 0

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
          <div className="flex flex-col min-w-[120px]">
            <span className="font-semibold text-foreground truncate max-w-[140px]">{v.brand} {v.model}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "plate",
      header: "Placa",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-semibold bg-muted/20 text-xs px-1.5 py-0 text-foreground border-transparent whitespace-nowrap">
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
          <div className="flex items-center gap-1.5 min-w-[120px]">
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex shrink-0 items-center justify-center text-[9px] font-bold text-blue-700 dark:text-blue-400">
              {name?.charAt(0)}
            </div>
            <span className="text-[11px] font-medium truncate max-w-[120px]">{name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "unit",
      header: "Unidade",
      cell: ({ row }) => <span className="text-muted-foreground whitespace-nowrap text-[11px]">{row.original.unit}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'operando') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 shadow-none text-[10px] whitespace-nowrap px-1.5 py-0 h-4">Em Operação</Badge>
        if (status === 'manutencao') return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 shadow-none text-[10px] whitespace-nowrap px-1.5 py-0 h-4">Em Manutenção</Badge>
        if (status === 'oficina') return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 shadow-none text-[10px] whitespace-nowrap px-1.5 py-0 h-4">Na Oficina</Badge>
        if (status === 'inativo') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 shadow-none text-[10px] whitespace-nowrap px-1.5 py-0 h-4">Inativo</Badge>
        if (status === 'vendido') return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0 shadow-none text-[10px] whitespace-nowrap px-1.5 py-0 h-4">Vendido</Badge>
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0 shadow-none text-[10px] whitespace-nowrap px-1.5 py-0 h-4">Desconhecido</Badge>
      }
    },
    {
      accessorKey: "currentOdometer",
      header: "Km Atual",
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">{row.original.currentOdometer.toLocaleString('pt-BR')} km</span>
      )
    },
    {
      accessorKey: "nextMaintenance",
      header: "Manutenção",
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
      header: "Docs",
      cell: ({ row }) => {
        const doc = row.original.docStatus
        if (doc === 'ok') return <span className="text-green-500 font-medium">Regular</span>
        if (doc === 'warning') return <span className="text-orange-500 font-medium">Vencendo</span>
        return <span className="text-red-500 font-medium">Vencido</span>
      }
    },
    {
      accessorKey: "monthlyCost",
      header: "Custo",
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.monthlyCost)}
        </span>
      )
    },
    {
      accessorKey: "lastUpdate",
      header: "Atualização",
      cell: ({ row }) => (
        <div className="flex items-center text-muted-foreground gap-1 whitespace-nowrap text-[11px]">
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
              title="Custo Total"
              value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(metrics.monthlyCost)}
              icon={<DollarSign className="h-4 w-4" />}
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
              className="[&_.truncate]:!whitespace-normal [&_.truncate]:!overflow-visible"
            />
          </div>
        )}

        {/* Toolbar & DataTable com espaçamento de 3mm */}
        <div className="mt-2 space-y-3">
          <TableToolbar 
            searchValue={globalFilter}
            onSearchChange={setGlobalFilter}
            searchPlaceholder="Buscar por placa, modelo, marca ou motorista..."
            allowImport={true}
            density={density}
            onDensityChange={handleDensityChange}
          />

          <DataTable 
            columns={columns} 
            data={vehicles} 
            density={density}
            searchKey="plate"
            searchValue={globalFilter}
            isLoading={isTableLoading}
            onRowClick={handleRowClick}
            emptyStateTitle="Nenhum veículo encontrado"
            emptyStateDescription="Tente ajustar os filtros ou cadastrar um novo veículo."
          />
        </div>

      </div>
    </AppLayout>
  )
}
