"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusPill } from "@/components/ui/status-pill"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { Stepper, StepperStep } from "@/components/ui/stepper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline } from "@/components/ui/timeline"
import { WorkOrderFormSheet } from "@/components/work-orders/WorkOrderFormSheet"
import { workOrderService, WorkOrder } from "@/services/work-order.service"
import { cn } from "@/utils/utils"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts"
import {
  Edit, Printer, FileDown, MoreHorizontal, Truck, User, Building2, Wrench,
  Clock, DollarSign, ArrowLeft, CheckCircle, Package, FileText, ClipboardCheck,
  History, Shield, AlertTriangle
} from "lucide-react"

import { toast } from "sonner"

const OS_STEPS: StepperStep[] = [
  { label: "Aberta" },
  { label: "Ag. Aprovação" },
  { label: "Ag. Peças" },
  { label: "Em Execução" },
  { label: "Concluída" },
]

const STATUS_TO_STEP: Record<string, number> = {
  "Aberta": 0,
  "Aguardando Aprovação": 1,
  "Aguardando Peças": 2,
  "Em Execução": 3,
  "Pausada": 3,
  "Concluída": 4,
  "Cancelada": 4,
}

const ALL_STATUSES = ["Aberta", "Aguardando Aprovação", "Aguardando Peças", "Em Execução", "Pausada", "Concluída", "Cancelada"]

function getStatusVariant(status: string): any {
  const map: Record<string, string> = {
    "Em Execução": "success",
    "Concluída": "success",
    "Aberta": "default",
    "Aguardando Aprovação": "warning",
    "Aguardando Peças": "warning",
    "Pausada": "default",
    "Cancelada": "destructive",
  }
  return map[status] || "default"
}

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0)
}

function fmtDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("pt-BR")
}

function fmtDatetime(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

interface SummaryCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  iconBg?: string
}

function SummaryCard({ icon, label, value, sub, iconBg = "bg-blue-100 dark:bg-blue-900/40" }: SummaryCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-600 dark:text-blue-400", iconBg)}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold text-foreground leading-tight truncate">{value}</span>
        {sub && <span className="text-[10px] text-muted-foreground mt-0.5">{sub}</span>}
      </div>
    </div>
  )
}

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [wo, setWo] = useState<WorkOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState("resumo")

  const fetchWo = async () => {
    setIsLoading(true)
    try {
      const data = await workOrderService.getById(id)
      setWo(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchWo() }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!wo) return
    setIsChangingStatus(true)
    try {
      await workOrderService.updateStatus(wo.id, newStatus as any, "Gestor")
      toast.success(`Status alterado para "${newStatus}"`)
      fetchWo()
    } catch {
      toast.error("Erro ao alterar status")
    } finally {
      setIsChangingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    )
  }

  if (!wo) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Ordem de Serviço não encontrada.</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </AppLayout>
    )
  }

  const currentStep = STATUS_TO_STEP[wo.status] ?? 0
  const openedDate = wo.opened_at ? new Date(wo.opened_at) : new Date()
  const daysOpen = Math.floor((new Date().getTime() - openedDate.getTime()) / (1000 * 3600 * 24))

  const costData = [
    { name: "Peças", value: wo.cost_parts || 0 },
    { name: "Mão de Obra", value: wo.cost_labor || 0 },
    { name: "Guincho", value: wo.cost_towing || 0 },
    { name: "Outros", value: wo.cost_others || 0 },
  ].filter(d => d.value > 0)

  const COST_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"]

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">

        {/* ── Page Header ── */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Manutenção" },
            { label: "Ordens de Serviço", href: "/manutencao/ordens-servico" },
            { label: `OS #${String(wo.number).padStart(6, "0")}` },
          ]}
          title={`OS #${String(wo.number).padStart(6, "0")}`}
          description={
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">{wo.type}</Badge>
              <StatusPill status={getStatusVariant(wo.status)} label={wo.status} className="text-xs" />
              <PriorityBadge priority={wo.priority as any} />
            </div>
          }
          actions={
            <>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.back()}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Voltar
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Printer className="h-3.5 w-3.5 mr-1" /> Imprimir
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <FileDown className="h-3.5 w-3.5 mr-1" /> PDF
              </Button>
              {/* Status change dropdown */}
              <div className="relative group">
                <Button variant="secondary" size="sm" className="h-8 text-xs" disabled={isChangingStatus}>
                  Alterar Status ▾
                </Button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg z-50 hidden group-hover:block">
                  {ALL_STATUSES.filter(s => s !== wo.status).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-semibold"
                size="sm"
                onClick={() => setIsFormOpen(true)}
              >
                <Edit className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
            </>
          }
        />

        {/* ── Stepper ── */}
        <Card className={cn("border-muted-foreground/10 shadow-sm", wo.status === "Cancelada" && "opacity-60")}>
          <CardContent className="p-4">
            {wo.status === "Cancelada" ? (
              <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Esta Ordem de Serviço foi cancelada.
              </div>
            ) : (
              <Stepper steps={OS_STEPS} currentStep={currentStep} />
            )}
          </CardContent>
        </Card>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-2">
          <SummaryCard
            icon={<Truck className="h-4 w-4" />}
            label="Veículo"
            value={wo.vehicle_plate || "—"}
            sub={`${wo.vehicle_brand || ""} ${wo.vehicle_model || ""} ${wo.vehicle_year || ""}`.trim() || undefined}
          />
          <SummaryCard
            icon={<User className="h-4 w-4" />}
            label="Motorista"
            value={wo.driver_name || "Não vinculado"}
            iconBg="bg-green-100 dark:bg-green-900/40"
          />
          <SummaryCard
            icon={<Building2 className="h-4 w-4" />}
            label="Oficina"
            value={wo.workshop_name || "—"}
            sub={wo.workshop_type}
            iconBg="bg-purple-100 dark:bg-purple-900/40"
          />
          <SummaryCard
            icon={<Wrench className="h-4 w-4" />}
            label="Responsável"
            value={wo.responsible || "—"}
            iconBg="bg-orange-100 dark:bg-orange-900/40"
          />
          <SummaryCard
            icon={<Clock className="h-4 w-4" />}
            label="Tempo Parado"
            value={`${daysOpen} dia(s)`}
            sub={`Desde ${fmtDate(wo.opened_at)}`}
            iconBg="bg-red-100 dark:bg-red-900/40"
          />
          <SummaryCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Valor Total"
            value={fmtCurrency(wo.cost_total)}
            sub="Peças + M.O. + Outros"
            iconBg="bg-blue-100 dark:bg-blue-900/40"
          />
          <SummaryCard
            icon={<CheckCircle className="h-4 w-4" />}
            label="Previsão"
            value={fmtDate(wo.estimated_at)}
            iconBg="bg-teal-100 dark:bg-teal-900/40"
          />
          <SummaryCard
            icon={<FileText className="h-4 w-4" />}
            label="Origem"
            value={wo.origin || "Manual"}
            sub={`KM: ${wo.km_opening?.toLocaleString("pt-BR") || "—"}`}
            iconBg="bg-slate-100 dark:bg-slate-800"
          />
        </div>

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9 flex-wrap">
            <TabsTrigger value="resumo" className="text-xs">Resumo</TabsTrigger>
            <TabsTrigger value="servicos" className="text-xs">Serviços</TabsTrigger>
            <TabsTrigger value="pecas" className="text-xs">Peças</TabsTrigger>
            <TabsTrigger value="custos" className="text-xs">Custos</TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs">Documentos</TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs">Checklist</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs">Histórico</TabsTrigger>
            <TabsTrigger value="auditoria" className="text-xs">Auditoria</TabsTrigger>
          </TabsList>

          {/* ── ABA: RESUMO ── */}
          <TabsContent value="resumo" className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-muted-foreground/10 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold">Descrição da Manutenção</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Problema Relatado</p>
                    <p className="text-sm text-foreground">{wo.description || "—"}</p>
                  </div>
                  {wo.diagnosis && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Diagnóstico</p>
                      <p className="text-sm text-foreground">{wo.diagnosis}</p>
                    </div>
                  )}
                  {wo.notes && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Observações</p>
                      <p className="text-sm text-muted-foreground">{wo.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-muted-foreground/10 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold">Informações da OS</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <dl className="space-y-2">
                    {[
                      ["Data de Abertura", fmtDate(wo.opened_at)],
                      ["Previsão de Conclusão", fmtDate(wo.estimated_at)],
                      ["Data de Conclusão", fmtDate(wo.closed_at)],
                      ["KM na Abertura", wo.km_opening ? wo.km_opening.toLocaleString("pt-BR") + " km" : "—"],
                      ["KM no Encerramento", wo.km_closing ? wo.km_closing.toLocaleString("pt-BR") + " km" : "—"],
                      ["Unidade", wo.unit || "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── ABA: SERVIÇOS ── */}
          <TabsContent value="servicos" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Serviços Executados</CardTitle>
                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">+ Adicionar</Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {wo.services && wo.services.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-muted-foreground">Descrição</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Qtd</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Horas</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Valor Unit.</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Total</th>
                        <th className="text-left py-2 font-semibold text-muted-foreground pl-3">Responsável</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wo.services.map(s => (
                        <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2">{s.description}</td>
                          <td className="py-2 text-right">{s.quantity}</td>
                          <td className="py-2 text-right">{s.unit_time_hours ? `${s.unit_time_hours}h` : "—"}</td>
                          <td className="py-2 text-right">{fmtCurrency(s.unit_price)}</td>
                          <td className="py-2 text-right font-semibold">{fmtCurrency(s.total_price)}</td>
                          <td className="py-2 pl-3 text-muted-foreground">{s.responsible || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Wrench className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">Nenhum serviço registrado</p>
                    <p className="text-xs mt-1">Adicione os serviços executados nesta OS.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ABA: PEÇAS ── */}
          <TabsContent value="pecas" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Peças Utilizadas</CardTitle>
                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">+ Adicionar</Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {wo.parts && wo.parts.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-muted-foreground">Peça</th>
                        <th className="text-left py-2 font-semibold text-muted-foreground">Código</th>
                        <th className="text-left py-2 font-semibold text-muted-foreground">Fornecedor</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Qtd</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Valor Unit.</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Total</th>
                        <th className="text-left py-2 font-semibold text-muted-foreground pl-3">Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wo.parts.map(p => (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 font-medium">{p.name}</td>
                          <td className="py-2 font-mono text-muted-foreground">{p.part_code || "—"}</td>
                          <td className="py-2 text-muted-foreground">{p.supplier || "—"}</td>
                          <td className="py-2 text-right">{p.quantity}</td>
                          <td className="py-2 text-right">{fmtCurrency(p.unit_price)}</td>
                          <td className="py-2 text-right font-semibold">{fmtCurrency(p.total_price)}</td>
                          <td className="py-2 pl-3">
                            <Badge variant="outline" className="text-[9px]">{p.situation}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Package className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">Nenhuma peça registrada</p>
                    <p className="text-xs mt-1">Preparado para integração com módulo de Estoque.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ABA: CUSTOS ── */}
          <TabsContent value="custos" className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Peças", value: wo.cost_parts, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                  { label: "Mão de Obra", value: wo.cost_labor, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
                  { label: "Guincho / Transporte", value: wo.cost_towing, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
                  { label: "Outros", value: wo.cost_others, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
                ].map(({ label, value, color, bg }) => (
                  <Card key={label} className={cn("border-0 shadow-sm", bg)}>
                    <CardContent className="p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">{label}</p>
                      <p className={cn("text-lg font-bold", color)}>{fmtCurrency(value || 0)}</p>
                    </CardContent>
                  </Card>
                ))}
                <Card className="col-span-2 border-blue-200 dark:border-blue-800 shadow-sm bg-blue-600 dark:bg-blue-700">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-semibold text-blue-200 uppercase mb-1">Total Geral</p>
                    <p className="text-2xl font-bold text-white">{fmtCurrency(wo.cost_total)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-muted-foreground/10 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold">Composição dos Custos</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {costData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={costData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {costData.map((_, i) => <Cell key={i} fill={COST_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => [fmtCurrency(v), ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                      Sem custos registrados
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── ABA: DOCUMENTOS ── */}
          <TabsContent value="documentos" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Documentos e Anexos</CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs">Fazer Upload</Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center text-muted-foreground">
                  <FileText className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">Arraste arquivos aqui</p>
                  <p className="text-xs mt-1">Fotos, orçamentos, NFs, relatórios, garantias</p>
                  <Button size="sm" variant="secondary" className="mt-4 h-7 text-xs">Selecionar arquivo</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ABA: CHECKLIST ── */}
          <TabsContent value="checklist" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardContent className="p-10 flex flex-col items-center text-muted-foreground">
                <ClipboardCheck className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">Nenhum checklist vinculado</p>
                <p className="text-xs mt-1">Esta OS não foi originada a partir de um checklist de inspeção.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ABA: HISTÓRICO ── */}
          <TabsContent value="historico" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Linha do Tempo</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {wo.history && wo.history.length > 0 ? (
                  <Timeline
                    events={wo.history.map((h) => ({
                      id: h.id,
                      title: h.description,
                      date: `${h.user_name || "Sistema"} · ${fmtDatetime(h.created_at)}`,
                      icon: h.event_type === "status_change" ? <CheckCircle className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />,
                      iconBg: h.event_type === "status_change" ? "bg-green-100 dark:bg-green-900/40" : undefined,
                      iconColor: h.event_type === "status_change" ? "text-green-600 dark:text-green-400" : undefined
                    }))}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <History className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">Nenhum histórico registrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ABA: AUDITORIA ── */}
          <TabsContent value="auditoria" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Trilha de Auditoria</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {wo.history && wo.history.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-muted-foreground">Evento</th>
                        <th className="text-left py-2 font-semibold text-muted-foreground">Usuário</th>
                        <th className="text-left py-2 font-semibold text-muted-foreground">Valor Anterior</th>
                        <th className="text-left py-2 font-semibold text-muted-foreground">Novo Valor</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wo.history.map(h => (
                        <tr key={h.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 font-medium">{h.description}</td>
                          <td className="py-2 text-muted-foreground">{h.user_name || "Sistema"}</td>
                          <td className="py-2 text-muted-foreground">{h.old_value || "—"}</td>
                          <td className="py-2 text-foreground">{h.new_value || "—"}</td>
                          <td className="py-2 text-right text-muted-foreground">{fmtDatetime(h.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Shield className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">Nenhum registro de auditoria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <WorkOrderFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchWo}
        editData={wo}
      />
    </AppLayout>
  )
}
