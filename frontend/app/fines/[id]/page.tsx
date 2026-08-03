"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Timeline, TimelineEvent } from "@/components/ui/timeline"
import { FilePreviewCard } from "@/components/ui/file-preview-card"
import { StatusPill } from "@/components/ui/status-pill"
import { 
  Settings2, FileText, CheckCircle, Clock, 
  MapPin, ShieldAlert, AlertTriangle, Scale, User, Car, 
  CreditCard, Paperclip, MessageSquare, History 
} from "lucide-react"
import useSWR from "swr"

export default function FineDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const fetchFine = async () => {
    if (!id) return null
    try {
      const { fineService } = await import("@/services/fine.service")
      const res = await fineService.getFineById(id)
      return res
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const { data: fine, isLoading, mutate } = useSWR(id ? `fine_detail_${id}` : null, fetchFine, { revalidateOnFocus: false })

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (!fine) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-foreground">Infração não encontrada</h2>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/fines')}>Voltar</Button>
        </div>
      </AppLayout>
    )
  }

  const mockTimelineEvents: TimelineEvent[] = [
    {
      id: "1",
      date: "Hoje, 09:15",
      title: "Recurso Enviado",
      description: "Defesa prévia enviada ao DER/SP.",
      icon: <Scale className="w-4 h-4" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600"
    },
    {
      id: "2",
      date: "Ontem, 14:30",
      title: "Documento Anexado",
      description: "CNH do condutor e documento do veículo anexados.",
      icon: <Paperclip className="w-4 h-4" />,
      iconBg: "bg-slate-100 dark:bg-slate-900/30",
      iconColor: "text-slate-600"
    },
    {
      id: "3",
      date: "Há 2 dias",
      title: "Condutor Indicado",
      description: "Carlos Oliveira indicado como infrator.",
      icon: <User className="w-4 h-4" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600"
    },
    {
      id: "4",
      date: "Há 5 dias",
      title: "Notificação Recebida",
      description: "Notificação de Autuação (NA) registrada no sistema.",
      icon: <AlertTriangle className="w-4 h-4" />,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600"
    }
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 pb-2 w-full animate-in fade-in duration-300">
        
        <PageHeader 
          breadcrumbs={[{ label: "Frota", href: "/vehicles" }, { label: "Multas", href: "/fines" }, { label: "Visão 360º" }]}
          title={fine.auto_number || "Auto não informado"}
          description={`${fine.category} • Veículo: ${fine.vehicle_plate || 'N/A'} • Motorista: ${fine.driver_name || 'N/A'}`}
          actions={
            <>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                <Paperclip className="mr-2 h-4 w-4" /> Anexar Documento
              </Button>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                <CreditCard className="mr-2 h-4 w-4" /> Registrar Pagamento
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm">
                <Settings2 className="mr-2 h-4 w-4" /> Editar
              </Button>
            </>
          }
        />

        {/* Resumo Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-2">
          <MetricCard 
            title="Valor da Multa" 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fine.value || 0)} 
            icon={<CreditCard className="h-4 w-4" />} 
            iconBgColor="bg-blue-100" 
            iconColor="text-blue-600" 
          />
          <MetricCard 
            title="Pontuação" 
            value={`${fine.points || 0} Pontos`} 
            icon={<ShieldAlert className="h-4 w-4" />} 
            iconBgColor="bg-orange-100" 
            iconColor="text-orange-600" 
          />
          <MetricCard 
            title="Situação" 
            value={
              <div className="flex items-center -ml-1 mt-1">
                <StatusPill label={fine.status === 'aberto' ? 'Em Aberto' : (fine.status === 'pago' ? 'Pago' : fine.status)} status={fine.status === 'pago' ? 'success' : 'warning'} />
              </div>
            } 
          />
          <MetricCard 
            title="Vencimento" 
            value={fine.due_date ? new Date(fine.due_date).toLocaleDateString('pt-BR') : 'N/A'} 
            icon={<Clock className="h-4 w-4" />} 
          />
          <MetricCard 
            title="Veículo" 
            value={fine.vehicle_plate || 'Não associado'} 
            icon={<Car className="h-4 w-4" />} 
          />
          <MetricCard 
            title="Última Atualização" 
            value={fine.updated_at ? new Date(fine.updated_at).toLocaleDateString('pt-BR') : 'N/A'} 
            icon={<History className="h-4 w-4" />} 
          />
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] mt-2">
          <Tabs defaultValue="resumo" className="w-full flex-1 flex flex-col">
            <div className="px-2 pt-2 border-b bg-muted/10 overflow-x-auto overflow-y-hidden">
              <TabsList className="bg-transparent h-10 w-max">
                <TabsTrigger value="resumo" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <FileText className="h-3 w-3 mr-2" />
                  Resumo
                </TabsTrigger>
                <TabsTrigger value="documentos" className="text-xs">
                  <Paperclip className="h-3 w-3 mr-2" />
                  Documentos
                </TabsTrigger>
                <TabsTrigger value="pagamento" className="text-xs">
                  <CreditCard className="h-3 w-3 mr-2" />
                  Pagamento
                </TabsTrigger>
                <TabsTrigger value="recurso" className="text-xs">
                  <Scale className="h-3 w-3 mr-2" />
                  Recurso
                </TabsTrigger>
                <TabsTrigger value="historico" className="text-xs">
                  <History className="h-3 w-3 mr-2" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="comentarios" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Comentários
                </TabsTrigger>
                <TabsTrigger value="auditoria" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-2" />
                  Auditoria
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              <TabsContent value="resumo" className="m-0 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-4">Detalhes da Infração</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg bg-muted/20">
                          <p className="text-xs text-muted-foreground mb-1">Órgão Autuador</p>
                          <p className="font-medium text-sm">{fine.organ || 'Não informado'}</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/20">
                          <p className="text-xs text-muted-foreground mb-1">Data da Infração</p>
                          <p className="font-medium text-sm">{fine.infraction_date ? new Date(fine.infraction_date).toLocaleDateString('pt-BR') : 'N/A'}</p>
                        </div>
                        <div className="col-span-2 p-4 border rounded-lg bg-muted/20">
                          <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                          <p className="font-medium text-sm">{fine.description || fine.category}</p>
                        </div>
                        <div className="col-span-2 p-4 border rounded-lg bg-muted/20">
                          <p className="text-xs text-muted-foreground mb-1">Notas adicionais</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="font-medium text-sm">{fine.notes || 'Nenhuma nota registrada'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-4">Mapa da Ocorrência</h3>
                      <div className="h-[200px] w-full bg-slate-100 dark:bg-slate-800 rounded-lg border flex items-center justify-center">
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Integração com Google Maps pendente
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1 border-l pl-6">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" /> 
                      Eventos Recentes
                    </h3>
                    <Timeline events={mockTimelineEvents} className="mt-4" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documentos" className="m-0 h-full">
                <div className="max-w-4xl space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold">Anexos Relacionados</h3>
                    <Button size="sm" variant="outline"><Paperclip className="h-4 w-4 mr-2" /> Novo Documento</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FilePreviewCard 
                      fileName="notificacao_autuacao_AIT849312.pdf"
                      fileSize="1.2 MB"
                      fileType="pdf"
                      uploadedBy="Sistema"
                      uploadDate="Há 5 dias"
                    />
                    <FilePreviewCard 
                      fileName="cnh_carlos_oliveira.jpg"
                      fileSize="450 KB"
                      fileType="image"
                      uploadedBy="Carlos O."
                      uploadDate="Há 2 dias"
                    />
                    <FilePreviewCard 
                      fileName="defesa_previa_DER.pdf"
                      fileSize="890 KB"
                      fileType="pdf"
                      uploadedBy="Ana (Jurídico)"
                      uploadDate="Hoje, 09:15"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pagamento" className="m-0 h-full">
                <div className="max-w-2xl">
                  <h3 className="text-sm font-semibold mb-4">Informações Financeiras</h3>
                  <div className="border rounded-lg p-6 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Original</p>
                        <p className="text-2xl font-bold">R$ 195,23</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Desconto Antecipado (20%)</p>
                        <p className="text-lg font-semibold text-green-600">R$ 156,18</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Vencimento Original</p>
                        <p className="font-medium">15/11/2026</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vencimento com Desconto</p>
                        <p className="font-medium">05/11/2026</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1"><CreditCard className="w-4 h-4 mr-2" /> Registrar Pagamento (Boleto)</Button>
                      <Button className="flex-1" variant="outline">Copiar Código de Barras</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recurso" className="m-0 h-full">
                <div className="max-w-2xl">
                  <h3 className="text-sm font-semibold mb-4">Status do Recurso</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10 rounded-lg flex items-start gap-4">
                      <Scale className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-400">Defesa Prévia em Análise</p>
                        <p className="text-sm text-blue-800/80 dark:text-blue-300/80 mt-1">O recurso foi protocolado com sucesso no dia de hoje às 09:15. Aguardando julgamento pelo órgão responsável.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Responsável</p>
                        <p className="font-medium flex items-center gap-2"><User className="h-4 w-4" /> Ana (Jurídico)</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Prazo Estimado de Resposta</p>
                        <p className="font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> 30 a 60 dias</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="historico" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">
                Histórico completo do ciclo de vida da infração.
              </TabsContent>
              <TabsContent value="comentarios" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">
                Chat interno de comentários da equipe será exibido aqui.
              </TabsContent>
              <TabsContent value="auditoria" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">
                Logs imutáveis de segurança e acessos (Criação, Edição, Deleção).
              </TabsContent>
            </div>
          </Tabs>
        </div>

      </div>
    </AppLayout>
  )
}
