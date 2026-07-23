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
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis, CartesianGrid, LineChart, Line } from "recharts"
import { Download, Plus, AlertOctagon, UserX, TrendingDown, Clock } from "lucide-react"

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
  const [fines, setFines] = useState<ExtendedFine[]>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [density, setDensity] = useState<TableDensity>("comfortable")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const savedDensity = localStorage.getItem("fleet:table-density") as TableDensity
    if (savedDensity) setDensity(savedDensity)
    
    const fetchFines = async () => {
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
        setFines(formattedFines)
      } catch (error) {
        console.error("Erro ao buscar multas:", error)
      }
    }
    
    fetchFines()
  }, [])

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
                <div className="h-[180px] w-full mt-2 relative">
                  <div className="absolute inset-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CAT_COLORS[index % CAT_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Valor das Multas (12 Meses)" description="R$ Total por mês">
                <div className="h-[180px] w-full mt-2 relative">
                  <div className="absolute inset-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `R$${val/1000}k`} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ChartCard>
              
              <ChartCard title="Multas por Unidade" description="Comparativo de filiais">
                <div className="h-[180px] w-full mt-2 relative">
                  <div className="absolute inset-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={unitData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={70} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {unitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={UNIT_COLORS[index % UNIT_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Insight Cards (Executive Row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <InsightCard 
                title="Veículo Crítico" 
                value="6 Multas" 
                description="Scania R450 nos últimos 90 dias" 
                icon={<AlertOctagon className="h-4 w-4" />}
                iconBgColor="bg-red-100 dark:bg-red-900/40"
                iconColor="text-red-600 dark:text-red-400"
                badgeText="Atenção"
                badgeVariant="destructive"
                actionLabel="Ver histórico"
              />
              <InsightCard 
                title="Motorista" 
                value="18 Pontos" 
                description="Carlos Oliveira com CNH em risco" 
                icon={<UserX className="h-4 w-4" />}
                iconBgColor="bg-orange-100 dark:bg-orange-900/40"
                iconColor="text-orange-600 dark:text-orange-400"
                badgeText="Risco"
                badgeVariant="warning"
                actionLabel="Abrir motorista"
              />
              <InsightCard 
                title="Tendência" 
                value="-12%" 
                description="Redução nas multas (mês ant.)" 
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
