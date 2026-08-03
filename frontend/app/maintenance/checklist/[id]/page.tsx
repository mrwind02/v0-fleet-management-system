"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardCheck,
  ChevronLeft,
  Edit,
  Printer,
  Download,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Building2,
  Truck,
  User,
  MapPin,
  ExternalLink,
  History,
  Camera,
  Wrench,
  ShieldCheck,
  Layers,
  Image as ImageIcon,
  Smartphone,
  Save,
  CheckSquare,
  AlertCircle,
  X
} from "lucide-react"

import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResultBadge } from "@/components/ui/result-badge"
import { GalleryGrid } from "@/components/ui/gallery-grid"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Timeline, TimelineEvent } from "@/components/ui/timeline"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { cn } from "@/utils/utils"

import { ChecklistService } from "@/services/checklist.service"
import { ChecklistExecutionItem, ChecklistResult, ChecklistItemEval } from "@/types/checklist"

export default function ExecutionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const executionId = (params.id as string) || "chk-001"

  const [noticeMessage, setNoticeMessage] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("resumo")

  // Modal / Sheet States for Edit and Print
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false)

  // Dynamic Execution State for Live Re-evaluation and Edits
  const baseExecution = ChecklistService.getExecutionById(executionId) || ChecklistService.getExecutions()[0]
  
  const [execution, setExecution] = React.useState<ChecklistExecutionItem>({
    ...baseExecution,
    observerNotes: baseExecution.observerNotes || "Pressão do pneu dianteiro direito ligeiramente abaixo do recomendado (28 PSI). Lanterna de seta traseira direita com baixa intensidade.",
  })

  const [evaluatedItems, setEvaluatedItems] = React.useState<ChecklistItemEval[]>(
    ChecklistService.getEvaluatedItems(execution.id)
  )

  const [reevaluationNotes, setReevaluationNotes] = React.useState(
    "Ressalva aceita sob acompanhamento da engenharia. Veículo liberado com restrição de velocidade máxima (80 km/h) até a parada no terminal de destino."
  )
  const [managerResult, setManagerResult] = React.useState<ChecklistResult>(execution.result)

  const occurrences = ChecklistService.getOccurrences(execution.id)
  const workOrders = ChecklistService.getWorkOrders(execution.id)
  const photos = ChecklistService.getPhotos(execution.id)
  const auditLogs = ChecklistService.getAuditLogs(execution.id)

  const showNotice = (msg: string) => {
    setNoticeMessage(msg)
    setTimeout(() => setNoticeMessage(null), 4000)
  }

  // Handle Edit Submit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    showNotice(`Inspeção ${execution.code} atualizada com sucesso!`)
    setIsEditSheetOpen(false)
  }

  // Handle Live Re-evaluation
  const handleSaveReevaluation = () => {
    setExecution((prev) => ({
      ...prev,
      result: managerResult
    }))
    showNotice(`Parecer do gestor salvo! Status da inspeção reavaliado para "${managerResult}".`)
  }

  // Handle Print Action
  const handleTriggerPrint = () => {
    setIsPrintModalOpen(true)
  }

  const handleExecuteBrowserPrint = () => {
    window.print()
  }

  const handleGenerateOsFromOcc = (occDescription: string) => {
    showNotice(`Ordem de Serviço gerada com sucesso para a ocorrência: "${occDescription}"!`)
  }

  const timelineEvents: TimelineEvent[] = auditLogs.map((log) => ({
    id: log.id,
    date: log.date,
    title: `${log.action} — ${log.user}`,
    description: `${log.detail} (${log.device})`,
    icon: <History className="h-4 w-4" />,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600"
  }))

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-12">
        {/* CABEÇALHO DA PÁGINA COM AÇÕES */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/40 pb-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/maintenance/checklist")}
              className="text-xs text-muted-foreground hover:text-foreground gap-1 -ml-2 h-7"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Voltar para Execuções de Checklist
            </Button>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {execution.modelName}
              </h1>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono font-bold">
                {execution.code}
              </Badge>
              <ResultBadge result={execution.result} />
            </div>
            <p className="text-xs text-muted-foreground">
              Veículo: <strong className="text-foreground">{execution.vehicleModel} ({execution.plate})</strong> • Motorista: <strong>{execution.driverName}</strong> • Data: <strong>{execution.date} às {execution.time}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditSheetOpen(true)}
              className="text-xs gap-1.5 h-9 shrink-0 whitespace-nowrap border-primary/30 text-primary hover:bg-primary/10 font-semibold"
            >
              <Edit className="h-3.5 w-3.5" /> Editar Inspeção
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerPrint}
              className="text-xs gap-1.5 h-9 shrink-0 whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5" /> Imprimir Relatório
            </Button>

            <Button
              size="sm"
              onClick={() => showNotice(`Relatório PDF completo da inspeção ${execution.code} gerado!`)}
              className="text-xs gap-1.5 h-9 bg-primary text-primary-foreground font-semibold shrink-0 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" /> Gerar PDF
            </Button>
          </div>
        </div>

        {/* NOTIFICATION NOTICE */}
        <AnimatePresence>
          {noticeMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {noticeMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CARDS SUPERIORES DE RESUMO DA EXECUÇÃO (6 METRICS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Tempo de Inspeção</span>
            <div className="font-bold text-xs text-foreground font-mono">{execution.durationMinutes} minutos</div>
            <span className="text-[10px] text-emerald-600 font-bold">Média de 14 min</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Itens Avaliados</span>
            <div className="font-bold text-xs text-foreground font-mono">{execution.evaluatedCount} Itens</div>
            <span className="text-[10px] text-muted-foreground">100% Concluído</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Conformes</span>
            <div className="font-bold text-xs text-emerald-600 font-mono">{execution.compliantCount} Conformes</div>
            <span className="text-[10px] text-muted-foreground">Sem ressalvas</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Não Conformes</span>
            <div className={cn("font-bold text-xs font-mono", execution.nonCompliantCount > 0 ? "text-rose-600" : "text-emerald-600")}>
              {execution.nonCompliantCount} Reprovação(ões)
            </div>
            <span className="text-[10px] text-muted-foreground">Identificados</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Fotos Anexadas</span>
            <div className="font-bold text-xs text-foreground font-mono">{execution.photosCount} Fotos</div>
            <span className="text-[10px] text-blue-600 font-bold">Galeria Ativa</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">OS Geradas</span>
            <div className="font-bold text-xs text-purple-600 font-mono">
              {execution.osGenerated ? execution.osNumber || "1 OS Criada" : "Nenhuma OS"}
            </div>
            <span className="text-[10px] text-muted-foreground">Automação</span>
          </div>
        </div>

        {/* ESTRUTURA DE 7 ABAS DETALHADAS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b pb-2">
            <TabsList className="bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="resumo" className="text-xs font-bold">Resumo</TabsTrigger>
              <TabsTrigger value="itens" className="text-xs font-bold">Itens ({evaluatedItems.length})</TabsTrigger>
              <TabsTrigger value="ocorrencias" className="text-xs font-bold text-rose-600">Ocorrências ({occurrences.length})</TabsTrigger>
              <TabsTrigger value="os" className="text-xs font-bold">Ordens de Serviço ({workOrders.length})</TabsTrigger>
              <TabsTrigger value="fotos" className="text-xs font-bold">Fotos ({photos.length})</TabsTrigger>
              <TabsTrigger value="historico" className="text-xs font-bold">Histórico</TabsTrigger>
              <TabsTrigger value="auditoria" className="text-xs font-bold">Auditoria</TabsTrigger>
            </TabsList>
          </div>

          {/* ABA 1: RESUMO */}
          <TabsContent value="resumo" className="pt-3 space-y-4">
            {/* CARD DE PARECER & REAVALIAÇÃO OPERACIONAL DA GESTÃO (QUANDO APRESENTAR RESSALVAS OU REPROVAÇÃO) */}
            {(execution.result === "Aprovado com Ressalvas" || execution.result === "Reprovado") && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        Painel de Ressalvas & Reavaliação Operacional
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Esta inspeção possui ressalvas técnicas ou não conformidades pendentes de parecer da engenharia.
                      </p>
                    </div>
                  </div>
                  <ResultBadge result={execution.result} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold text-foreground">Parecer Técnico / Observações da Gestão de Frota</Label>
                    <Textarea
                      value={reevaluationNotes}
                      onChange={(e) => setReevaluationNotes(e.target.value)}
                      className="text-xs min-h-[70px] bg-background"
                      placeholder="Descreva as justificativas técnicas para aprovação com ressalvas ou ações corretivas autorizadas..."
                    />
                  </div>

                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <Label className="text-xs font-bold text-foreground">Reavaliar Status da Inspeção</Label>
                      <select
                        value={managerResult}
                        onChange={(e) => setManagerResult(e.target.value as ChecklistResult)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1 font-semibold"
                      >
                        <option value="Aprovado com Ressalvas">Aprovado com Ressalvas (Manter Liberação)</option>
                        <option value="Aprovado">Aprovado (Sanar Ressalva)</option>
                        <option value="Reprovado">Reprovado (Imobilizar Veículo)</option>
                      </select>
                    </div>

                    <Button
                      onClick={handleSaveReevaluation}
                      className="w-full text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" /> Salvar Parecer & Reavaliação
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 bg-card border rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2">
                    Informações Gerais da Inspeção
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Modelo:</span> <strong className="text-foreground">{execution.modelName}</strong></div>
                    <div><span className="text-muted-foreground">Código:</span> <span className="font-mono font-bold text-primary">{execution.code}</span></div>
                    <div><span className="text-muted-foreground">Veículo:</span> <strong className="text-foreground">{execution.vehicleModel} ({execution.plate})</strong></div>
                    <div><span className="text-muted-foreground">Motorista:</span> <strong className="text-foreground">{execution.driverName}</strong></div>
                    <div><span className="text-muted-foreground">Unidade:</span> <strong>{execution.unit}</strong></div>
                    <div><span className="text-muted-foreground">Data/Hora:</span> <span className="font-mono">{execution.date} às {execution.time}</span></div>
                  </div>
                </div>

                <div className="p-4 bg-card border rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2">
                    Observações do Inspetor / Condutor
                  </h3>
                  <p className="text-xs text-foreground leading-relaxed">
                    {execution.observerNotes || "Nenhuma observação adicional informada pelo condutor."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-card border rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2">
                    Localização & Assinatura Digital
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span>{execution.location}</span>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      GPS: {execution.gpsCoordinates}
                    </div>

                    <div className="pt-2 border-t space-y-1">
                      <span className="text-[11px] font-bold text-muted-foreground block">Assinatura do Condutor:</span>
                      <div className="h-16 w-full rounded-lg bg-muted/40 border border-dashed flex items-center justify-center text-xs text-muted-foreground font-mono">
                        [ Assinatura Digital Validada - João Silva ]
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA 2: ITENS AVALIADOS */}
          <TabsContent value="itens" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-foreground">Lista Completa de Itens Avaliados</h3>
                <span className="text-xs text-muted-foreground font-mono">{evaluatedItems.length} Itens Verificados</span>
              </div>

              <div className="space-y-2">
                {evaluatedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40 text-xs">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[9px] font-mono uppercase shrink-0">{item.category}</Badge>
                      <div>
                        <div className="font-bold text-foreground">{item.itemDescription}</div>
                        {item.notes && <div className="text-[11px] text-rose-600 font-semibold mt-0.5">{item.notes}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.result === "Conforme" ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">Conforme</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-bold">Não Conforme</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ABA 3: OCORRÊNCIAS (ITENS REPROVADOS) */}
          <TabsContent value="ocorrencias" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="text-sm font-bold text-rose-600">Não Conformidades & Ocorrências Identificadas</h3>
                  <p className="text-xs text-muted-foreground">Itens reprovados durante a vistoria com opção de geração manual ou automática de OS</p>
                </div>
                <span className="text-xs text-rose-600 font-mono font-bold">{occurrences.length} Ocorrência(s)</span>
              </div>

              <div className="space-y-3">
                {occurrences.map((occ) => (
                  <div key={occ.id} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span className="font-bold text-xs text-foreground">{occ.itemDescription}</span>
                      </div>
                      <Badge variant="outline" className="bg-rose-500/20 text-rose-600 border-rose-500/40 text-[10px] font-bold uppercase">
                        Prioridade {occ.priority}
                      </Badge>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed">{occ.notes}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-rose-500/20 text-xs">
                      <span className="text-muted-foreground font-mono">Status: <strong className="text-purple-600">{occ.status}</strong> ({occ.osNumber})</span>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateOsFromOcc(occ.itemDescription)}
                        className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                      >
                        <Wrench className="h-3.5 w-3.5" /> Gerar Ordem de Serviço
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ABA 4: ORDENS DE SERVIÇO */}
          <TabsContent value="os" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Ordens de Serviço Originadas deste Checklist</h3>
                  <p className="text-xs text-muted-foreground">Toda a manutenção corretiva é realizada e controlada no módulo de Ordens de Serviço</p>
                </div>
              </div>

              <div className="space-y-2">
                {workOrders.map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-primary text-xs">{wo.osNumber}</span>
                      <div>
                        <div className="font-semibold text-foreground">{wo.workshop}</div>
                        <div className="text-[11px] text-muted-foreground">{wo.date} • Resp: {wo.responsible}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-foreground">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(wo.value)}
                      </span>

                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                        {wo.status}
                      </Badge>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(wo.osUrl)}
                        className="h-7 text-xs text-primary gap-1"
                      >
                        Abrir OS <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ABA 5: FOTOS */}
          <TabsContent value="fotos" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-foreground">Galeria de Fotos da Inspeção</h3>
                <span className="text-xs text-muted-foreground font-mono">{photos.length} Fotos Registradas</span>
              </div>

              <GalleryGrid photos={photos} />
            </div>
          </TabsContent>

          {/* ABA 6: HISTÓRICO */}
          <TabsContent value="historico" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b pb-2">Histórico de Eventos do Checklist</h3>
              <Timeline events={timelineEvents} />
            </div>
          </TabsContent>

          {/* ABA 7: AUDITORIA */}
          <TabsContent value="auditoria" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b pb-2">Trilha de Auditoria & Dispositivo</h3>
              <Timeline events={timelineEvents} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* SHEET LATERAL DE EDIÇÃO DA INSPEÇÃO (EDITAR TOTALMENTE IMPLEMENTADO) */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-[600px] w-full overflow-y-auto custom-scrollbar p-6 space-y-5">
          <SheetHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-foreground">
                  Editar Inspeção {execution.code}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Atualize observações, motorista ou reavalie itens da vistoria.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <Label className="text-xs">Motorista Responsável</Label>
              <Input
                value={execution.driverName}
                onChange={(e) => setExecution({ ...execution, driverName: e.target.value })}
                className="text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Veículo Modelo</Label>
                <Input
                  value={execution.vehicleModel}
                  onChange={(e) => setExecution({ ...execution, vehicleModel: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Placa</Label>
                <Input
                  value={execution.plate}
                  onChange={(e) => setExecution({ ...execution, plate: e.target.value })}
                  className="text-xs mt-1 font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Resultado da Inspeção</Label>
              <select
                value={execution.result}
                onChange={(e) => setExecution({ ...execution, result: e.target.value as ChecklistResult })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1 font-semibold"
              >
                <option value="Aprovado">Aprovado</option>
                <option value="Aprovado com Ressalvas">Aprovado com Ressalvas</option>
                <option value="Reprovado">Reprovado</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">Observações do Inspetor</Label>
              <Textarea
                value={execution.observerNotes}
                onChange={(e) => setExecution({ ...execution, observerNotes: e.target.value })}
                className="text-xs min-h-[90px] mt-1"
              />
            </div>

            <SheetFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditSheetOpen(false)} className="text-xs h-9">
                Cancelar
              </Button>
              <Button type="submit" className="text-xs h-9 bg-primary text-primary-foreground font-semibold">
                Salvar Alterações
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* MODAL DE IMPRESSÃO PROFISSIONAL (IMPRIMIR TOTALMENTE IMPLEMENTADO) */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsPrintModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 relative text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header for Print View */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    F1
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-foreground tracking-tight">ERP FrotaOne — Relatório de Inspeção</h2>
                    <p className="text-xs text-muted-foreground">Documento Oficial de Vistoria Operacional da Frota</p>
                  </div>
                </div>

                <Button size="sm" variant="ghost" onClick={() => setIsPrintModalOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Printable Body */}
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  <div><strong>Código:</strong> {execution.code}</div>
                  <div><strong>Data:</strong> {execution.date} {execution.time}</div>
                  <div><strong>Veículo:</strong> {execution.plate}</div>
                  <div><strong>Status:</strong> {execution.result}</div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-foreground uppercase border-b pb-1 mb-2">Dados da Operação</h4>
                  <p><strong>Motorista:</strong> {execution.driverName}</p>
                  <p><strong>Unidade Operacional:</strong> {execution.unit}</p>
                  <p><strong>Local:</strong> {execution.location} ({execution.gpsCoordinates})</p>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-foreground uppercase border-b pb-1 mb-2">Resumo dos Itens Verificados ({evaluatedItems.length})</h4>
                  <div className="space-y-1">
                    {evaluatedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded text-[11px]">
                        <span>{item.itemDescription} ({item.category})</span>
                        <span className={item.result === "Conforme" ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>{item.result}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {execution.observerNotes && (
                  <div>
                    <h4 className="font-bold text-xs text-foreground uppercase border-b pb-1 mb-1">Observações</h4>
                    <p className="p-2 bg-muted/20 border rounded italic">{execution.observerNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons inside Print Modal */}
              <div className="flex items-center justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => setIsPrintModalOpen(false)} className="text-xs">
                  Fechar
                </Button>
                <Button size="sm" onClick={handleExecuteBrowserPrint} className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold">
                  <Printer className="h-3.5 w-3.5" /> Imprimir Agora
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
