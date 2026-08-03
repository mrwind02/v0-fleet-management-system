"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { ChartCard } from "@/components/ui/chart-card"
import { InsightCard } from "@/components/ui/insight-card"
import { AlertPanel, AlertItem } from "@/components/ui/alert-panel"
import { Toolbar } from "@/components/ui/toolbar"
import { DataTable, TableDensity } from "@/components/ui/data-table"
import { StatusPill, StatusPillVariant } from "@/components/ui/status-pill"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { NewFineModal } from "./new-fine-modal"
import { fineService } from "@/services/fine.service"
import { cn } from "@/utils/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis, CartesianGrid, LineChart, Line, Legend, LabelList, Label } from "recharts"
import { Download, Plus, AlertOctagon, UserX, TrendingDown, Clock } from "lucide-react"
import useSWR from "swr"

type ExtendedFine = {
  id: string
  autoNumber: string
  date: string
  vehicle: string
  driver: string
  description: string
  category: string
  value: number
  points: number
  status: "Em Aberto" | "Pago" | "Em Recurso" | "Cancelado" | "Vencido"
  daysRemaining: number | null
  lastUpdate: string
}

const mockAlerts: AlertItem[] = [
  {
    id: "1",
    type: "error",
    title: "5 multas vencem esta semana",
    description: "Verifique os pagamentos pendentes."
  },
  {
    id: "2",
    type: "warning",
    title: "3 recursos aguardando documentação",
    description: "Anexe os documentos necessários."
  },
  {
    id: "3",
    type: "error",
    title: "Motorista João Silva atingiu limite de pontos",
    description: "CNH em risco de suspensão."
  },
  {
    id: "4",
    type: "warning",
    title: "Veículo PQF3C53 recebeu 4 multas",
    description: "Excesso de infrações neste mês."
  }
]

const categoryData = [
  { name: "Excesso Veloc.", value: 45 },
  { name: "Estacionamento", value: 30 },
  { name: "Sinalização", value: 20 },
  { name: "Equipamentos", value: 15 },
  { name: "Documentação", value: 10 },
]

const monthData = [
  { name: "Jan", value: 4500 }, { name: "Fev", value: 3000 }, { name: "Mar", value: 6500 }, 
  { name: "Abr", value: 2000 }, { name: "Mai", value: 8500 }, { name: "Jun", value: 4000 },
  { name: "Jul", value: 5000 }, { name: "Ago", value: 3500 }, { name: "Set", value: 7000 },
  { name: "Out", value: 2500 }, { name: "Nov", value: 9000 }, { name: "Dez", value: 4500 }
]

const unitData = [
  { name: "Matriz - SP", value: 120 },
  { name: "Filial - RJ", value: 85 },
  { name: "Filial - MG", value: 45 },
  { name: "Filial - PR", value: 30 },
]

const CAT_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B"]
const UNIT_COLORS = ["#F97316", "#06B6D4", "#10B981", "#6366F1"]

export default function FinesPage() {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [density, setDensity] = useState<TableDensity>("comfortable")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const savedDensity = localStorage.getItem("fleet:table-density") as TableDensity
    if (savedDensity) setDensity(savedDensity)
  }, [])

  const fetchFinesData = async () => {
    try {
      const finesData = await fineService.getFines()
      
      const formattedFines: ExtendedFine[] = finesData.map((fine: any) => ({
        id: fine.id,
        autoNumber: fine.auto_number,
        date: fine.infraction_date ? new Date(fine.infraction_date).toLocaleDateString('pt-BR') : '-',
        vehicle: fine.vehicle_plate ? `Placa ${fine.vehicle_plate}` : '-',
        driver: fine.driver_name || '-',
        description: fine.description || '-',
        category: fine.category,
        value: Number(fine.value),
        points: fine.points,
        status: fine.status === 'aberto' ? 'Em Aberto' : (fine.status === 'pago' ? 'Pago' : 'Em Recurso'),
        daysRemaining: fine.due_date ? Math.ceil((new Date(fine.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
        lastUpdate: fine.updated_at ? new Date(fine.updated_at).toLocaleDateString('pt-BR') : '-'
      }))

      if (typeof window !== "undefined") {
        localStorage.setItem("swr_cache_fines", JSON.stringify(formattedFines))
      }

      // Compute Metrics
      const catCount: Record<string, number> = {}
      const monthCost: Record<string, number> = {}
      const vehicleCount: Record<string, number> = {}
      const driverPoints: Record<string, number> = {}

      finesData.forEach((f: any) => {
        // Categories
        const cat = f.category || "Outros"
        catCount[cat] = (catCount[cat] || 0) + 1

        // Monthly
        if (f.infraction_date) {
          const d = new Date(f.infraction_date)
          const monthStr = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
          monthCost[monthStr] = (monthCost[monthStr] || 0) + Number(f.value)
        }

        // Vehicle Critical
        if (f.vehicle_plate) {
          vehicleCount[f.vehicle_plate] = (vehicleCount[f.vehicle_plate] || 0) + 1
        }

        // Driver Points
        if (f.driver_name) {
          driverPoints[f.driver_name] = (driverPoints[f.driver_name] || 0) + Number(f.points)
        }
      })

      const categoryData = Object.entries(catCount).map(([name, value]) => ({ name, value }))
      const monthData = Object.entries(monthCost).map(([name, value]) => ({ name, value }))
      
      // Mock unit data as fines don't have units directly
      const unitData = [{ name: "Geral", value: finesData.length }]

      // Compute insights
      let maxVec = "N/A", maxVecCount = 0
      Object.entries(vehicleCount).forEach(([v, c]) => { if (c > maxVecCount) { maxVecCount = c; maxVec = v } })

      let maxDrv = "N/A", maxDrvPts = 0
      Object.entries(driverPoints).forEach(([d, p]) => { if (p > maxDrvPts) { maxDrvPts = p; maxDrv = d } })

      const insights = {
        criticalVehicle: { title: maxVec, value: `${maxVecCount} Multas`, description: "Veículo com mais infrações" },
        criticalDriver: { title: maxDrv, value: `${maxDrvPts} Pontos`, description: "Maior pontuação acumulada" },
        trend: { value: "N/A", description: "Comparativo não disponível", isPositive: true }
      }

      return { fines: formattedFines, categoryData, monthData, unitData, insights }
    } catch (error) {
      console.error("Erro ao buscar multas:", error)
      return { fines: [], categoryData: [], monthData: [], unitData: [], insights: null }
    }
  }

  const { data, isLoading, mutate } = useSWR('fines_dashboard_data', fetchFinesData, { revalidateOnFocus: false })
  
  const fines = data?.fines || []
  const categoryData = data?.categoryData || []
  const monthData = data?.monthData || []
  const unitData = data?.unitData || []
  const insights = data?.insights || {
    criticalVehicle: { title: "N/A", value: "0 Multas", description: "Sem dados" },
    criticalDriver: { title: "N/A", value: "0 Pontos", description: "Sem dados" },
    trend: { value: "0%", description: "Sem dados", isPositive: true }
  }

  const handleDensityChange = (newDensity: TableDensity) => {
    setDensity(newDensity)
    localStorage.setItem("fleet:table-density", newDensity)
  }

  const handleRowClick = (fine: ExtendedFine) => {
    router.push(`/fines/${fine.id}`)
  }

  const columns: ColumnDef<ExtendedFine>[] = [
    {
      accessorKey: "autoNumber",
      header: "Auto",
      cell: ({ row }) => <span className="font-semibold text-xs">{row.original.autoNumber}</span>
    },
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.date}</span>
    },
    {
      accessorKey: "vehicle",
      header: "Veículo",
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.vehicle}</span>
    },
    {
      accessorKey: "driver",
      header: "Motorista",
      cell: ({ row }) => <span className="text-xs">{row.original.driver}</span>
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-900">
          {row.original.category}
        </Badge>
      )
    },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => (
        <span className="text-xs font-semibold">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.value)}
        </span>
      )
    },
    {
      accessorKey: "points",
      header: "Pontos",
      cell: ({ row }) => (
        <span className={cn("text-xs font-bold px-2 py-1 rounded-md bg-muted", row.original.points >= 7 ? "text-red-600 bg-red-50 dark:bg-red-900/20" : "")}>
          {row.original.points} pts
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Situação",
      cell: ({ row }) => {
        const s = row.original.status
        let variant: StatusPillVariant = "default"
        if (s === "Pago") variant = "success"
        if (s === "Em Recurso") variant = "warning"
        if (s === "Vencido") variant = "destructive"
        if (s === "Cancelado") variant = "neutral"
        return <StatusPill label={s} status={variant} />
      }
    },
    {
      accessorKey: "daysRemaining",
      header: "Prazo",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.daysRemaining !== null ? `${row.original.daysRemaining} dias` : "-"}
        </span>
      )
    }
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 pb-2 w-full animate-in fade-in duration-300">
        
        <PageHeader 
          breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Frota" }, { label: "Multas" }]}
          title="Multas"
          description="Gerencie infrações, recursos, pagamentos e indicadores relacionados às multas da frota."
          actions={
            <>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                Importar
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Nova Multa
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-2 mb-2 mt-2">
          
          {/* Left Column: Charts & Insights (spans 3 columns) */}
          <div className="xl:col-span-3 flex flex-col gap-2">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <ChartCard title="Multas por Categoria" description="Distribuição das infrações">
                <div className="flex items-center w-full" style={{ height: 180 }}>
                  {/* Pie area — fixed 150px wide */}
                  <div style={{ width: 150, height: 180, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CAT_COLORS[index % CAT_COLORS.length]} />
                          ))}
                          <Label
                            content={({ viewBox }: any) => {
                              const { cx, cy } = viewBox;
                              return (
                                <g>
                                  <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--muted-foreground)' }}>Total</text>
                                  <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: 'var(--foreground)' }}>
                                    {categoryData.reduce((acc, curr) => acc + curr.value, 0)}
                                  </text>
                                </g>
                              );
                            }}
                          />
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value} multas`, 'Quantidade']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend area — takes remaining space */}
                  <div className="flex-1 flex flex-col justify-center gap-2 pl-2">
                    {categoryData.map((entry, index) => {
                      const total = categoryData.reduce((acc, curr) => acc + curr.value, 0);
                      const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={entry.name} className="flex items-start gap-1.5">
                          <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: CAT_COLORS[index % CAT_COLORS.length] }}></div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-medium text-foreground leading-none mb-0.5">{entry.name}</span>
                            <span className="text-[9px] text-muted-foreground leading-none">{entry.value} multas ({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Valor das Multas (12 Meses)" description="R$ Total por mês">
                <div className="h-[180px] w-full mt-2 relative">
                  <div className="absolute inset-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `R$${val/1000}k`} />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" name="Valor (R$)" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }}>
                          <LabelList dataKey="value" position="top" style={{ fontSize: '9px', fill: '#666' }} formatter={(val: number) => val > 0 ? `R$${(val/1000).toFixed(1)}k` : ''} />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ChartCard>
              
              <ChartCard title="Multas por Unidade" description="Comparativo de filiais">
                <div className="flex items-center w-full" style={{ height: 180 }}>
                  {/* Pie area — fixed 150px wide */}
                  <div style={{ width: 150, height: 180, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={unitData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {unitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={UNIT_COLORS[index % UNIT_COLORS.length]} />
                          ))}
                          <Label
                            content={({ viewBox }: any) => {
                              const { cx, cy } = viewBox;
                              return (
                                <g>
                                  <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--muted-foreground)' }}>Total</text>
                                  <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: 'var(--foreground)' }}>
                                    {unitData.reduce((acc, curr) => acc + curr.value, 0)}
                                  </text>
                                </g>
                              );
                            }}
                          />
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value} multas`, 'Quantidade']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend area — takes remaining space */}
                  <div className="flex-1 flex flex-col justify-center gap-2 pl-2">
                    {unitData.map((entry, index) => {
                      const total = unitData.reduce((acc, curr) => acc + curr.value, 0);
                      const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={entry.name} className="flex items-start gap-1.5">
                          <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: UNIT_COLORS[index % UNIT_COLORS.length] }}></div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-medium text-foreground leading-none mb-0.5">{entry.name}</span>
                            <span className="text-[9px] text-muted-foreground leading-none">{entry.value} multas ({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Insight Cards (Executive Row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <InsightCard 
                title="Veículo Crítico" 
                value={insights.criticalVehicle.title} 
                description={insights.criticalVehicle.value} 
                icon={<AlertOctagon className="h-4 w-4" />}
                iconBgColor="bg-red-100 dark:bg-red-900/40"
                iconColor="text-red-600 dark:text-red-400"
                badgeText="Atenção"
                badgeVariant="destructive"
                actionLabel="Ver histórico"
              />
              <InsightCard 
                title="Motorista" 
                value={insights.criticalDriver.title} 
                description={insights.criticalDriver.value} 
                icon={<UserX className="h-4 w-4" />}
                iconBgColor="bg-orange-100 dark:bg-orange-900/40"
                iconColor="text-orange-600 dark:text-orange-400"
                badgeText="Risco"
                badgeVariant="warning"
                actionLabel="Abrir motorista"
              />
              <InsightCard 
                title="Tendência" 
                value={insights.trend.value} 
                description={insights.trend.description} 
                icon={<TrendingDown className="h-4 w-4" />}
                iconBgColor="bg-green-100 dark:bg-green-900/40"
                iconColor="text-green-600 dark:text-green-400"
                badgeText="Bom"
                badgeVariant="success"
                actionLabel="Ver indicadores"
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

        <div className="mt-2">
          <Toolbar 
            searchValue={globalFilter}
            onSearch={setGlobalFilter}
            searchPlaceholder="Buscar por número do auto, veículo, motorista..."
            density={density}
            onDensityChange={handleDensityChange}
            extraActions={
              <Button variant="secondary" size="sm" className="h-8 text-xs font-medium">
                Filtros Avançados
              </Button>
            }
          />

          <DataTable 
            columns={columns} 
            data={fines} 
            density={density}
            searchKey="autoNumber" 
            searchValue={globalFilter}
            isLoading={isLoading}
            onRowClick={handleRowClick}
            emptyStateTitle="Nenhuma infração encontrada"
            emptyStateDescription="Tente ajustar os filtros da busca."
          />
        </div>

      </div>

      <NewFineModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </AppLayout>
  )
}
