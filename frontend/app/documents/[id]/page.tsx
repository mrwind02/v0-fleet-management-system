"use client"

import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Timeline, TimelineEvent } from "@/components/ui/timeline"
import { FilePreviewCard } from "@/components/ui/file-preview-card"
import { Badge } from "@/components/ui/badge"
import { 
  Settings2, Download, Copy, AlertTriangle, FileText, 
  CheckCircle, CalendarClock, User, Clock, ShieldCheck,
  RefreshCw, Car, Building, Shield
} from "lucide-react"
import { StatusPill } from "@/components/ui/status-pill"

export default function DocumentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // Mock data for the specific document
  const mockDocument = {
    id: id,
    name: "Apólice de Seguro Frota 2024",
    category: "Seguro",
    status: "Válido",
    relatedTo: "Mapfre Seguros",
    number: "POL-9988776655",
    version: "v2.1",
    daysRemaining: 45,
    responsible: "Admin (João)",
    lastUpdate: "Há 2 dias"
  }

  const mockTimelineEvents: TimelineEvent[] = [
    {
      id: "1",
      date: "Hoje, 10:30",
      title: "Documento Aprovado",
      description: "Revisão jurídica concluída.",
      icon: <CheckCircle className="w-4 h-4" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600"
    },
    {
      id: "2",
      date: "Ontem, 16:45",
      title: "Nova versão enviada",
      description: "Versão v2.1 carregada por Admin.",
      icon: <RefreshCw className="w-4 h-4" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600"
    },
    {
      id: "3",
      date: "Há 5 dias",
      title: "Comentário adicionado",
      description: "\"Falta assinatura do diretor na página 3.\"",
      icon: <FileText className="w-4 h-4" />
    }
  ]

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">
        
        <PageHeader 
          breadcrumbs={[{ label: "Frota", href: "/vehicles" }, { label: "Documentos", href: "/documents" }, { label: "Visão 360º" }]}
          title={mockDocument.name}
          description={`Gerenciamento da versão ${mockDocument.version} • ${mockDocument.number}`}
          actions={
            <>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button variant="outline" className="h-9 text-xs shadow-sm">
                <Copy className="mr-2 h-4 w-4" /> Nova Versão
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm">
                <Settings2 className="mr-2 h-4 w-4" /> Editar
              </Button>
            </>
          }
        />

        {/* Resumo Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-2">
          <MetricCard title="Categoria" value={mockDocument.category} icon={<FileText className="h-4 w-4" />} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
          <MetricCard title="Situação" value={mockDocument.status} icon={<CheckCircle className="h-4 w-4" />} iconBgColor="bg-green-100" iconColor="text-green-600" />
          <MetricCard title="Dias Restantes" value={`${mockDocument.daysRemaining} dias`} icon={<CalendarClock className="h-4 w-4" />} />
          <MetricCard title="Responsável" value={mockDocument.responsible} icon={<User className="h-4 w-4" />} />
          <MetricCard title="Última Atualização" value={mockDocument.lastUpdate} icon={<Clock className="h-4 w-4" />} />
          <MetricCard title="Versão Atual" value={mockDocument.version} icon={<ShieldCheck className="h-4 w-4" />} />
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] mt-2">
          <Tabs defaultValue="resumo" className="w-full flex-1 flex flex-col">
            <div className="px-2 pt-2 border-b bg-muted/10 overflow-x-auto overflow-y-hidden">
              <TabsList className="bg-transparent h-10 w-max">
                <TabsTrigger value="resumo" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Resumo</TabsTrigger>
                <TabsTrigger value="historico" className="text-xs">Histórico</TabsTrigger>
                <TabsTrigger value="versoes" className="text-xs">Versões</TabsTrigger>
                <TabsTrigger value="relacionamentos" className="text-xs">Relacionamentos</TabsTrigger>
                <TabsTrigger value="anexos" className="text-xs">Anexos</TabsTrigger>
                <TabsTrigger value="comentarios" className="text-xs">Comentários</TabsTrigger>
                <TabsTrigger value="auditoria" className="text-xs">Auditoria</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              <TabsContent value="resumo" className="m-0 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                  <div className="lg:col-span-2">
                    <h3 className="text-sm font-semibold mb-4">Visualizador do Documento</h3>
                    <FilePreviewCard 
                      fileName="apolice_frota_2024_assinada.pdf"
                      fileSize="2.4 MB"
                      fileType="pdf"
                      uploadedBy="Admin"
                      uploadDate="15/10/2023"
                    />
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
              
              <TabsContent value="relacionamentos" className="m-0 h-full">
                <div className="max-w-2xl">
                  <h3 className="text-sm font-semibold mb-4">Entidades Vinculadas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Car className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-semibold">Scania R450 (XYZ-9876)</p>
                          <p className="text-xs text-muted-foreground">Veículo</p>
                        </div>
                      </div>
                      <Badge variant="outline">Ver Veículo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><User className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-semibold">João Silva</p>
                          <p className="text-xs text-muted-foreground">Motorista Principal</p>
                        </div>
                      </div>
                      <Badge variant="outline">Ver Motorista</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg"><Shield className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-semibold">Mapfre Seguros</p>
                          <p className="text-xs text-muted-foreground">Fornecedor / Seguradora</p>
                        </div>
                      </div>
                      <Badge variant="outline">Ver Fornecedor</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="versoes" className="m-0 h-full">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Versão</th>
                        <th className="px-4 py-3">Usuário</th>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">Observação</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="bg-blue-50/20">
                        <td className="px-4 py-3 font-semibold">v2.1 (Atual)</td>
                        <td className="px-4 py-3">Admin</td>
                        <td className="px-4 py-3">Ontem, 16:45</td>
                        <td className="px-4 py-3 text-muted-foreground">Ajuste na cláusula 4.</td>
                        <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-7 text-xs">Download</Button></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-muted-foreground">v2.0</td>
                        <td className="px-4 py-3">João RH</td>
                        <td className="px-4 py-3">15/10/2023</td>
                        <td className="px-4 py-3 text-muted-foreground">Nova apólice 2024.</td>
                        <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-7 text-xs">Restaurar</Button></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-muted-foreground">v1.0</td>
                        <td className="px-4 py-3">Admin</td>
                        <td className="px-4 py-3">10/10/2022</td>
                        <td className="px-4 py-3 text-muted-foreground">Documento original.</td>
                        <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" className="h-7 text-xs">Restaurar</Button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="comentarios" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">
                Chat interno de comentários da equipe será exibido aqui.
              </TabsContent>
              <TabsContent value="historico" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">
                Histórico completo do ciclo de vida do documento.
              </TabsContent>
              <TabsContent value="anexos" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">
                Lista de anexos secundários (ex: comprovantes de pagamento).
              </TabsContent>
              <TabsContent value="auditoria" className="m-0 h-full flex items-center justify-center text-muted-foreground text-sm">
                Logs imutáveis de segurança e acessos (Aprovação, Exclusão, Mudança de Status).
              </TabsContent>
            </div>
          </Tabs>
        </div>

      </div>
    </AppLayout>
  )
}
