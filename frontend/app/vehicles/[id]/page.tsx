"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { ChevronRight, ArrowLeft, Settings2, FileText, Wrench, Shield, UserPlus, FileSearch, History, Activity, CalendarClock, DollarSign, Plus, Download, CarFront, FileSignature } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VehicleForm } from "@/components/vehicles/VehicleForm"
import { VehicleAssignmentModal } from "@/components/vehicles/VehicleAssignmentModal"
import { vehicleService } from "@/services/api"

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

  const [vehicle, setVehicle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("visao-geral")

  const fetchVehicle = async () => {
    try {
      const response = await vehicleService.getById(id)
      setVehicle(response.data.data)
    } catch (error) {
      console.error("Error fetching vehicle", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicle()
  }, [id])

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
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Motorista</span>
                  <span className="font-semibold text-foreground">{vehicle.driverName || "Nenhum"}</span>
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
                  { id: "1", type: "warning", title: "Manutenção Próxima", description: "Revisão preventiva em 500 km" },
                  { id: "2", type: "error", title: "Licenciamento Vencendo", description: "Licenciamento vence em 5 dias" }
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
                        title="Custos (Mês)"
                        value="R$ 1.450"
                        icon={<DollarSign className="w-4 h-4" />}
                        iconBgColor="bg-green-100 dark:bg-green-900/30"
                        iconColor="text-green-600"
                        trend={-5.2}
                        trendLabel="vs último mês"
                      />
                      <MetricCard
                        title="Consumo Médio"
                        value="7.8 km/L"
                        icon={<Activity className="w-4 h-4" />}
                        iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                        iconColor="text-blue-600"
                      />
                      <MetricCard
                        title="Disponibilidade"
                        value="98.5%"
                        icon={<CalendarClock className="w-4 h-4" />}
                        iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                        iconColor="text-purple-600"
                        trend={1.2}
                        trendLabel="vs último mês"
                      />
                      <MetricCard
                        title="Multas (Ano)"
                        value="2"
                        icon={<FileSignature className="w-4 h-4" />}
                        iconBgColor="bg-orange-100 dark:bg-orange-900/30"
                        iconColor="text-orange-600"
                      />
                    </div>

                    {/* Insights & Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      
                      <div className="space-y-4">
                        <ChartCard 
                          title="Evolução de Custos"
                          type="bar"
                          data={[1200, 1900, 3000, 5000, 2000, 3000]}
                          labels={['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']}
                        />
                        <ChartCard 
                          title="Consumo de Combustível"
                          type="line"
                          data={[7.2, 7.5, 7.8, 7.4, 7.9, 7.8]}
                          labels={['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']}
                        />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <InsightCard 
                          title="Análise de Desempenho"
                          description="O veículo tem apresentado consumo estável, porém acima da média da categoria (6.5 km/L)."
                          type="info"
                          actionText="Ver relatório"
                        />
                        <InsightCard 
                          title="Desgaste de Pneus"
                          description="Os pneus traseiros estão próximos da vida útil recomendada. Previsão de troca em 15 dias."
                          type="warning"
                          actionText="Agendar OS"
                        />
                        <InsightCard 
                          title="Multas Recentes"
                          description="Foram registradas 2 infrações de velocidade na mesma via na última semana."
                          type="danger"
                          actionText="Analisar condutor"
                        />
                      </div>

                    </div>
                  </TabsContent>

                  {/* OUTRAS ABAS (MOCK) */}
                  <TabsContent value="documentacao" className="m-0 h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">Módulo de Documentação</h3>
                      <p className="text-muted-foreground text-sm max-w-sm">
                        O sistema carregará aqui os CRLVs, contratos e licenciamentos integrados ao veículo.
                      </p>
                    </div>
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

                  <TabsContent value="manutencao" className="m-0 h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Wrench className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">Plano de Manutenção</h3>
                      <p className="text-muted-foreground text-sm max-w-sm">
                        Ordem de serviços ativas, histórico de peças e planos de revisão preventiva.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="historico" className="m-0 h-full p-4">
                    <h3 className="font-semibold text-lg border-b pb-2 mb-4">Linha do Tempo</h3>
                    <Timeline events={[
                      {
                        id: "1",
                        title: "Manutenção Preventiva",
                        description: "Troca de óleo e filtros. (OS #4312)",
                        date: "Hoje, 09:30",
                        icon: <Wrench className="w-4 h-4" />,
                        iconBg: "bg-blue-100 dark:bg-blue-900/30",
                        iconColor: "text-blue-600"
                      },
                      {
                        id: "2",
                        title: "Abastecimento",
                        description: "45 Litros - Posto Ipiranga Centro",
                        date: "Ontem, 18:45",
                        icon: <Activity className="w-4 h-4" />,
                        iconBg: "bg-green-100 dark:bg-green-900/30",
                        iconColor: "text-green-600"
                      },
                      {
                        id: "3",
                        title: "Atribuição de Motorista",
                        description: "Atribuído ao motorista João Silva",
                        date: "10/05/2026",
                        icon: <UserPlus className="w-4 h-4" />,
                        iconBg: "bg-purple-100 dark:bg-purple-900/30",
                        iconColor: "text-purple-600"
                      },
                      {
                        id: "4",
                        title: "Veículo Cadastrado",
                        description: "Adicionado à frota",
                        date: "01/05/2026",
                        icon: <CarFront className="w-4 h-4" />,
                        iconBg: "bg-orange-100 dark:bg-orange-900/30",
                        iconColor: "text-orange-600"
                      }
                    ]} />
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
              fetchVehicle()
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
            fetchVehicle()
          }}
        />
      )}
    </AppLayout>
  )
}
