"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { fuelService, vehicleService } from "@/services/api"
import { AppLayout } from "@/components/layout/AppLayout"
import { MetricCard } from "@/components/ui/metric-card"
import { ChartCard } from "@/components/ui/chart-card"
import { InsightCard } from "@/components/ui/insight-card"
import { AlertPanel } from "@/components/ui/alert-panel"
import { Button } from "@/components/ui/button"
import { DataTable, TableDensity } from "@/components/ui/data-table"
import { Toolbar } from "@/components/ui/toolbar"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Plus, Download, Droplet, Activity, DollarSign, TrendingDown, Clock, Search } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Legend } from "recharts"
import { FuelFormSheet } from "@/components/fuel/FuelFormSheet"
import { useSearchParams } from "next/navigation"

function FuelDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultVehicleId = searchParams.get("vehicleId") || undefined

  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState("")
  const [density, setDensity] = useState<TableDensity>("compact")
  const [isFormOpen, setIsFormOpen] = useState(!!defaultVehicleId)

  // Metrics state (computed on frontend for now)
  const [metrics, setMetrics] = useState({
    totalCost: 0,
    totalLiters: 0,
    avgConsumption: 0,
    avgCostPerLiter: 0
  })

  // Chart data states
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [vehicleData, setVehicleData] = useState<any[]>([])
  const [fuelTypeData, setFuelTypeData] = useState<any[]>([])

  useEffect(() => {
    fetchData()
    const savedDensity = localStorage.getItem("fleet:fuel-density") as TableDensity
    if (savedDensity) setDensity(savedDensity)
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await fuelService.getAll()
      const data = res.data.data || []
      
      setRecords(data)
      computeMetrics(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const [insights, setInsights] = useState({
    bestPerformance: { vehicle: "N/A", value: "0 km/L" },
    highestCost: { vehicle: "N/A", value: "R$ 0" },
    topStation: { name: "N/A", count: 0 }
  })

  const computeMetrics = (data: any[]) => {
    // Basic KPIs
    const totalCost = data.reduce((acc, r) => acc + Number(r.cost), 0)
    const totalLiters = data.reduce((acc, r) => acc + Number(r.liters), 0)
    const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0
    
    // Simulate Average Consumption (km/l) -> normally computed using odometers difference
    // For now we mock it as 4.2
    const avgConsumption = 4.2

    setMetrics({ totalCost, totalLiters, avgConsumption, avgCostPerLiter })

    // Chart 1. Evolução Mensal (Agrupar custo por mês/ano)
    const monthlyCost: Record<string, number> = {}
    data.forEach(r => {
      const d = new Date(r.fuelDate)
      const monthStr = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
      monthlyCost[monthStr] = (monthlyCost[monthStr] || 0) + Number(r.cost)
    })
    
    const monthlyArray = Object.entries(monthlyCost).map(([name, gasto]) => ({ name, gasto }))
    setMonthlyData(monthlyArray.length > 0 ? monthlyArray : [{ name: "Nenhum dado", gasto: 0 }])

    // Chart 2. Consumo por Veículo (Litros por placa)
    const vehicleLiters: Record<string, number> = {}
    const vehicleCost: Record<string, number> = {}
    const vehicleOdo: Record<string, { min: number, max: number, liters: number }> = {}
    const stationCount: Record<string, number> = {}

    data.forEach(r => {
      const plate = r.plate || "Desconhecido"
      vehicleLiters[plate] = (vehicleLiters[plate] || 0) + Number(r.liters)
      vehicleCost[plate] = (vehicleCost[plate] || 0) + Number(r.cost)
      
      const odo = Number(r.odometerReading) || 0
      if (!vehicleOdo[plate]) {
        vehicleOdo[plate] = { min: odo, max: odo, liters: 0 }
      } else {
        if (odo < vehicleOdo[plate].min) vehicleOdo[plate].min = odo
        if (odo > vehicleOdo[plate].max) vehicleOdo[plate].max = odo
      }
      vehicleOdo[plate].liters += Number(r.liters)

      const station = r.gasStationName || "Posto Desconhecido"
      stationCount[station] = (stationCount[station] || 0) + 1
    })
    
    const vehicleArray = Object.entries(vehicleLiters)
      .map(([name, consumo]) => ({ name, consumo }))
      .sort((a, b) => b.consumo - a.consumo)
      .slice(0, 5)
    setVehicleData(vehicleArray.length > 0 ? vehicleArray : [{ name: "Nenhum dado", consumo: 0 }])

    // Chart 3. Distribuição por Combustível
    const fuelTypes: Record<string, number> = {}
    data.forEach(r => {
      const ft = r.fuelType ? r.fuelType.toLowerCase() : "não inf."
      fuelTypes[ft] = (fuelTypes[ft] || 0) + Number(r.liters)
    })
    
    const fuelArray = Object.entries(fuelTypes).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }))
    setFuelTypeData(fuelArray.length > 0 ? fuelArray : [{ name: "Nenhum dado", value: 1 }])

    // Compute Insights
    let maxCostVehicle = "N/A"
    let maxCostValue = 0
    Object.entries(vehicleCost).forEach(([plate, cost]) => {
      if (cost > maxCostValue) {
        maxCostValue = cost
        maxCostVehicle = plate
      }
    })

    let topStationName = "N/A"
    let topStationValue = 0
    Object.entries(stationCount).forEach(([station, count]) => {
      if (count > topStationValue) {
        topStationValue = count
        topStationName = station
      }
    })

    let bestPerfVehicle = "N/A"
    let bestPerfValue = 0
    Object.entries(vehicleOdo).forEach(([plate, stats]) => {
      if (stats.liters > 0 && stats.max > stats.min) {
        const kml = (stats.max - stats.min) / stats.liters
        if (kml > bestPerfValue && kml < 30) { // arbitrary sane limit
          bestPerfValue = kml
          bestPerfVehicle = plate
        }
      }
    })

    setInsights({
      bestPerformance: { vehicle: bestPerfVehicle, value: bestPerfValue > 0 ? `${bestPerfValue.toFixed(1)} km/L` : "N/A" },
      highestCost: { vehicle: maxCostVehicle, value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(maxCostValue) },
      topStation: { name: topStationName, count: topStationValue }
    })
  }

  const handleDensityChange = (newDensity: TableDensity) => {
    setDensity(newDensity)
    localStorage.setItem("fleet:fuel-density", newDensity)
  }

  const handleRowClick = (record: any) => {
    router.push(`/fuel/${record.id}`)
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "fuelDate",
      header: "Data",
      cell: ({ row }) => {
        const date = new Date(row.original.fuelDate)
        return <span className="text-muted-foreground whitespace-nowrap text-xs">{date.toLocaleDateString('pt-BR')}</span>
      }
    },
    {
      accessorKey: "plate",
      header: "Veículo",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[100px]">
          <span className="font-semibold text-foreground truncate max-w-[140px]">{row.original.plate}</span>
        </div>
      )
    },
    {
      accessorKey: "driverName",
      header: "Motorista",
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.driverName || "-"}</span>
    },
    {
      accessorKey: "gasStationName",
      header: "Posto",
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.gasStationName}</span>
    },
    {
      accessorKey: "fuelType",
      header: "Combustível",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-muted/20 text-[10px] uppercase">
          {row.original.fuelType || "DIESEL"}
        </Badge>
      )
    },
    {
      accessorKey: "liters",
      header: "Litros",
      cell: ({ row }) => <span className="font-medium">{row.original.liters} L</span>
    },
    {
      accessorKey: "cost",
      header: "Valor",
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap text-blue-600 dark:text-blue-400">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.cost)}
        </span>
      )
    },
    {
      accessorKey: "odometerReading",
      header: "KM",
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.odometerReading} km</span>
    }
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center text-xs font-semibold text-muted-foreground mb-1">
              <span className="cursor-pointer hover:underline">Dashboard</span>
              <ChevronRight className="h-3 w-3 mx-1.5" />
              <span className="cursor-pointer hover:underline">Financeiro</span>
              <ChevronRight className="h-3 w-3 mx-1.5" />
              <span className="text-foreground">Abastecimentos</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Abastecimentos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gerencie os abastecimentos da frota e acompanhe indicadores de consumo e custos.</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" className="h-9 text-xs shadow-sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Novo Abastecimento
            </Button>
          </div>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
          <MetricCard
            title="Total Abastecido (Mês)"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(metrics.totalCost)}
            icon={<DollarSign className="h-4 w-4" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            trend={-5.2}
          />
          <MetricCard
            title="Litros Consumidos"
            value={metrics.totalLiters.toFixed(0)}
            icon={<Droplet className="h-4 w-4" />}
            iconBgColor="bg-sky-100 dark:bg-sky-900/30"
            iconColor="text-sky-600 dark:text-sky-400"
          />
          <MetricCard
            title="Consumo Médio (Frota)"
            value={`${metrics.avgConsumption} km/L`}
            icon={<Activity className="h-4 w-4" />}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            trend={6.0}
          />
          <MetricCard
            title="Custo Médio/Litro"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.avgCostPerLiter)}
            icon={<TrendingDown className="h-4 w-4" />}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
          />
        </div>

        {/* Alertas */}
        <div className="mb-2">
          <AlertPanel 
            title="Análise Automática" 
            alerts={[
              { id: '1', type: 'error', title: 'Consumo acima do esperado no veículo PQF3C53', date: 'Hoje' },
              { id: '2', type: 'warning', title: 'Dois abastecimentos sem comprovante', date: 'Hoje' },
              { id: '3', type: 'success', title: 'Consumo médio da frota melhorou 6%', date: 'Esta semana' },
            ]}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1 h-[250px]">
            <ChartCard title="Evolução do gasto mensal" description="Últimos 7 meses">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="gasto" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="md:col-span-1 h-[250px]">
            <ChartCard title="Consumo por veículo" description="Top veículos">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="consumo" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="md:col-span-1 h-[250px]">
            <ChartCard title="Distribuição por combustível" description="Litros por tipo">
              <div className="flex items-center w-full" style={{ height: 200 }}>
                {/* Pie area — fixed 150px wide */}
                <div style={{ width: 150, height: 200, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fuelTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {fuelTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <Label
                          content={({ viewBox }: any) => {
                            const { cx, cy } = viewBox;
                            return (
                              <g>
                                <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--muted-foreground)' }}>Total</text>
                                <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: 'var(--foreground)' }}>
                                  {fuelTypeData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR')} L
                                </text>
                              </g>
                            );
                          }}
                        />
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} L`, 'Quantidade']} contentStyle={{ borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend area — takes remaining space */}
                <div className="flex-1 flex flex-col justify-center gap-2 pl-4">
                  {fuelTypeData.map((entry, index) => {
                    const total = fuelTypeData.reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={entry.name} className="flex items-start gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-foreground leading-none mb-0.5">{entry.name}</span>
                          <span className="text-[9px] text-muted-foreground leading-none">{entry.value.toLocaleString('pt-BR')} L ({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <InsightCard 
            title="Melhor desempenho"
            value={insights.bestPerformance.vehicle}
            subtitle={insights.bestPerformance.value}
            trend="Maior eficiência"
            isPositive={true}
          />
          <InsightCard 
            title="Maior custo"
            value={insights.highestCost.vehicle}
            subtitle={insights.highestCost.value}
            trend="Maior gasto total"
            isPositive={false}
          />
          <InsightCard 
            title="Posto mais utilizado"
            value={insights.topStation.name}
            subtitle={`${insights.topStation.count} abastecimentos`}
            trend="Preferência da frota"
            isPositive={true}
          />
        </div>

        {/* Toolbar & DataTable */}
        <div className="mt-2">
          <Toolbar 
            searchValue={globalFilter}
            onSearch={setGlobalFilter}
            searchPlaceholder="Buscar abastecimento..."
            density={density}
            onDensityChange={handleDensityChange}
            extraActions={
              <>
                <Button variant="secondary" size="sm" className="h-8 text-xs font-medium mr-2">Filtros</Button>
                <Button variant="secondary" size="sm" className="h-8 text-xs font-medium">Ações em lote</Button>
              </>
            }
          />

          <DataTable 
            columns={columns} 
            data={records} 
            density={density}
            searchKey="plate"
            searchValue={globalFilter}
            onRowClick={handleRowClick}
            emptyStateTitle="Nenhum abastecimento encontrado"
            emptyStateDescription="Tente ajustar os filtros ou registre um novo abastecimento."
          />
        </div>

      </div>

      <FuelFormSheet 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchData} 
        defaultVehicleId={defaultVehicleId}
      />
    </AppLayout>
  )
}

export default function FuelDashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
      <FuelDashboardContent />
    </Suspense>
  )
}
