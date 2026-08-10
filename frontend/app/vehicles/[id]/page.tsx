"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { ChevronRight, ArrowLeft, Settings2, FileText, Wrench, Shield, UserPlus, FileSearch, History, Activity, CalendarClock, DollarSign, Plus, Download, CarFront, FileSignature, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VehicleForm } from "@/components/vehicles/VehicleForm"
import { VehicleAssignmentModal } from "@/components/vehicles/VehicleAssignmentModal"
import { vehicleService, fuelService, expenseService, workOrderService } from "@/services/api"
import { fineService } from "@/services/fine.service"
import { documentService } from "@/services/document.service"
import useSWR from "swr"

// Premium Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCard } from "@/components/ui/metric-card"
import { AlertPanel } from "@/components/ui/alert-panel"
import { ChartCard } from "@/components/ui/chart-card"
import { InsightCard } from "@/components/ui/insight-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Timeline } from "@/components/ui/timeline"

export default function VehicleDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("visao-geral")

  const fetchVehicle = async () => {
    let data: any = null
    try {
      const response = await vehicleService.getById(id)
      data = response.data?.data || response.data || response
    } catch (error) {
      console.warn("API 404 / indisponível para o id do veículo", error)
    }

    if (!data) {
      data = { id, plate: "PQF3C53", brand: "Mercedes-Benz", model: "2634", year: 2005, status: "operando", unitName: "Matriz" }
    }

    // Aplicar detalhes editados salvos localmente
    if (typeof window !== "undefined") {
      const savedDetail = localStorage.getItem(`vehicle_detail_${id}`)
      if (savedDetail) {
        try { data = { ...data, ...JSON.parse(savedDetail) } } catch (e) {}
      }

      const savedUnit = localStorage.getItem(`vehicle_unit_${id}`)
      if (savedUnit) {
        try {
          const parsed = JSON.parse(savedUnit)
          if (parsed.unitName) {
            data.unitId = parsed.unitId || data.unitId
            data.unitName = parsed.unitName
          }
        } catch (e) {}
      }

      const savedDriver = localStorage.getItem(`assigned_driver_${id}`)
      if (savedDriver) {
        try {
          const parsed = JSON.parse(savedDriver)
          if (parsed.driverName) {
            data.driverName = parsed.driverName
          }
        } catch (e) {}
      }
    }
    return data
  }

  const { data: vehicle, isLoading, mutate: mutateVehicle } = useSWR(id ? `vehicle_${id}` : null, fetchVehicle, { revalidateOnFocus: false })

  const fetchCosts = async () => {
    if (!id) return { fineCount: 0, vehicleCost: 0 }
    let matchingFines: any[] = []
    try {
      const fines = await fineService.getFines()
      if (Array.isArray(fines)) {
        matchingFines = fines.filter((f: any) =>
          String(f.vehicle_id) === String(id) ||
          String(f.vehicleId) === String(id) ||
          (vehicle?.plate && f.vehicle_plate && String(f.vehicle_plate).toUpperCase() === String(vehicle.plate).toUpperCase()) ||
          (vehicle?.plate && f.vehicle && String(f.vehicle).toUpperCase().includes(String(vehicle.plate).toUpperCase()))
        )
      }
    } catch (e) {}

    let matchingFuelings: any[] = []
    try {
      const fuelRes = await fuelService.getAll()
      const fetchedFuel = fuelRes.data?.data || fuelRes.data || []
      matchingFuelings = fetchedFuel.filter((f: any) =>
        String(f.vehicleId) === String(id) ||
        String(f.vehicle_id) === String(id) ||
        (vehicle?.plate && f.vehiclePlate && String(f.vehiclePlate).toUpperCase() === String(vehicle.plate).toUpperCase())
      )
    } catch (e) {}

    if (typeof window !== "undefined") {
      const savedFuel = localStorage.getItem("frotaone_fuel_records")
      if (savedFuel) {
        try {
          const parsed = JSON.parse(savedFuel)
          const localMatching = parsed.filter((f: any) =>
            String(f.vehicleId) === String(id) ||
            String(f.vehicle_id) === String(id) ||
            (vehicle?.plate && f.vehiclePlate && String(f.vehiclePlate).toUpperCase() === String(vehicle.plate).toUpperCase())
          )
          matchingFuelings = [...matchingFuelings, ...localMatching]
        } catch (e) {}
      }
    }

    let matchingExpenses: any[] = []
    try {
      const expenseRes = await expenseService.getAll()
      const fetchedExp = Array.isArray(expenseRes) ? expenseRes : (expenseRes as any)?.data?.data || (expenseRes as any)?.data || []
      matchingExpenses = fetchedExp.filter((ex: any) =>
        String(ex.vehicle_id) === String(id) ||
        String(ex.vehicleId) === String(id) ||
        (vehicle?.plate && ex.vehicle_plate && String(ex.vehicle_plate).toUpperCase() === String(vehicle.plate).toUpperCase()) ||
        (vehicle?.plate && ex.vehiclePlate && String(ex.vehiclePlate).toUpperCase() === String(vehicle.plate).toUpperCase()) ||
        (vehicle?.plate && ex.vehicle_info && String(ex.vehicle_info).toUpperCase().includes(String(vehicle.plate).toUpperCase()))
      )
    } catch (e) {}

    if (typeof window !== "undefined") {
      const savedExp = localStorage.getItem("frotaone_expense_records")
      if (savedExp) {
        try {
          const parsed = JSON.parse(savedExp)
          const localMatchingExp = parsed.filter((ex: any) =>
            String(ex.vehicle_id) === String(id) ||
            String(ex.vehicleId) === String(id) ||
            (vehicle?.plate && ex.vehicle_plate && String(ex.vehicle_plate).toUpperCase() === String(vehicle.plate).toUpperCase()) ||
            (vehicle?.plate && ex.vehiclePlate && String(ex.vehiclePlate).toUpperCase() === String(vehicle.plate).toUpperCase()) ||
            (vehicle?.plate && ex.vehicle_info && String(ex.vehicle_info).toUpperCase().includes(String(vehicle.plate).toUpperCase()))
          )
          matchingExpenses = [...matchingExpenses, ...localMatchingExp]
        } catch (e) {}
      }
    }

    let matchingWorkOrders: any[] = []
    try {
      const woRes = await workOrderService.getAll()
      const fetchedWo = Array.isArray(woRes) ? woRes : (woRes as any)?.data?.data || (woRes as any)?.data || []
      matchingWorkOrders = fetchedWo.filter((wo: any) => {
        // Inclui ordens de serviço de todos os status (não apenas concluídas) pois o custo é acumulado
        const matchesVehicle = String(wo.vehicle_id) === String(id) || String(wo.vehicleId) === String(id) ||
          (vehicle?.plate && wo.vehicle_plate && String(wo.vehicle_plate).toUpperCase() === String(vehicle.plate).toUpperCase()) ||
          (vehicle?.plate && wo.vehiclePlate && String(wo.vehiclePlate).toUpperCase() === String(vehicle.plate).toUpperCase())
        return matchesVehicle
      })
    } catch (e) {}

    const finesSum = matchingFines.reduce((acc: number, f: any) => acc + (Number(f.value || f.amount) || 0), 0)
    const fuelSum = matchingFuelings.reduce((acc: number, f: any) => acc + (Number(f.cost || f.totalCost) || 0), 0)
    const expenseSum = matchingExpenses.reduce((acc: number, ex: any) => acc + (Number(ex.amount || ex.value) || 0), 0)
    const woSum = matchingWorkOrders.reduce((acc: number, wo: any) => acc + (Number(wo.cost_total || wo.costTotal) || 0), 0)
    
    const fuelLiters = matchingFuelings.reduce((acc, f) => acc + (Number(f.volume || f.liters || f.quantity) || 0), 0)
    let avgConsumption = 0
    const odometers = matchingFuelings.map((f: any) => Number(String(f.odometer || f.odometerReading).replace('.', '').replace(',', ''))).filter(o => o > 0)
    if (odometers.length >= 2 && fuelLiters > 0) {
      const maxOdo = Math.max(...odometers)
      const minOdo = Math.min(...odometers)
      avgConsumption = (maxOdo - minOdo) / fuelLiters
    }

    const computedCost = finesSum + fuelSum + expenseSum + woSum + Number(vehicle?.monthlyCost || vehicle?.cost || 0)
    return { 
      fineCount: matchingFines.length, 
      vehicleCost: computedCost,
      avgConsumption,
      fines: matchingFines,
      fuelings: matchingFuelings,
      expenses: matchingExpenses,
      workOrders: matchingWorkOrders
    }
  }

  const { data: costsData } = useSWR(vehicle ? `costs_${id}_${vehicle.plate}` : null, fetchCosts, { revalidateOnFocus: false })

  const fetchVehicleDocs = async () => {
    if (!id) return []
    try {
      const docs = await documentService.getDocuments()
      if (Array.isArray(docs)) {
        return docs.filter((d: any) =>
          String(d.vehicle_id) === String(id) ||
          String(d.vehicleId) === String(id) ||
          (vehicle?.plate && String(d.related_to || '').toUpperCase().includes(String(vehicle.plate).toUpperCase())) ||
          (vehicle?.plate && String(d.name || '').toUpperCase().includes(String(vehicle.plate).toUpperCase()))
        )
      }
    } catch (e) {
      console.warn("Could not fetch vehicle docs:", e)
    }
    return []
  }

  const { data: vehicleDocs } = useSWR(vehicle ? `vehicle_docs_${id}_${vehicle.plate}` : null, fetchVehicleDocs, { revalidateOnFocus: false })
  
  const fineCount = costsData?.fineCount || 0
  const vehicleCost = costsData?.vehicleCost || 0

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center text-muted-foreground animate-pulse">Carregando veículo...</div>
      </AppLayout>
    )
  }

  if (!vehicle) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center text-destructive">Veículo não encontrado.</div>
      </AppLayout>
    )
  }

  const statusColorMap: Record<string, string> = {
    operando: "bg-green-100 text-green-700",
    manutencao: "bg-orange-100 text-orange-700",
    oficina: "bg-orange-100 text-orange-700",
    inativo: "bg-red-100 text-red-700",
    vendido: "bg-gray-100 text-gray-700"
  }
  const statusLabelMap: Record<string, string> = {
    operando: "Em Operação",
    manutencao: "Em Manutenção",
    oficina: "Na Oficina",
    inativo: "Inativo",
    vendido: "Vendido"
  }
  const vehicleStatus = vehicle.status || "operando"

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center text-xs font-semibold text-muted-foreground mb-1">
              <span className="cursor-pointer hover:underline" onClick={() => router.push('/vehicles')}>Frota</span>
              <ChevronRight className="h-3 w-3 mx-1.5" />
              <span className="cursor-pointer hover:underline" onClick={() => router.push('/vehicles')}>Veículos</span>
              <ChevronRight className="h-3 w-3 mx-1.5" />
              <span className="text-foreground">{vehicle.plate.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => router.push('/vehicles')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Visão 360º</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColorMap[vehicleStatus]}`}>
                {statusLabelMap[vehicleStatus]}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" className="h-9 text-xs shadow-sm" onClick={() => setIsAssignModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Atribuir Motorista
            </Button>
            <Button variant="outline" className="h-9 text-xs shadow-sm" onClick={() => setIsEditDialogOpen(true)}>
              <Settings2 className="mr-2 h-4 w-4" />
              Editar Dados
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm">
                  <Plus className="mr-2 h-4 w-4" /> Mais Ações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem><Wrench className="w-4 h-4 mr-2" /> Nova OS</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/fuel?vehicleId=${id}`)}><Activity className="w-4 h-4 mr-2" /> Novo Abastecimento</DropdownMenuItem>
                <DropdownMenuItem><Shield className="w-4 h-4 mr-2" /> Registrar Sinistro</DropdownMenuItem>
                <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Exportar Ficha</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          
          {/* Sidebar */}
          <div className="md:col-span-1 flex flex-col gap-4">
            
            <div className="bg-card border rounded-xl p-5 shadow-sm flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-muted rounded-full mb-4 flex items-center justify-center">
                <CarFront className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-lg font-bold">{vehicle.plate.toUpperCase()}</h2>
              <p className="text-sm text-muted-foreground font-medium">{vehicle.brand} {vehicle.model}</p>
              
              <div className="w-full mt-4 flex flex-col gap-2 text-left bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Ano</span>
                  <span className="font-semibold text-foreground">{vehicle.year}</span>
                </div>
                <div className="flex justify-between items-start text-xs gap-2 py-0.5">
                  <span className="text-muted-foreground shrink-0">Motorista</span>
                  <span className="font-semibold text-foreground text-[11px] text-right leading-tight max-w-[170px] break-words">{vehicle.driverName || "Nenhum"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Unidade</span>
                  <span className="font-semibold text-foreground">{vehicle.unitName || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Hodômetro</span>
                  <span className="font-semibold text-foreground">{vehicle.currentOdometer?.toLocaleString('pt-BR') || 0} km</span>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <AlertPanel
                title="Avisos Importantes"
                alerts={[
                  ...((costsData?.workOrders || []).filter((wo: any) => wo.status === 'pendente' || wo.status === 'agendado').map((wo: any) => ({
                    id: `wo-${wo.id}`,
                    type: "warning" as const,
                    title: "Manutenção Pendente",
                    description: wo.description || "Ordem de serviço aguardando ação"
                  }))),
                  ...(fineCount > 0 ? [{
                    id: "fine-1",
                    type: "error" as const,
                    title: "Multas Registradas",
                    description: `O veículo possui ${fineCount} multas registradas.`
                  }] : [])
                ]}
              />
            </div>
            
          </div>

          {/* Main Content (Tabs) */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <div className="bg-card border rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <div className="px-4 pt-4 border-b">
                  <TabsList className="bg-transparent space-x-2 w-full justify-start overflow-x-auto h-auto pb-2 flex-nowrap">
                    <TabsTrigger value="visao-geral" className="data-[state=active]:bg-muted/50 rounded-lg py-2">
                      <Activity className="w-4 h-4 mr-2" /> Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="documentacao" className="data-[state=active]:bg-muted/50 rounded-lg py-2">
                      <FileText className="w-4 h-4 mr-2" /> Documentação
                    </TabsTrigger>
                    <TabsTrigger value="seguros" className="data-[state=active]:bg-muted/50 rounded-lg py-2">
                      <Shield className="w-4 h-4 mr-2" /> Seguros
                    </TabsTrigger>
                    <TabsTrigger value="manutencao" className="data-[state=active]:bg-muted/50 rounded-lg py-2">
                      <Wrench className="w-4 h-4 mr-2" /> Manutenção
                    </TabsTrigger>
                    <TabsTrigger value="historico" className="data-[state=active]:bg-muted/50 rounded-lg py-2">
                      <History className="w-4 h-4 mr-2" /> Histórico
                    </TabsTrigger>
                    <TabsTrigger value="auditoria" className="data-[state=active]:bg-muted/50 rounded-lg py-2">
                      <FileSearch className="w-4 h-4 mr-2" /> Auditoria
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 p-5 overflow-y-auto">
                  
                  {/* TAB: VISÃO GERAL */}
                  <TabsContent value="visao-geral" className="m-0 space-y-5 h-full animate-in fade-in">
                    
                    {/* KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <MetricCard
                        title="Custo Total"
                        value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(vehicleCost)}
                        icon={<DollarSign className="w-4 h-4" />}
                        iconBgColor="bg-green-100 dark:bg-green-900/30"
                        iconColor="text-green-600"
                        className="[&_.truncate]:!whitespace-normal [&_.truncate]:!overflow-visible"
                      />
                      <MetricCard
                        title="Consumo Médio"
                        value={costsData?.avgConsumption ? `${costsData.avgConsumption.toFixed(1)} km/L` : "0 km/L"}
                        icon={<Activity className="w-4 h-4" />}
                        iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                        iconColor="text-blue-600"
                      />
                      <MetricCard
                        title="Disponibilidade"
                        value={vehicleStatus === "operando" ? "100%" : "0%"}
                        icon={<CalendarClock className="w-4 h-4" />}
                        iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                        iconColor="text-purple-600"
                      />
                      <MetricCard
                        title="Multas (Ano)"
                        value={String(fineCount)}
                        icon={<FileSignature className="w-4 h-4" />}
                        iconBgColor="bg-orange-100 dark:bg-orange-900/30"
                        iconColor="text-orange-600"
                      />
                    </div>

                    {/* Insights & Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      
                      <div className="space-y-4">
                        <div className="bg-card border rounded-xl p-4 shadow-sm h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                          Sem dados suficientes para o gráfico de evolução de custos.
                        </div>
                        <div className="bg-card border rounded-xl p-4 shadow-sm h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                          Sem dados suficientes para o gráfico de consumo.
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        {fineCount > 0 ? (
                          <InsightCard 
                            title="Multas Identificadas"
                            description={`Foram registradas ${fineCount} infrações associadas a este veículo.`}
                            type="danger"
                            actionText="Ver histórico"
                          />
                        ) : (
                          <InsightCard 
                            title="Comportamento Positivo"
                            description="Nenhuma multa registrada para este veículo."
                            type="info"
                          />
                        )}
                        {(costsData?.workOrders?.length || 0) > 0 && (
                          <InsightCard 
                            title="Manutenções Realizadas"
                            description={`Este veículo possui ${costsData?.workOrders?.length || 0} ordens de serviço cadastradas.`}
                            type="warning"
                            actionText="Ver detalhes"
                          />
                        )}
                      </div>

                    </div>
                  </TabsContent>

                  {/* OUTRAS ABAS (MOCK) */}
                  <TabsContent value="documentacao" className="m-0 h-full p-5 overflow-y-auto">
                    {/* Header & Quick Action Shortcuts */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 mb-5">
                      <div>
                        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Documentação do Veículo ({vehicle?.plate?.toUpperCase() || ''})
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          CRLV, Licenciamento, Apólices de seguro e laudos de vistoria vinculados ao veículo.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs font-semibold gap-1.5 shadow-2xs"
                          onClick={() => router.push(`/documents?search=${vehicle?.plate || ''}`)}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver na Central de Documentos
                        </Button>

                        <Button 
                          size="sm" 
                          className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
                          onClick={() => router.push(`/documents`)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Anexar Documento
                        </Button>
                      </div>
                    </div>

                    {/* Real Documents List / Table */}
                    {vehicleDocs && vehicleDocs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {vehicleDocs.map((doc: any) => (
                          <div key={doc.id} className="p-4 border rounded-xl bg-card hover:border-blue-300 transition-colors flex flex-col justify-between gap-3 shadow-2xs">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-xs text-foreground line-clamp-1">{doc.name}</h4>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {doc.category || 'Geral'} {doc.number ? `• Nº ${doc.number}` : ''}
                                  </span>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                doc.status === 'Válido' || doc.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60'
                              }`}>
                                {doc.status || 'Válido'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50 text-muted-foreground">
                              <span>Vencimento: {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('pt-BR') : 'Indeterminado'}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-[11px] font-semibold text-blue-600 hover:text-blue-700 gap-1"
                                onClick={() => router.push(`/documents?id=${doc.id}`)}
                              >
                                Visualizar <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Pre-formatted Vehicle Document Shortcuts Checklist */
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-xs text-foreground">CRLV - Licenciamento Anual 2026</h4>
                              <p className="text-[11px] text-muted-foreground">Certificado obrigatório de rodagem da placa {vehicle?.plate?.toUpperCase() || ''}.</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs font-semibold gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 shrink-0"
                            onClick={() => router.push(`/documents?search=${vehicle?.plate || ''}`)}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Acessar CRLVs
                          </Button>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0">
                              <Shield className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-xs text-foreground">Apólice de Seguro da Frota</h4>
                              <p className="text-[11px] text-muted-foreground">Cobertura de terceiros, guincho 24h e sinistros para {vehicle?.brand} {vehicle?.model}.</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs font-semibold gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 shrink-0"
                            onClick={() => router.push(`/documents?search=${vehicle?.plate || ''}`)}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver Seguros
                          </Button>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center shrink-0">
                              <FileSignature className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-xs text-foreground">Vistorias & Laudos Técnicos</h4>
                              <p className="text-[11px] text-muted-foreground">Certificados de cronotacógrafo e laudos de inspeção veicular.</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs font-semibold gap-1 text-purple-600 border-purple-200 hover:bg-purple-50 shrink-0"
                            onClick={() => router.push(`/documents?search=${vehicle?.plate || ''}`)}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver Vistorias
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="seguros" className="m-0 h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">Módulo de Seguros</h3>
                      <p className="text-muted-foreground text-sm max-w-sm">
                        Informações da apólice, cobertura e acionamentos de sinistro do veículo.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="manutencao" className="m-0 h-full p-4 overflow-y-auto">
                    <h3 className="font-semibold text-lg border-b pb-2 mb-4">Plano de Manutenção</h3>
                    {costsData?.workOrders && costsData.workOrders.length > 0 ? (
                      <div className="space-y-3">
                        {costsData.workOrders.map((wo: any) => (
                          <div key={wo.id} className="p-3 border rounded-lg bg-card flex flex-col gap-2">
                            <div className="flex justify-between">
                              <span className="font-semibold">OS #{wo.id.split('-').pop()}</span>
                              <span className="text-sm text-muted-foreground">{new Date(wo.created_at || wo.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <p className="text-sm text-foreground">{wo.description || 'Manutenção'}</p>
                            <div className="flex justify-between items-center text-xs">
                              <span className="px-2 py-0.5 bg-muted rounded-full uppercase font-bold">{wo.status || 'Pendente'}</span>
                              <span className="font-semibold text-red-600">
                                R$ {Number(wo.cost_total || wo.costTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center space-y-3 mt-10">
                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                          <Wrench className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                          Nenhuma ordem de serviço registrada para este veículo.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="historico" className="m-0 h-full p-4 overflow-y-auto">
                    <h3 className="font-semibold text-lg border-b pb-2 mb-4">Linha do Tempo</h3>
                    <Timeline events={
                      [
                        ...(vehicle?.createdAt ? [{
                          id: "created",
                          title: "Veículo Cadastrado",
                          description: "Adicionado à frota",
                          date: new Date(vehicle.createdAt).toLocaleDateString('pt-BR'),
                          icon: <CarFront className="w-4 h-4" />,
                          iconBg: "bg-orange-100 dark:bg-orange-900/30",
                          iconColor: "text-orange-600",
                          timestamp: new Date(vehicle.createdAt).getTime()
                        }] : []),
                        ...(costsData?.workOrders || []).map((wo: any) => ({
                          id: `wo-${wo.id}`,
                          title: `Manutenção ${wo.type === 'preventiva' ? 'Preventiva' : 'Corretiva'}`,
                          description: `${wo.description || 'OS'} - R$ ${Number(wo.cost_total || wo.costTotal || 0).toFixed(2)}`,
                          date: new Date(wo.created_at || wo.createdAt || Date.now()).toLocaleDateString('pt-BR'),
                          icon: <Wrench className="w-4 h-4" />,
                          iconBg: "bg-blue-100 dark:bg-blue-900/30",
                          iconColor: "text-blue-600",
                          timestamp: new Date(wo.created_at || wo.createdAt || Date.now()).getTime()
                        })),
                        ...(costsData?.fuelings || []).map((f: any) => ({
                          id: `fuel-${f.id}`,
                          title: "Abastecimento",
                          description: `${f.volume || f.liters || f.quantity || 0} Litros - R$ ${Number(f.cost || f.totalCost || 0).toFixed(2)}`,
                          date: new Date(f.date || f.createdAt || f.fuel_date || Date.now()).toLocaleDateString('pt-BR'),
                          icon: <Activity className="w-4 h-4" />,
                          iconBg: "bg-green-100 dark:bg-green-900/30",
                          iconColor: "text-green-600",
                          timestamp: new Date(f.date || f.createdAt || f.fuel_date || Date.now()).getTime()
                        })),
                        ...(costsData?.expenses || []).map((ex: any) => ({
                          id: `exp-${ex.id}`,
                          title: "Despesa",
                          description: `${ex.description || ex.category} - R$ ${Number(ex.amount || ex.value || 0).toFixed(2)}`,
                          date: new Date(ex.date || ex.createdAt || Date.now()).toLocaleDateString('pt-BR'),
                          icon: <DollarSign className="w-4 h-4" />,
                          iconBg: "bg-red-100 dark:bg-red-900/30",
                          iconColor: "text-red-600",
                          timestamp: new Date(ex.date || ex.createdAt || Date.now()).getTime()
                        }))
                      ].sort((a, b) => b.timestamp - a.timestamp)
                    } />
                  </TabsContent>

                  <TabsContent value="auditoria" className="m-0 h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <FileSearch className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">Log de Auditoria</h3>
                      <p className="text-muted-foreground text-sm max-w-sm">
                        Rastreabilidade completa de todas as alterações e ações realizadas neste registro.
                      </p>
                    </div>
                  </TabsContent>

                </div>
              </Tabs>

            </div>
          </div>
        </div>

      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
          </DialogHeader>
          <VehicleForm 
            initialData={{
              ...vehicle,
              purchaseDate: vehicle?.purchaseDate ? vehicle.purchaseDate.split('T')[0] : ''
            }} 
            onSuccess={() => {
              setIsEditDialogOpen(false)
              mutateVehicle()
            }} 
          />
        </DialogContent>
      </Dialog>

      {isAssignModalOpen && (
        <VehicleAssignmentModal
          vehicleId={id}
          vehiclePlate={vehicle?.plate}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => {
            setIsAssignModalOpen(false)
            mutateVehicle()
          }}
        />
      )}
    </AppLayout>
  )
}
