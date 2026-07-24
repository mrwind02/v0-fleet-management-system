"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { ChevronRight, ArrowLeft, Droplet, FileText, Activity, MapPin, Receipt, Clock, Info, Download, Trash, Edit, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { fuelService, vehicleService, driverService } from "@/services/api"
import { MetricCard } from "@/components/ui/metric-card"
import { Timeline } from "@/components/ui/timeline"
import { InsightCard } from "@/components/ui/insight-card"
import { FuelFormSheet } from "@/components/fuel/FuelFormSheet"

export default function FuelDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [record, setRecord] = useState<any>(null)
  const [vehicle, setVehicle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    if (id) fetchDetails()
  }, [id])

  const fetchDetails = async () => {
    try {
      setIsLoading(true)
      const res = await fuelService.getById(id)
      setRecord(res.data.data)

      if (res.data.data.vehicleId) {
        const vRes = await vehicleService.getById(res.data.data.vehicleId)
        setVehicle(vRes.data.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (!record) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-foreground">Registro não encontrado</h2>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/fuel')}>Voltar</Button>
        </div>
      </AppLayout>
    )
  }

  const fuelDate = new Date(record.fuelDate)
  const formattedDate = fuelDate.toLocaleDateString('pt-BR')
  const formattedTime = fuelDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const mockTimelineEvents = [
    {
      id: "1",
      title: "Abastecimento Registrado",
      description: `Registrado por Sistema (${record.driverName || 'Motorista Padrão'})`,
      date: formattedDate,
      time: formattedTime,
      type: "success" as const,
      icon: <Activity className="w-4 h-4 text-white" />
    },
    {
      id: "2",
      title: "Comprovante Anexado",
      description: "Upload realizado via aplicativo",
      date: formattedDate,
      time: formattedTime,
      type: "info" as const,
      icon: <FileText className="w-4 h-4 text-white" />
    }
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">
        
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/fuel')} className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center text-xs font-semibold text-muted-foreground mb-1">
                <span className="cursor-pointer hover:underline" onClick={() => router.push('/fuel')}>Abastecimentos</span>
                <ChevronRight className="h-3 w-3 mx-1.5" />
                <span className="text-foreground">#{record.id.substring(0, 8)}</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{formattedDate} - {record.gasStationName}</h1>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 shadow-none text-[10px] px-2 py-0.5">Processado</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Duplicar
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setIsFormOpen(true)}>
              <Edit className="h-3.5 w-3.5 mr-1.5" /> Editar
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-red-600 hover:text-red-700 border-red-200 bg-red-50 hover:bg-red-100">
              <Trash className="h-3.5 w-3.5 mr-1.5" /> Excluir
            </Button>
          </div>
        </div>

        {/* Cards Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
          <MetricCard
            title="Veículo"
            value={record.plate}
            icon={<Info className="h-4 w-4" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            trendLabel={`${vehicle?.brand || ''} ${vehicle?.model || ''}`}
          />
          <MetricCard
            title="Combustível"
            value={record.fuelType?.toUpperCase() || "DIESEL"}
            icon={<Droplet className="h-4 w-4" />}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
          />
          <MetricCard
            title="Valor Total"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.cost)}
            icon={<Receipt className="h-4 w-4" />}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
          />
          <MetricCard
            title="Litros"
            value={`${record.liters} L`}
            icon={<Activity className="h-4 w-4" />}
            iconBgColor="bg-sky-100 dark:bg-sky-900/30"
            iconColor="text-sky-600 dark:text-sky-400"
            trendLabel={record.costPerLiter ? `R$ ${record.costPerLiter}/L` : `R$ ${(record.cost/record.liters).toFixed(3)}/L`}
          />
          <MetricCard
            title="Hodômetro"
            value={`${record.odometerReading} km`}
            icon={<MapPin className="h-4 w-4" />}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
          />
        </div>

        {/* Tabs Area */}
        <div className="flex flex-1 min-h-[400px] bg-card rounded-xl border shadow-sm mt-2 overflow-hidden">
          <Tabs defaultValue="resumo" className="w-full flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 sm:border-r border-b sm:border-b-0 bg-muted/20 p-2 sm:p-4">
              <TabsList className="flex sm:flex-col h-auto w-full bg-transparent p-0 gap-1 sm:gap-2">
                <TabsTrigger value="resumo" className="w-full justify-start text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Info className="w-3.5 h-3.5 mr-2" /> Resumo
                </TabsTrigger>
                <TabsTrigger value="comprovante" className="w-full justify-start text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <FileText className="w-3.5 h-3.5 mr-2" /> Comprovante
                </TabsTrigger>
                <TabsTrigger value="historico" className="w-full justify-start text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Clock className="w-3.5 h-3.5 mr-2" /> Histórico
                </TabsTrigger>
                <TabsTrigger value="auditoria" className="w-full justify-start text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Activity className="w-3.5 h-3.5 mr-2" /> Auditoria
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-0 overflow-y-auto">
              
              <TabsContent value="resumo" className="m-0 h-full p-6 space-y-8">
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-4">Informações Detalhadas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Localização</p>
                        <p className="text-sm font-medium">{record.gasStationName}</p>
                        <p className="text-xs text-muted-foreground">{record.city || 'Cidade não informada'} - {record.uf || 'UF não informada'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Motorista</p>
                        <p className="text-sm font-medium">{record.driverName || 'Não atribuído'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Unidade</p>
                        <p className="text-sm font-medium">{record.unitName || 'Geral'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Pagamento</p>
                        <p className="text-sm font-medium capitalize">{record.paymentMethod?.replace('_', ' ') || 'Cartão Frota'}</p>
                        {record.fleetCard && <p className="text-xs text-muted-foreground">Cartão final: {record.fleetCard.slice(-4)}</p>}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Centro de Custo</p>
                        <p className="text-sm font-medium">{record.costCenter || 'Operação Padrão'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-4">Análise de Consumo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InsightCard 
                      title="Consumo desde o último"
                      value="4.5 km/L"
                      subtitle="Baseado no hodômetro"
                      trend="Eficiente"
                      isPositive={true}
                    />
                    <InsightCard 
                      title="Anomalia detectada?"
                      value="Nenhuma"
                      subtitle="O consumo está dentro do padrão esperado"
                      trend="Seguro"
                      isPositive={true}
                    />
                  </div>
                </div>

                {record.notes && (
                  <div>
                    <h3 className="font-semibold text-lg border-b pb-2 mb-4">Observações</h3>
                    <div className="bg-muted/30 p-4 rounded-lg text-sm text-foreground">
                      {record.notes}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comprovante" className="m-0 h-full p-6">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h3 className="font-semibold text-lg">Comprovante Fiscal</h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" /> Baixar PDF
                  </Button>
                </div>
                <div className="w-full max-w-md mx-auto aspect-[3/4] bg-muted/20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                  <Receipt className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Nenhum comprovante anexado</p>
                  <p className="text-xs">Faça o upload do cupom fiscal</p>
                  <Button variant="secondary" size="sm" className="mt-4">Fazer Upload</Button>
                </div>
              </TabsContent>

              <TabsContent value="historico" className="m-0 h-full p-6">
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Linha do Tempo</h3>
                <Timeline events={mockTimelineEvents} />
              </TabsContent>

              <TabsContent value="auditoria" className="m-0 h-full p-6">
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Auditoria</h3>
                <div className="bg-muted/10 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left py-2 px-4 font-semibold text-muted-foreground">Ação</th>
                        <th className="text-left py-2 px-4 font-semibold text-muted-foreground">Usuário</th>
                        <th className="text-left py-2 px-4 font-semibold text-muted-foreground">Data/Hora</th>
                        <th className="text-left py-2 px-4 font-semibold text-muted-foreground">Origem</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">Criação</td>
                        <td className="py-3 px-4">Admin</td>
                        <td className="py-3 px-4">{new Date(record.createdAt).toLocaleString('pt-BR')}</td>
                        <td className="py-3 px-4">Web / Dashboard</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>

      <FuelFormSheet 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={() => {
          setIsFormOpen(false)
          fetchDetails()
        }}
        editData={record}
      />
    </AppLayout>
  )
}
