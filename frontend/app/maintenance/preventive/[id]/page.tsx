"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wrench,
  ChevronLeft,
  Edit,
  Play,
  PauseCircle,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  Truck,
  Shield,
  History,
  Download,
  ExternalLink,
  Layers,
  Calendar,
  FileBadge,
  User,
  DollarSign
} from "lucide-react"

import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Timeline, TimelineEvent } from "@/components/ui/timeline"
import { cn } from "@/utils/utils"

import { PreventiveService } from "@/services/preventive.service"
import { PreventivePlanItem } from "@/types/preventive"

export default function PlanDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const planId = (params.id as string) || "pln-001"

  const [noticeMessage, setNoticeMessage] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("visao_geral")

  // Fetch plan data and related lists
  const plan = PreventiveService.getPlanById(planId) || PreventiveService.getPlans()[0]

  if (!plan) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
          <Wrench className="h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="text-base font-bold text-foreground">Plano Preventivo Não Encontrado</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            O plano solicitado não existe ou foi removido do sistema.
          </p>
          <Button size="sm" onClick={() => router.push("/maintenance/preventive")}>
            Voltar para Lista de Planos
          </Button>
        </div>
      </AppLayout>
    )
  }

  const executions = PreventiveService.getPlanExecutions(plan.id)
  const workOrders = PreventiveService.getPlanWorkOrders(plan.id)
  const documents = PreventiveService.getPlanDocuments(plan.id)
  const auditLogs = PreventiveService.getPlanAuditLogs(plan.id)

  const showNotice = (msg: string) => {
    setNoticeMessage(msg)
    setTimeout(() => setNoticeMessage(null), 4000)
  }

  const handleExecuteNow = () => {
    showNotice(`Ordem de Serviço preventiva gerada com sucesso para o plano "${plan.name}"!`)
  }

  const handleToggleSuspend = () => {
    showNotice(`Status do plano alterado para ${plan.status === "Suspenso" ? "Ativo" : "Suspenso"}.`)
  }

  const timelineEvents: TimelineEvent[] = auditLogs.map((log) => ({
    id: log.id,
    date: log.date,
    title: `${log.action} — ${log.user}`,
    description: log.detail,
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
              onClick={() => router.push("/maintenance/preventive")}
              className="text-xs text-muted-foreground hover:text-foreground gap-1 -ml-2 h-7"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Voltar para Planos Preventivos
            </Button>

            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {plan.name}
              </h1>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono font-bold">
                {plan.code}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-bold",
                  plan.status === "Ativo" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                )}
              >
                {plan.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Veículo: <strong className="text-foreground">{plan.vehicleModel} ({plan.plate})</strong> • Unidade: <strong>{plan.unit}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => showNotice("Modo de edição do plano preventivo ativado...")}
              className="text-xs gap-1.5 h-9 shrink-0 whitespace-nowrap"
            >
              <Edit className="h-3.5 w-3.5" /> Editar
            </Button>

            <Button
              size="sm"
              onClick={handleExecuteNow}
              className="text-xs gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shrink-0 whitespace-nowrap"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Executar Agora (Gerar OS)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSuspend}
              className="text-xs gap-1.5 h-9 shrink-0 whitespace-nowrap text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
            >
              <PauseCircle className="h-3.5 w-3.5" /> {plan.status === "Suspenso" ? "Reativar" : "Suspender"}
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

        {/* CARDS SUPERIORES DE RESUMO DO PLANO (7 METRICS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Veículo</span>
            <div className="font-bold text-xs text-foreground truncate">{plan.vehicleModel}</div>
            <span className="text-[10px] font-mono text-muted-foreground">{plan.plate}</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Unidade</span>
            <div className="font-bold text-xs text-foreground truncate">{plan.unit}</div>
            <span className="text-[10px] text-muted-foreground">Operacional</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Critério</span>
            <div className="font-bold text-xs text-foreground truncate">{plan.triggerLabel}</div>
            <span className="text-[10px] text-muted-foreground">Regra Automática</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Última Execução</span>
            <div className="font-bold text-xs text-foreground font-mono">{plan.lastExecutionDate}</div>
            <span className="text-[10px] text-emerald-600 font-bold">Concluída</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Próxima Execução</span>
            <div className="font-bold text-xs text-foreground font-mono">{plan.nextExecutionDate}</div>
            <span className="text-[10px] text-muted-foreground font-mono">{plan.nextExecutionKm?.toLocaleString("pt-BR")} KM</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">OS Geradas</span>
            <div className="font-bold text-xs text-foreground font-mono">{plan.osGeneratedCount} OS</div>
            <span className="text-[10px] text-blue-600 font-bold">Automação IA</span>
          </div>

          <div className="p-3 bg-card border rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground font-semibold">Cumprimento</span>
            <div className="font-bold text-xs text-emerald-600 font-mono">{plan.compliancePercent}%</div>
            <span className="text-[10px] text-muted-foreground">No Prazo</span>
          </div>
        </div>

        {/* ESTRUTURA DE 6 ABAS DETALHADAS DO PLANO */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b pb-2">
            <TabsList className="bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="visao_geral" className="text-xs font-bold">Visão Geral</TabsTrigger>
              <TabsTrigger value="cronograma" className="text-xs font-bold">Cronograma</TabsTrigger>
              <TabsTrigger value="os" className="text-xs font-bold">Ordens de Serviço ({workOrders.length})</TabsTrigger>
              <TabsTrigger value="historico" className="text-xs font-bold">Histórico</TabsTrigger>
              <TabsTrigger value="documentos" className="text-xs font-bold">Documentos ({documents.length})</TabsTrigger>
              <TabsTrigger value="auditoria" className="text-xs font-bold">Auditoria</TabsTrigger>
            </TabsList>
          </div>

          {/* ABA 1: VISÃO GERAL */}
          <TabsContent value="visao_geral" className="pt-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 bg-card border rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2">
                    Descrição & Objetivo Técnico
                  </h3>
                  <p className="text-xs text-foreground leading-relaxed">
                    {plan.description}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    <strong>Objetivo Estratégico:</strong> {plan.objective}
                  </p>
                </div>

                <div className="p-4 bg-card border rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2">
                    Serviços Planejados na Ordem de Serviço
                  </h3>
                  <div className="space-y-2">
                    {plan.plannedServices.map((svc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/20 border">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-foreground">{svc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-card border rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2">
                    Parâmetros de Automação
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Critério:</span>
                      <span className="font-bold text-foreground">{plan.triggerLabel}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Tolerância KM:</span>
                      <span className="font-mono text-foreground">±{plan.toleranceKm || 500} KM</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Tolerância Dias:</span>
                      <span className="font-mono text-foreground">±{plan.toleranceDays || 15} Dias</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Gerar OS Auto:</span>
                      <span className="font-bold text-emerald-600">{plan.autoGenerateOs ? "Sim (Habilitado)" : "Não"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Prioridade OS:</span>
                      <Badge variant="outline" className="text-[10px] font-bold">{plan.osPriority}</Badge>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Oficina Padrão:</span>
                      <span className="font-semibold text-foreground">{plan.defaultWorkshop}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Responsável:</span>
                      <span className="font-semibold text-foreground">{plan.defaultResponsible}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-card border rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2">
                    Componentes Envolvidos
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.components?.map((c, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] font-mono">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA 2: CRONOGRAMA */}
          <TabsContent value="cronograma" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-foreground">Cronograma de Execuções Previstas vs Realizadas</h3>
                <span className="text-xs text-muted-foreground font-mono">{executions.length} Ciclos</span>
              </div>

              <div className="space-y-2">
                {executions.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg shrink-0", ex.status === "Concluído" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">Previsto: {ex.plannedDate} ({ex.plannedKm.toLocaleString("pt-BR")} KM)</div>
                        {ex.executedDate ? (
                          <div className="text-[11px] text-muted-foreground">Executado em: {ex.executedDate} ({ex.executedKm?.toLocaleString("pt-BR")} KM)</div>
                        ) : (
                          <div className="text-[11px] text-amber-600 font-semibold">Aguardando atingimento do critério de disparo</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {ex.osNumber && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/manutencao/ordens-servico/${ex.osNumber}`)}
                          className="h-7 text-xs text-primary gap-1 font-mono font-bold"
                        >
                          {ex.osNumber} <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}

                      <Badge variant="outline" className={ex.status === "Concluído" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]" : "bg-amber-500/10 text-amber-600 text-[10px]"}>
                        {ex.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ABA 3: ORDENS DE SERVIÇO */}
          <TabsContent value="os" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Ordens de Serviço Preventivas Geradas</h3>
                  <p className="text-xs text-muted-foreground">Toda a execução dos serviços ocorre exclusivamente nas Ordens de Serviço</p>
                </div>
              </div>

              <div className="space-y-2">
                {workOrders.map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-primary text-xs">{wo.osNumber}</span>
                      <div>
                        <div className="font-semibold text-foreground">{wo.workshop}</div>
                        <div className="text-[11px] text-muted-foreground">{wo.date}</div>
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

          {/* ABA 4: HISTÓRICO */}
          <TabsContent value="historico" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b pb-2">Histórico de Eventos do Plano</h3>
              <Timeline events={timelineEvents} />
            </div>
          </TabsContent>

          {/* ABA 5: DOCUMENTOS */}
          <TabsContent value="documentos" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-bold text-foreground">Manuais & Documentos Técnicos Anexados</h3>
                <Button size="sm" variant="outline" onClick={() => showNotice("Upload de novo documento técnico acionado...")} className="text-xs gap-1">
                  <FileBadge className="h-3.5 w-3.5" /> Anexar Documento
                </Button>
              </div>

              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40 text-xs">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-bold text-foreground">{doc.title}</div>
                        <div className="text-[11px] text-muted-foreground">{doc.type} • {doc.size} • Enviado em {doc.uploadDate}</div>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => showNotice(`Download de ${doc.title}...`)} className="h-7 text-xs text-primary gap-1">
                      <Download className="h-3.5 w-3.5" /> Baixar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ABA 6: AUDITORIA */}
          <TabsContent value="auditoria" className="pt-3 space-y-3">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b pb-2">Trilha de Auditoria & Logs do Sistema</h3>
              <Timeline events={timelineEvents} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
