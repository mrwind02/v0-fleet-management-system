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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { WorkOrderFormSheet } from "@/components/work-orders/WorkOrderFormSheet"
import { workOrderService, WorkOrder, WorkOrderService, WorkOrderPart, WorkOrderAttachment } from "@/services/work-order.service"
import { cn } from "@/utils/utils"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts"
import {
  Edit, Printer, FileDown, Truck, User, Building2, Wrench,
  Clock, DollarSign, ArrowLeft, CheckCircle, XCircle, Package, FileText, ClipboardCheck,
  History, Shield, AlertTriangle, ChevronDown, Plus, Trash2, ExternalLink, UploadCloud
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

const FIELD_CLASS = "w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
const LABEL_CLASS = "block text-xs font-semibold text-muted-foreground mb-1"

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [wo, setWo] = useState<WorkOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState("resumo")

  // Modals for adding items
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isAddPartOpen, setIsAddPartOpen] = useState(false)
  const [isAddAttachmentOpen, setIsAddAttachmentOpen] = useState(false)
  const [isSubmittingModal, setIsSubmittingModal] = useState(false)

  // Forms states
  const [serviceForm, setServiceForm] = useState({ description: "", quantity: "1", unit_time_hours: "", unit_price: "", responsible: "" })
  const [partForm, setPartForm] = useState({ name: "", part_code: "", supplier: "", quantity: "1", unit_price: "", situation: "Disponível" })
  const [attachmentForm, setAttachmentForm] = useState({ name: "", file_type: "Documento", file_url: "", file_size: "1.2 MB" })

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

  // Handle Services CRUD
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wo || !serviceForm.description) return
    setIsSubmittingModal(true)
    try {
      await workOrderService.addService(wo.id, {
        description: serviceForm.description,
        quantity: parseFloat(serviceForm.quantity) || 1,
        unit_time_hours: serviceForm.unit_time_hours ? parseFloat(serviceForm.unit_time_hours) : undefined,
        unit_price: parseFloat(serviceForm.unit_price) || 0,
        responsible: serviceForm.responsible || undefined,
      })
      toast.success("Serviço adicionado com sucesso!")
      setIsAddServiceOpen(false)
      setServiceForm({ description: "", quantity: "1", unit_time_hours: "", unit_price: "", responsible: "" })
      fetchWo()
    } catch {
      toast.error("Erro ao adicionar serviço")
    } finally {
      setIsSubmittingModal(false)
    }
  }

  const handleRemoveService = async (serviceId: string) => {
    if (!wo) return
    try {
      await workOrderService.removeService(wo.id, serviceId)
      toast.success("Serviço removido!")
      fetchWo()
    } catch {
      toast.error("Erro ao remover serviço")
    }
  }

  // Handle Parts CRUD
  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wo || !partForm.name) return
    setIsSubmittingModal(true)
    try {
      await workOrderService.addPart(wo.id, {
        name: partForm.name,
        part_code: partForm.part_code || undefined,
        supplier: partForm.supplier || undefined,
        quantity: parseFloat(partForm.quantity) || 1,
        unit_price: parseFloat(partForm.unit_price) || 0,
        situation: partForm.situation as any,
      })
      toast.success("Peça adicionada com sucesso!")
      setIsAddPartOpen(false)
      setPartForm({ name: "", part_code: "", supplier: "", quantity: "1", unit_price: "", situation: "Disponível" })
      fetchWo()
    } catch {
      toast.error("Erro ao adicionar peça")
    } finally {
      setIsSubmittingModal(false)
    }
  }

  const handleRemovePart = async (partId: string) => {
    if (!wo) return
    try {
      await workOrderService.removePart(wo.id, partId)
      toast.success("Peça removida!")
      fetchWo()
    } catch {
      toast.error("Erro ao remover peça")
    }
  }

  // Handle Attachments CRUD
  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wo || !attachmentForm.name) return
    setIsSubmittingModal(true)
    try {
      await workOrderService.addAttachment(wo.id, {
        name: attachmentForm.name,
        file_type: attachmentForm.file_type,
        file_url: attachmentForm.file_url || "#",
        file_size: attachmentForm.file_size || "1 MB",
      })
      toast.success("Documento anexado com sucesso!")
      setIsAddAttachmentOpen(false)
      setAttachmentForm({ name: "", file_type: "Documento", file_url: "", file_size: "1.2 MB" })
      fetchWo()
    } catch {
      toast.error("Erro ao anexar documento")
    } finally {
      setIsSubmittingModal(false)
    }
  }

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!wo) return
    try {
      await workOrderService.removeAttachment(wo.id, attachmentId)
      toast.success("Documento removido!")
      fetchWo()
    } catch {
      toast.error("Erro ao remover documento")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    toast.info("Abrindo o gerador de impressão/PDF...")
    window.print()
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
    { name: "Peças", value: Number(wo.cost_parts) || 0 },
    { name: "Mão de Obra", value: Number(wo.cost_labor) || 0 },
    { name: "Guincho", value: Number(wo.cost_towing) || 0 },
    { name: "Outros", value: Number(wo.cost_others) || 0 },
  ].filter(d => d.value > 0)

  const COST_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"]

  return (
    <AppLayout>
      {/* ── Print Layout CSS ── */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          header, sidebar, nav { display: none !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      {/* ── PRINT-ONLY REPORT ── */}
      <div className="print-only p-8 text-black bg-white font-sans max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-start border-b-2 border-black pb-4">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">FrotaOne — Gestão de Frotas</h1>
            <p className="text-sm text-gray-600">Relatório Técnico de Ordem de Serviço</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">OS #{String(wo.number).padStart(6, "0")}</h2>
            <p className="text-xs text-gray-500">Emissão: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        {/* Resumo da OS */}
        <div className="grid grid-cols-3 gap-4 border p-4 rounded-lg bg-gray-50 text-xs">
          <div>
            <p className="font-semibold text-gray-500 uppercase">Veículo</p>
            <p className="font-bold text-sm">{wo.vehicle_plate || "—"}</p>
            <p>{wo.vehicle_brand} {wo.vehicle_model} ({wo.vehicle_year || "—"})</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 uppercase">Status & Tipo</p>
            <p className="font-bold">{wo.status} — {wo.type}</p>
            <p>Prioridade: {wo.priority}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 uppercase">Datas & KM</p>
            <p>Abertura: {fmtDate(wo.opened_at)}</p>
            <p>Previsão: {fmtDate(wo.estimated_at)}</p>
            <p>KM Inicial: {wo.km_opening ? wo.km_opening.toLocaleString("pt-BR") + " km" : "—"}</p>
          </div>
        </div>

        {/* Problema / Diagnóstico */}
        <div className="border p-4 rounded-lg text-xs space-y-2">
          <div>
            <h3 className="font-bold text-sm text-gray-700">Descrição do Problema</h3>
            <p>{wo.description || "Sem descrição"}</p>
          </div>
          {wo.diagnosis && (
            <div>
              <h3 className="font-bold text-sm text-gray-700">Diagnóstico Técnico</h3>
              <p>{wo.diagnosis}</p>
            </div>
          )}
        </div>

        {/* Serviços */}
        <div>
          <h3 className="font-bold text-sm mb-2 uppercase border-b pb-1">Serviços Executados</h3>
          {wo.services && wo.services.length > 0 ? (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-1.5">Descrição</th>
                  <th className="text-right p-1.5">Qtd</th>
                  <th className="text-right p-1.5">Horas</th>
                  <th className="text-right p-1.5">Valor Unit.</th>
                  <th className="text-right p-1.5">Total</th>
                </tr>
              </thead>
              <tbody>
                {wo.services.map(s => (
                  <tr key={s.id} className="border-b">
                    <td className="p-1.5">{s.description}</td>
                    <td className="text-right p-1.5">{s.quantity}</td>
                    <td className="text-right p-1.5">{s.unit_time_hours || "—"}</td>
                    <td className="text-right p-1.5">{fmtCurrency(s.unit_price)}</td>
                    <td className="text-right p-1.5 font-bold">{fmtCurrency(s.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-xs text-gray-500 italic">Nenhum serviço discriminado.</p>}
        </div>

        {/* Peças */}
        <div>
          <h3 className="font-bold text-sm mb-2 uppercase border-b pb-1">Peças Utilizadas</h3>
          {wo.parts && wo.parts.length > 0 ? (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-1.5">Peça</th>
                  <th className="text-left p-1.5">Código</th>
                  <th className="text-right p-1.5">Qtd</th>
                  <th className="text-right p-1.5">Valor Unit.</th>
                  <th className="text-right p-1.5">Total</th>
                </tr>
              </thead>
              <tbody>
                {wo.parts.map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="p-1.5">{p.name}</td>
                    <td className="p-1.5 font-mono">{p.part_code || "—"}</td>
                    <td className="text-right p-1.5">{p.quantity}</td>
                    <td className="text-right p-1.5">{fmtCurrency(p.unit_price)}</td>
                    <td className="text-right p-1.5 font-bold">{fmtCurrency(p.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-xs text-gray-500 italic">Nenhuma peça discriminada.</p>}
        </div>

        {/* Totais */}
        <div className="flex justify-end pt-2">
          <div className="w-64 border p-3 rounded bg-gray-50 text-xs space-y-1">
            <div className="flex justify-between"><span>Mão de Obra:</span><span>{fmtCurrency(wo.cost_labor)}</span></div>
            <div className="flex justify-between"><span>Peças:</span><span>{fmtCurrency(wo.cost_parts)}</span></div>
            <div className="flex justify-between"><span>Guincho:</span><span>{fmtCurrency(wo.cost_towing)}</span></div>
            <div className="flex justify-between"><span>Outros:</span><span>{fmtCurrency(wo.cost_others)}</span></div>
            <div className="flex justify-between font-bold text-sm border-t pt-1 mt-1"><span>TOTAL GERAL:</span><span>{fmtCurrency(wo.cost_total)}</span></div>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="grid grid-cols-2 gap-12 pt-16 text-center text-xs">
          <div className="border-t border-black pt-2">
            <p className="font-bold">Assinatura do Técnico / Oficina</p>
            <p className="text-gray-500">{wo.workshop_name || "Oficina Responsável"}</p>
          </div>
          <div className="border-t border-black pt-2">
            <p className="font-bold">Assinatura do Gestor de Frota</p>
            <p className="text-gray-500">Aprovação & Conferência</p>
          </div>
        </div>
      </div>

      {/* ── MAIN SCREEN VIEW ── */}
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300 no-print">
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
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handlePrint}>
                <Printer className="h-3.5 w-3.5 mr-1" /> Imprimir
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleDownloadPDF}>
                <FileDown className="h-3.5 w-3.5 mr-1" /> PDF
              </Button>

              {/* Status change dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-8 text-xs" disabled={isChangingStatus}>
                    Alterar Status <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {ALL_STATUSES.filter(s => s !== wo.status).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className="text-xs cursor-pointer"
                    >
                      {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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

        {/* ── Approval Banner ── */}
        {wo.status === "Aguardando Aprovação" && (
          <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-amber-400/60 bg-amber-50 dark:bg-amber-500/10">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 min-w-0">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium truncate">Aguardando aprovação do gestor para iniciar os serviços.</span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={() => handleStatusChange("Cancelada")}
                disabled={isChangingStatus}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeitar
              </Button>
              <Button
                size="sm"
                className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleStatusChange("Em Execução")}
                disabled={isChangingStatus}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Aprovar
              </Button>
            </div>
          </div>
        )}

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
            <TabsTrigger value="servicos" className="text-xs">Serviços ({wo.services?.length || 0})</TabsTrigger>
            <TabsTrigger value="pecas" className="text-xs">Peças ({wo.parts?.length || 0})</TabsTrigger>
            <TabsTrigger value="custos" className="text-xs">Custos</TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs">Documentos ({wo.attachments?.length || 0})</TabsTrigger>
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
                      ["Número da OS", `#${String(wo.number).padStart(6, "0")}`],
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
                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddServiceOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Serviço
                </Button>
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
                        <th className="text-center py-2 font-semibold text-muted-foreground w-12">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wo.services.map(s => (
                        <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 font-medium">{s.description}</td>
                          <td className="py-2 text-right">{s.quantity}</td>
                          <td className="py-2 text-right">{s.unit_time_hours ? `${s.unit_time_hours}h` : "—"}</td>
                          <td className="py-2 text-right">{fmtCurrency(s.unit_price)}</td>
                          <td className="py-2 text-right font-semibold">{fmtCurrency(s.total_price)}</td>
                          <td className="py-2 pl-3 text-muted-foreground">{s.responsible || "—"}</td>
                          <td className="py-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleRemoveService(s.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Wrench className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">Nenhum serviço registrado</p>
                    <p className="text-xs mt-1 mb-3">Adicione os serviços executados nesta OS.</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setIsAddServiceOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Primeiro Serviço
                    </Button>
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
                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddPartOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Peça
                </Button>
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
                        <th className="text-center py-2 font-semibold text-muted-foreground w-12">Ações</th>
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
                          <td className="py-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleRemovePart(p.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Package className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">Nenhuma peça registrada</p>
                    <p className="text-xs mt-1 mb-3">Adicione as peças aplicadas durante a manutenção.</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setIsAddPartOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Primeira Peça
                    </Button>
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

          {/* ── ABA: DOCUMENTOS / UPLOADS ── */}
          <TabsContent value="documentos" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Documentos e Anexos</CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setIsAddAttachmentOpen(true)}>
                  <UploadCloud className="h-3.5 w-3.5 mr-1" /> Fazer Upload
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                {wo.attachments && wo.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {wo.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate">{att.name}</span>
                            <span className="text-[10px] text-muted-foreground">{att.file_type || "Documento"} · {att.file_size || "1 MB"} · {fmtDate(att.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {att.file_url && (
                            <a href={att.file_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleRemoveAttachment(att.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-blue-500/50 hover:bg-blue-50/20 transition-all"
                  onClick={() => setIsAddAttachmentOpen(true)}
                >
                  <UploadCloud className="h-8 w-8 mb-2 opacity-50 text-blue-500" />
                  <p className="text-sm font-medium">Clique ou arraste arquivos para anexar</p>
                  <p className="text-xs mt-0.5 opacity-80">Fotos do veículo, orçamentos da oficina, NFs, garantias e relatórios em PDF/JPG/PNG.</p>
                  <Button size="sm" variant="secondary" className="mt-3 h-7 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Selecionar Arquivo
                  </Button>
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

      {/* ── MODAL: ADICIONAR SERVIÇO ── */}
      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Adicionar Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddService} className="space-y-4 pt-2">
            <div>
              <label className={LABEL_CLASS}>Descrição do Serviço *</label>
              <Input
                required
                placeholder="Ex: Alinhamento e Balanceamento"
                value={serviceForm.description}
                onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>Quantidade</label>
                <Input
                  type="number"
                  step="0.1"
                  required
                  value={serviceForm.quantity}
                  onChange={e => setServiceForm({ ...serviceForm, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Tempo (Horas)</label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Ex: 2"
                  value={serviceForm.unit_time_hours}
                  onChange={e => setServiceForm({ ...serviceForm, unit_time_hours: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>Valor Unitário (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={serviceForm.unit_price}
                  onChange={e => setServiceForm({ ...serviceForm, unit_price: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Mecânico / Responsável</label>
                <Input
                  placeholder="Ex: Oficina Central"
                  value={serviceForm.responsible}
                  onChange={e => setServiceForm({ ...serviceForm, responsible: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddServiceOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmittingModal}>
                {isSubmittingModal ? "Salvando..." : "Salvar Serviço"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: ADICIONAR PEÇA ── */}
      <Dialog open={isAddPartOpen} onOpenChange={setIsAddPartOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Adicionar Peça</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPart} className="space-y-4 pt-2">
            <div>
              <label className={LABEL_CLASS}>Nome da Peça *</label>
              <Input
                required
                placeholder="Ex: Filtro de Óleo Lubrificante"
                value={partForm.name}
                onChange={e => setPartForm({ ...partForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>Código / Part Number</label>
                <Input
                  placeholder="Ex: P-98432"
                  value={partForm.part_code}
                  onChange={e => setPartForm({ ...partForm, part_code: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Fornecedor</label>
                <Input
                  placeholder="Ex: AutoPeças Brasil"
                  value={partForm.supplier}
                  onChange={e => setPartForm({ ...partForm, supplier: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>Quantidade</label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={partForm.quantity}
                  onChange={e => setPartForm({ ...partForm, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Valor Unitário (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={partForm.unit_price}
                  onChange={e => setPartForm({ ...partForm, unit_price: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Situação / Status da Peça</label>
              <select
                value={partForm.situation}
                onChange={e => setPartForm({ ...partForm, situation: e.target.value })}
                className={FIELD_CLASS}
              >
                <option value="Disponível">Disponível no Estoque</option>
                <option value="Aguardando">Aguardando Envio</option>
                <option value="Pedido">Pedido Realizado</option>
                <option value="Chegou">Chegou na Oficina</option>
                <option value="Instalado">Instalado no Veículo</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddPartOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmittingModal}>
                {isSubmittingModal ? "Salvando..." : "Salvar Peça"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: UPLOAD / ADICIONAR ANEXO ── */}
      <Dialog open={isAddAttachmentOpen} onOpenChange={setIsAddAttachmentOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Anexar Documento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAttachment} className="space-y-4 pt-2">
            <div>
              <label className={LABEL_CLASS}>Nome do Documento / Anexo *</label>
              <Input
                required
                placeholder="Ex: Nota Fiscal Oficina #4521"
                value={attachmentForm.name}
                onChange={e => setAttachmentForm({ ...attachmentForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>Tipo de Documento</label>
                <select
                  value={attachmentForm.file_type}
                  onChange={e => setAttachmentForm({ ...attachmentForm, file_type: e.target.value })}
                  className={FIELD_CLASS}
                >
                  <option value="Nota Fiscal">Nota Fiscal</option>
                  <option value="Orçamento">Orçamento</option>
                  <option value="Relatório Técnico">Relatório Técnico</option>
                  <option value="Foto">Foto da Avaria</option>
                  <option value="Garantia">Termo de Garantia</option>
                  <option value="Documento">Outros</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Tamanho (Ex: 1.5 MB)</label>
                <Input
                  value={attachmentForm.file_size}
                  onChange={e => setAttachmentForm({ ...attachmentForm, file_size: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Link do Arquivo / URL (Opcional)</label>
              <Input
                placeholder="https://..."
                value={attachmentForm.file_url}
                onChange={e => setAttachmentForm({ ...attachmentForm, file_url: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddAttachmentOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmittingModal}>
                {isSubmittingModal ? "Salvando..." : "Anexar Arquivo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Work Order Form */}
      <WorkOrderFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchWo}
        editData={wo}
      />
    </AppLayout>
  )
}
