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
  RefreshCw, Car, Building, Shield, MoreVertical, Edit, Trash
} from "lucide-react"
import { StatusPill } from "@/components/ui/status-pill"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NewDocumentModal } from "../new-document-modal"
import { toast } from "sonner"
import * as React from "react"

import useSWR from "swr"
import { documentService } from "@/services/document.service"

export default function DocumentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const { data: documentData, isLoading } = useSWR(
    id ? `document_detail_${id}` : null,
    () => documentService.getDocumentById(id),
    { revalidateOnFocus: false }
  )

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center animate-pulse text-muted-foreground">
          Carregando documento...
        </div>
      </AppLayout>
    )
  }

  if (!documentData) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold">Documento não encontrado</h2>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/documents')}>Voltar</Button>
        </div>
      </AppLayout>
    )
  }

  const daysRemaining = documentData.expiry_date 
    ? Math.ceil((new Date(documentData.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  const mockTimelineEvents: TimelineEvent[] = [
    {
      id: "created",
      date: documentData.created_at ? new Date(documentData.created_at).toLocaleDateString('pt-BR') : "Desconhecido",
      title: "Documento Criado",
      description: "Documento registrado no sistema.",
      icon: <CheckCircle className="w-4 h-4" />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600"
    }
  ]

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await documentService.deleteDocument(id)
      toast.success("Documento excluído com sucesso")
      router.push('/documents')
    } catch (error) {
      toast.error("Erro ao excluir documento")
      setIsDeleting(false)
    }
  }

  const fileUrlStr = documentData.file_url && documentData.file_url.startsWith('/') 
    ? `http://localhost:3001${documentData.file_url}` 
    : documentData.file_url;

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">
        
        <PageHeader 
          breadcrumbs={[{ label: "Frota", href: "/vehicles" }, { label: "Documentos", href: "/documents" }, { label: "Detalhes" }]}
          title={documentData.name}
          description={`Documento • ${documentData.number || "Sem número"}`}
          actions={
            <Button variant="outline" size="sm" onClick={() => router.push('/documents')} className="h-8 gap-1.5 font-medium">
              <span className="mr-1">&larr;</span> Voltar para Documentos
            </Button>
          }
        />

        {/* Resumo Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-2">
          <MetricCard title="Categoria" value={documentData.category} icon={<FileText className="h-4 w-4" />} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
          <MetricCard title="Situação" value={documentData.status} icon={<CheckCircle className="h-4 w-4" />} iconBgColor="bg-green-100" iconColor="text-green-600" />
          <MetricCard title="Dias Restantes" value={documentData.status === "Vencido" ? "0 dias" : `${daysRemaining} dias`} icon={<CalendarClock className="h-4 w-4" />} />
          <MetricCard title="Responsável" value={documentData.responsible || "Não informado"} icon={<User className="h-4 w-4" />} />
          <MetricCard title="Última Atualização" value={documentData.updated_at ? new Date(documentData.updated_at).toLocaleDateString('pt-BR') : "-"} icon={<Clock className="h-4 w-4" />} />
          <MetricCard title="Referência" value={(documentData as any).vehicle_plate || (documentData as any).driver_name || documentData.related_to || "-"} icon={<ShieldCheck className="h-4 w-4" />} />
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
                      fileName={documentData.name ? `${documentData.name}${documentData.name.toLowerCase().endsWith('.pdf') ? '' : '.pdf'}` : "documento_anexado.pdf"}
                      fileSize="-"
                      fileType="pdf"
                      uploadedBy={documentData.responsible || "Admin"}
                      uploadDate={documentData.created_at ? new Date(documentData.created_at).toLocaleDateString('pt-BR') : "-"}
                      fileUrl={fileUrlStr || "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PiBlbmRvYmogMiAwIG9iaiA8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PiBlbmRvYmogMyAwIG9iaiA8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4gZW5kb2JqIDQgMCBvYmogPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4gZW5kb2JqIDUgMCBvYmogPDwvTGVuZ3RoIDUzPj5zdHJlYW0KQlQKOTAgNzAwIFRECi9GMSAyNCBUZgooRG9jdW1lbnRvIGRlIERlbW9uc3RyYWNhbykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2NiAwMDAwMCBuIAowMDAwMDAwMTI0IDAwMDAwIG4gCjAwMDAwMDAyNjEgMDAwMDAgbiAKMDAwMDAwMDM1MiAwMDAwMCBuIAp0cmFpbGVyCjw8L1Jvb3QgMSAwIFIvU2l6ZSA2Pj4Kc3RhcnR4cmVmCjQ1NgolJUVPRgo="}
                      previewUrl={fileUrlStr || "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PiBlbmRvYmogMiAwIG9iaiA8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PiBlbmRvYmogMyAwIG9iaiA8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4gZW5kb2JqIDQgMCBvYmogPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4gZW5kb2JqIDUgMCBvYmogPDwvTGVuZ3RoIDUzPj5zdHJlYW0KQlQKOTAgNzAwIFRECi9GMSAyNCBUZgooRG9jdW1lbnRvIGRlIERlbW9uc3RyYWNhbykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2NiAwMDAwMCBuIAowMDAwMDAwMTI0IDAwMDAwIG4gCjAwMDAwMDAyNjEgMDAwMDAgbiAKMDAwMDAwMDM1MiAwMDAwMCBuIAp0cmFpbGVyCjw8L1Jvb3QgMSAwIFIvU2l6ZSA2Pj4Kc3RhcnR4cmVmCjQ1NgolJUVPRgo="}
                    />
                  </div>
                  <div className="lg:col-span-1 border-l pl-6">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" /> 
                      Eventos Recentes
                    </h3>
                    <Timeline events={mockTimelineEvents} className="mt-4" compact={true} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="relacionamentos" className="m-0 h-full">
                <div className="max-w-2xl">
                  <h3 className="text-sm font-semibold mb-4">Entidades Vinculadas</h3>
                  <div className="space-y-3">
                    {documentData.vehicle_id ? (
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => router.push(`/vehicles/${documentData.vehicle_id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Car className="w-4 h-4" /></div>
                          <div>
                            <p className="text-sm font-semibold">Veículo {(documentData as any).vehicle_plate}</p>
                            <p className="text-xs text-muted-foreground">Veículo</p>
                          </div>
                        </div>
                        <Badge variant="outline">Ver Veículo</Badge>
                      </div>
                    ) : documentData.driver_id ? (
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><User className="w-4 h-4" /></div>
                          <div>
                            <p className="text-sm font-semibold">Motorista {(documentData as any).driver_name}</p>
                            <p className="text-xs text-muted-foreground">Colaborador</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 border rounded-lg bg-muted/10 text-muted-foreground text-sm">
                        Nenhuma entidade vinculada diretamente a este documento.
                      </div>
                    )}
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
                        <td className="px-4 py-3 font-semibold">Atual</td>
                        <td className="px-4 py-3">{documentData.responsible || "Sistema"}</td>
                        <td className="px-4 py-3">{documentData.created_at ? new Date(documentData.created_at).toLocaleDateString('pt-BR') : "-"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{documentData.notes || "Documento atual."}</td>
                        <td className="px-4 py-3 text-right">
                          {documentData.file_url && <Button variant="ghost" size="sm" className="h-7 text-xs">Download</Button>}
                        </td>
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

      <NewDocumentModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
        document={documentData}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o documento
              <span className="font-semibold text-foreground"> {documentData.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }} 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
