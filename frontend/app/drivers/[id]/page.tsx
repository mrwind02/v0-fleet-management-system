"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { driverService } from "@/services/api"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { AlertPanel, AlertItem } from "@/components/ui/alert-panel"
import { Timeline, TimelineEvent } from "@/components/ui/timeline"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Settings2, AlertTriangle, Car, CalendarClock, CreditCard, Clock, FileCheck, CheckCircle } from "lucide-react"

export default function DriverDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [driver, setDriver] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const response = await driverService.getById(id)
        setDriver(response.data.data)
      } catch (error) {
        console.error("Error fetching driver", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDriver()
  }, [id])

  const mockTimelineEvents: TimelineEvent[] = [
    {
      id: "1",
      date: "Hoje, 08:30",
      title: "Checklist realizado",
      description: "Veículo liberado sem avarias.",
      icon: <CheckCircle className="w-4 h-4" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600"
    },
    {
      id: "2",
      date: "Ontem, 14:15",
      title: "Nova viagem",
      description: "Rota iniciada.",
      icon: <Car className="w-4 h-4" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600"
    }
  ]

  const mockAlerts: AlertItem[] = [
    { id: "a1", type: "warning", title: "Curso Pendente", description: "Vence em 20 dias.", date: "Hoje" }
  ]

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center text-muted-foreground animate-pulse">Carregando motorista...</div>
      </AppLayout>
    )
  }

  if (!driver) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center text-destructive">Motorista não encontrado.</div>
      </AppLayout>
    )
  }

  const shortRegistration = driver.cnh ? driver.cnh.substring(0, 6) : `MT-${id.substring(0,6).toUpperCase()}`

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">
        
        <PageHeader 
          breadcrumbs={[{ label: "Frota", href: "/vehicles" }, { label: "Motoristas", href: "/drivers" }, { label: "Detalhes" }]}
          title={`Visão 360º: ${driver.name} (Matrícula: ${shortRegistration})`}
          description="Acompanhamento detalhado da operação e histórico do condutor."
          actions={
            <>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Reportar Ocorrência
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Editar Dados
              </Button>
            </>
          }
        />

        {/* Resumo Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-2">
          <MetricCard title="Veículo Atual" value="Volvo FH16" icon={<Car className="h-4 w-4" />} />
          <MetricCard title="Disponibilidade" value="Em Operação" icon={<CalendarClock className="h-4 w-4" />} iconBgColor="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600" />
          <MetricCard title="CNH" value={`Válida (Cat ${driver.cnhCategory || "E"})`} icon={<FileCheck className="h-4 w-4" />} iconBgColor="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600" />
          <MetricCard title="Pontuação" value="96" icon={<CheckCircle className="h-4 w-4" />} iconBgColor="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600" />
          <MetricCard title="Multas" value="0" icon={<AlertTriangle className="h-4 w-4" />} />
          <MetricCard title="Tempo Empresa" value="3 Anos" icon={<Clock className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-2">
          
          {/* Main Content (Tabs) */}
          <div className="lg:col-span-3">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
              <Tabs defaultValue="resumo" className="w-full flex-1 flex flex-col">
                <div className="px-2 pt-2 border-b bg-muted/10 overflow-x-auto">
                  <TabsList className="bg-transparent h-10 w-max">
                    <TabsTrigger value="resumo" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Resumo</TabsTrigger>
                    <TabsTrigger value="historico" className="text-xs">Histórico</TabsTrigger>
                    <TabsTrigger value="viagens" className="text-xs">Viagens</TabsTrigger>
                    <TabsTrigger value="abastecimentos" className="text-xs">Abastecimentos</TabsTrigger>
                    <TabsTrigger value="multas" className="text-xs">Multas</TabsTrigger>
                    <TabsTrigger value="documentos" className="text-xs">Documentos</TabsTrigger>
                    <TabsTrigger value="treinamentos" className="text-xs">Treinamentos</TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="p-5 flex-1">
                  <TabsContent value="resumo" className="m-0 h-full">
                    <h3 className="text-sm font-semibold mb-4">Últimos Eventos</h3>
                    <Timeline events={mockTimelineEvents} />
                  </TabsContent>
                  
                  <TabsContent value="documentos" className="m-0 h-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Document Cards Mock */}
                      {[
                        { title: "CNH", status: "Válida", days: "450 dias restantes", color: "border-green-500" },
                        { title: "ASO", status: "Válido", days: "180 dias restantes", color: "border-green-500" },
                        { title: "Curso MOPP", status: "Vencendo", days: "20 dias restantes", color: "border-orange-500" },
                      ].map((doc, idx) => (
                        <div key={idx} className={`p-4 border-l-4 rounded-r-lg bg-muted/20 border-y border-r shadow-sm ${doc.color}`}>
                          <h4 className="font-bold text-sm">{doc.title}</h4>
                          <div className="mt-2 flex justify-between items-center text-xs">
                            <span className="font-semibold">{doc.status}</span>
                            <span className="text-muted-foreground">{doc.days}</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs">Anexar / Renovar</Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="viagens" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">
                    Tabela de viagens do motorista (Futura integração TanStack)
                  </TabsContent>
                  <TabsContent value="multas" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">
                    Tabela de multas e infrações (Futura integração TanStack)
                  </TabsContent>
                  <TabsContent value="historico" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">Conteúdo da Aba Histórico</TabsContent>
                  <TabsContent value="abastecimentos" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">Conteúdo da Aba Abastecimentos</TabsContent>
                  <TabsContent value="treinamentos" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">Conteúdo da Aba Treinamentos</TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
          
          {/* Side Panel (Alerts) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <AlertPanel title="Atenção Necessária" alerts={mockAlerts} />
            
            <div className="p-4 border rounded-xl bg-card shadow-sm text-center">
              <div className="w-20 h-20 bg-muted mx-auto rounded-full mb-3 overflow-hidden flex items-center justify-center font-bold text-3xl text-muted-foreground">
                {driver.name.charAt(0)}
              </div>
              <h3 className="font-bold">{driver.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">Condutor Ativo</p>
              
              <div className="text-xs bg-muted/50 p-3 rounded-lg text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Vencimento CNH</span>
                  <span className="font-medium text-right">{driver.cnhExpiryDate ? new Date(driver.cnhExpiryDate).toLocaleDateString('pt-BR') : "Não informado"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Telefone</span>
                  <span className="font-medium text-right">{driver.phone || "Não informado"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-right truncate w-32">{driver.email || "Não informado"}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  )
}
