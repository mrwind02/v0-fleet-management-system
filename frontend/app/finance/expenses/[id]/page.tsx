"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusPill } from "@/components/ui/status-pill"
import { CategoryBadge } from "@/components/ui/category-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline } from "@/components/ui/timeline"
import { UploadArea } from "@/components/ui/upload-area"
import { ExpenseFormSheet } from "@/components/expenses/ExpenseFormSheet"
import { expenseService, Expense } from "@/services/expense.service"
import { cn } from "@/utils/utils"
import {
  Edit, Printer, FileDown, ArrowLeft, CheckCircle, XCircle, Trash2,
  FileText, History, Shield, AlertTriangle, ChevronDown, Copy, ExternalLink,
  Truck, User, Building2, Wallet, DollarSign, Calendar, MapPin, Tag, CreditCard, Building
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

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

function getStatusVariant(status: string): any {
  const map: Record<string, string> = {
    "Aprovada": "success",
    "Reembolsada": "success",
    "Pendente": "warning",
    "Aguardando Aprovação": "warning",
    "Cancelada": "destructive",
  }
  return map[status] || "default"
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

export default function ExpenseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [exp, setExp] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState("resumo")

  const fetchExp = async () => {
    setIsLoading(true)
    try {
      const data = await expenseService.getById(id)
      setExp(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchExp() }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!exp) return
    setIsChangingStatus(true)
    try {
      await expenseService.updateStatus(exp.id, newStatus as any, "Gestor")
      toast.success(`Status da despesa alterado para "${newStatus}"`)
      fetchExp()
    } catch {
      toast.error("Erro ao alterar status da despesa")
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!exp || !confirm("Tem certeza que deseja excluir esta despesa?")) return
    try {
      await expenseService.delete(exp.id)
      toast.success("Despesa excluída!")
      router.push("/finance/expenses")
    } catch {
      toast.error("Erro ao excluir despesa.")
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!exp) return
    try {
      await expenseService.addAttachment(exp.id, {
        name: file.name,
        file_type: file.type || "Comprovante",
        file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        file_url: "#",
      })
      toast.success("Comprovante anexado com sucesso!")
      fetchExp()
    } catch {
      toast.error("Erro ao fazer upload do comprovante.")
    }
  }

  const handleRemoveAttachment = async (attId: string) => {
    if (!exp) return
    try {
      await expenseService.removeAttachment(exp.id, attId)
      toast.success("Comprovante removido!")
      fetchExp()
    } catch {
      toast.error("Erro ao remover comprovante.")
    }
  }

  const handlePrintPDF = () => {
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

  if (!exp) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Despesa não encontrada.</p>
          <Button variant="outline" onClick={() => router.push('/finance/expenses')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Despesas
          </Button>
        </div>
      </AppLayout>
    )
  }

  const ALL_STATUSES = ["Pendente", "Aguardando Aprovação", "Aprovada", "Reembolsada", "Cancelada"]

  return (
    <AppLayout>
      {/* ── Print Styles ── */}
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

      {/* ── PRINT VIEW ── */}
      <div className="print-only p-8 text-black bg-white font-sans max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-start border-b-2 border-black pb-4">
          <div>
            <h1 className="text-2xl font-bold uppercase">FrotaOne — Comprovante de Despesa</h1>
            <p className="text-sm text-gray-600">Relatório Operacional de Custo</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">Despesa #{String(exp.number).padStart(6, "0")}</h2>
            <p className="text-xs text-gray-500">Data: {fmtDate(exp.date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-gray-50 text-xs">
          <div>
            <p className="font-bold">Categoria: {exp.category_name}</p>
            <p>Descrição: {exp.description}</p>
            <p>Unidade: {exp.unit_name}</p>
            <p>Centro de Custo: {exp.cost_center}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">Valor: {fmtCurrency(exp.amount)}</p>
            <p>Forma Pagto: {exp.payment_method}</p>
            <p>Status: {exp.status}</p>
            <p>Responsável: {exp.responsible || "—"}</p>
          </div>
        </div>

        {exp.is_reimbursable && (
          <div className="border p-4 rounded bg-amber-50 text-xs">
            <p className="font-bold">Informações de Reembolso</p>
            <p>Beneficiário: {exp.reimbursement_payee || "—"}</p>
            <p>Valor a Reembolsar: {fmtCurrency(exp.reimbursement_amount || exp.amount)}</p>
            <p>Data Prevista: {fmtDate(exp.reimbursement_due_date)}</p>
          </div>
        )}

        <div className="border-t pt-8 mt-12 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-black pt-2">
            <p className="font-bold">Assinatura Solicitante / Motorista</p>
            <p className="text-gray-500">{exp.driver_name || exp.responsible || "Solicitante"}</p>
          </div>
          <div className="border-t border-black pt-2">
            <p className="font-bold">Assinatura Aprovador / Gestão</p>
            <p className="text-gray-500">Conferido & Aprovado</p>
          </div>
        </div>
      </div>

      {/* ── MAIN VIEW ── */}
      <div className="flex flex-col gap-4 pb-6 w-full animate-in fade-in duration-300 no-print">
        {/* Header */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Financeiro" },
            { label: "Despesas", href: "/finance/expenses" },
            { label: `Despesa #${String(exp.number).padStart(6, "0")}` },
          ]}
          title={`Despesa #${String(exp.number).padStart(6, "0")}`}
          description={
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <CategoryBadge category={exp.category_name} showIcon />
              <StatusPill status={getStatusVariant(exp.status)} label={exp.status} className="text-xs" />
              {exp.is_reimbursable && (
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400">
                  Reembolsável
                </Badge>
              )}
            </div>
          }
          actions={
            <>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.push('/finance/expenses')}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Voltar
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsFormOpen(true)}>
                <Edit className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsFormOpen(true)}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Duplicar
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handlePrintPDF}>
                <FileDown className="h-3.5 w-3.5 mr-1" /> Gerar PDF
              </Button>

              {/* Status Change Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-8 text-xs" disabled={isChangingStatus}>
                    Alterar Status <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {ALL_STATUSES.filter(s => s !== exp.status).map(s => (
                    <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)} className="text-xs cursor-pointer">
                      {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" className="h-8 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          }
        />

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-2">
          <SummaryCard
            icon={<Tag className="h-4 w-4" />}
            label="Categoria"
            value={exp.category_name}
            sub={exp.cost_center}
          />
          <SummaryCard
            icon={<Truck className="h-4 w-4" />}
            label="Veículo"
            value={exp.vehicle_info || (exp.vehicle_plate ? `${exp.vehicle_brand || ''} ${exp.vehicle_model || ''} (${exp.vehicle_plate})` : "Sem vínculo")}
            iconBg="bg-purple-100 dark:bg-purple-900/40"
          />
          <SummaryCard
            icon={<User className="h-4 w-4" />}
            label="Motorista"
            value={exp.driver_full_name || exp.driver_name || "Sem vínculo"}
            iconBg="bg-green-100 dark:bg-green-900/40"
          />
          <SummaryCard
            icon={<Building2 className="h-4 w-4" />}
            label="Unidade"
            value={exp.unit_name}
            iconBg="bg-orange-100 dark:bg-orange-900/40"
          />
          <SummaryCard
            icon={<Wallet className="h-4 w-4" />}
            label="Forma de Pagamento"
            value={exp.payment_method}
            sub={exp.supplier || "Sem fornecedor"}
            iconBg="bg-cyan-100 dark:bg-cyan-900/40"
          />
          <SummaryCard
            icon={<Calendar className="h-4 w-4" />}
            label="Data & Hora"
            value={fmtDate(exp.date)}
            sub={exp.time || undefined}
            iconBg="bg-slate-100 dark:bg-slate-800"
          />
          <SummaryCard
            icon={<User className="h-4 w-4" />}
            label="Responsável"
            value={exp.responsible || "—"}
            iconBg="bg-amber-100 dark:bg-amber-900/40"
          />
          <SummaryCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Valor Total"
            value={fmtCurrency(Number(exp.amount))}
            sub={exp.is_reimbursable ? `Reembolso: ${fmtCurrency(Number(exp.reimbursement_amount || exp.amount))}` : "Pago direto"}
            iconBg="bg-blue-600 text-white"
          />
        </div>

        {/* Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9 flex-wrap">
            <TabsTrigger value="resumo" className="text-xs">Resumo</TabsTrigger>
            <TabsTrigger value="comprovantes" className="text-xs">Comprovantes ({exp.attachments?.length || (exp.has_attachment ? 1 : 0)})</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs">Histórico</TabsTrigger>
            <TabsTrigger value="auditoria" className="text-xs">Auditoria</TabsTrigger>
          </TabsList>

          {/* ABA RESUMO */}
          <TabsContent value="resumo" className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-muted-foreground/10 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold">Descrição e Detalhes da Despesa</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Descrição</p>
                    <p className="text-sm font-medium text-foreground">{exp.description}</p>
                  </div>
                  {exp.notes && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Observações</p>
                      <p className="text-xs text-muted-foreground">{exp.notes}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t text-xs">
                    <div>
                      <span className="text-muted-foreground block">Fornecedor / Local:</span>
                      <span className="font-medium">{exp.supplier || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Cidade:</span>
                      <span className="font-medium">{exp.city || "—"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted-foreground/10 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold">Informações Financeiras & Reembolso</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <dl className="space-y-2">
                    {[
                      ["Valor da Despesa", fmtCurrency(Number(exp.amount))],
                      ["Forma de Pagamento", exp.payment_method],
                      ["Centro de Custo", exp.cost_center],
                      ["Unidade Responsável", exp.unit_name],
                      ["Despesa Reembolsável?", exp.is_reimbursable ? "Sim" : "Não"],
                      ...(exp.is_reimbursable ? [
                        ["Beneficiário do Reembolso", exp.reimbursement_payee || exp.driver_name || "—"],
                        ["Valor do Reembolso", fmtCurrency(Number(exp.reimbursement_amount || exp.amount))],
                        ["Data Prevista Pagamento", fmtDate(exp.reimbursement_due_date)],
                        ["Status do Reembolso", exp.reimbursement_status || "Pendente"]
                      ] : [])
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0 text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA COMPROVANTES */}
          <TabsContent value="comprovantes" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Comprovantes & Anexos</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                {exp.attachments && exp.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exp.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate">{att.name}</span>
                            <span className="text-[10px] text-muted-foreground">{att.file_type || "Documento"} · {att.file_size || "1 MB"} · {fmtDate(att.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
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
                            className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            onClick={() => handleRemoveAttachment(att.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="pt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Enviar ou Substituir Comprovante (Imagem, PDF ou XML)</p>
                  <UploadArea
                    onFileSelect={handleFileUpload}
                    accept="image/*,.pdf,.xml"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA HISTÓRICO */}
          <TabsContent value="historico" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Linha do Tempo dos Eventos</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {exp.history && exp.history.length > 0 ? (
                  <Timeline
                    events={exp.history.map((h) => ({
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

          {/* ABA AUDITORIA */}
          <TabsContent value="auditoria" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Trilha de Auditoria & Modificações</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {exp.history && exp.history.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 font-semibold">Evento / Alteração</th>
                        <th className="text-left py-2 font-semibold">Usuário</th>
                        <th className="text-left py-2 font-semibold">Valor Anterior</th>
                        <th className="text-left py-2 font-semibold">Novo Valor</th>
                        <th className="text-right py-2 font-semibold">Data & Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exp.history.map(h => (
                        <tr key={h.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 font-medium">{h.description}</td>
                          <td className="py-2 text-muted-foreground">{h.user_name || "Sistema"}</td>
                          <td className="py-2 text-muted-foreground">{h.old_value || "—"}</td>
                          <td className="py-2 text-foreground font-medium">{h.new_value || "—"}</td>
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

      <ExpenseFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchExp}
        editData={exp}
      />
    </AppLayout>
  )
}
