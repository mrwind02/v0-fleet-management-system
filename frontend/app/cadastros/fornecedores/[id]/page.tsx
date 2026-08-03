"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryBadge } from "@/components/ui/category-badge"
import { SupplierStatusBadge } from "@/components/ui/supplier-status-badge"
import { RatingStars } from "@/components/ui/rating-stars"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline } from "@/components/ui/timeline"
import { UploadArea } from "@/components/ui/upload-area"
import { SupplierFormSheet } from "@/components/suppliers/SupplierFormSheet"
import { supplierService, Supplier } from "@/services/supplier.service"
import { cn } from "@/utils/utils"
import {
  Edit, ArrowLeft, Trash2, FileText, History, Shield, AlertTriangle, ChevronDown,
  Building2, Phone, Mail, Globe, MapPin, Calendar, DollarSign, Wrench, FilePlus,
  ExternalLink, UserCheck, Plus, CheckCircle, Clock, Star
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
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

export default function Supplier360Page() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState("visao-geral")

  // Modals for Tab Actions
  const [newContractNumber, setNewContractNumber] = useState("")
  const [newContractDesc, setNewContractDesc] = useState("")
  const [newContractAmount, setNewContractAmount] = useState("")
  const [newContractEndDate, setNewContractEndDate] = useState("")

  const fetchSupplier = async () => {
    setIsLoading(true)
    try {
      const data = await supplierService.getById(id)
      setSupplier(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchSupplier() }, [id])

  const handleStatusChange = async (newStatus: any) => {
    if (!supplier) return
    setIsChangingStatus(true)
    try {
      await supplierService.updateStatus(supplier.id, newStatus, "Gestor")
      toast.success(`Status alterado para "${newStatus}"`)
      fetchSupplier()
    } catch {
      toast.error("Erro ao alterar status")
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!supplier || !confirm("Tem certeza que deseja excluir este fornecedor?")) return
    try {
      await supplierService.delete(supplier.id)
      toast.success("Fornecedor excluído!")
      router.push("/cadastros/fornecedores")
    } catch {
      toast.error("Erro ao excluir fornecedor.")
    }
  }

  const handleAddContract = async () => {
    if (!supplier || !newContractDesc || !newContractEndDate) {
      toast.error("Preencha a descrição e a data de fim do contrato.")
      return
    }
    try {
      await supplierService.addContract(supplier.id, {
        contract_number: newContractNumber || `CTR-${Date.now().toString().slice(-4)}`,
        description: newContractDesc,
        start_date: new Date().toISOString().split("T")[0],
        end_date: newContractEndDate,
        amount: parseFloat(newContractAmount) || 0,
        status: 'Vigente'
      })
      toast.success("Novo contrato adicionado com sucesso!")
      setNewContractNumber("")
      setNewContractDesc("")
      setNewContractAmount("")
      setNewContractEndDate("")
      fetchSupplier()
    } catch {
      toast.error("Erro ao adicionar contrato.")
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!supplier) return
    try {
      await supplierService.addDocument(supplier.id, {
        name: file.name,
        doc_type: "Documento",
        file_url: "#",
      })
      toast.success("Documento anexado com sucesso!")
      fetchSupplier()
    } catch {
      toast.error("Erro ao enviar documento.")
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

  if (!supplier) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Fornecedor não encontrado.</p>
          <Button variant="outline" onClick={() => router.push('/cadastros/fornecedores')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Fornecedores
          </Button>
        </div>
      </AppLayout>
    )
  }

  const ALL_STATUSES = ["Ativo", "Em Homologação", "Suspenso", "Inativo"]

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-6 w-full animate-in fade-in duration-300">
        {/* Header */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Cadastros" },
            { label: "Fornecedores", href: "/cadastros/fornecedores" },
            { label: supplier.trade_name },
          ]}
          title={supplier.trade_name}
          description={
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground font-semibold">{supplier.code || 'FOR-001'}</span>
              <CategoryBadge category={supplier.primary_category} />
              <SupplierStatusBadge status={supplier.status} />
              <RatingStars rating={Number(supplier.rating)} />
              <span className="text-xs text-muted-foreground">CNPJ: {supplier.cnpj}</span>
            </div>
          }
          actions={
            <>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.push('/cadastros/fornecedores')}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Voltar
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsFormOpen(true)}>
                <Edit className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setActiveTab("contratos")}>
                <FilePlus className="h-3.5 w-3.5 mr-1" /> Novo Contrato
              </Button>

              {/* Status Change Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-8 text-xs" disabled={isChangingStatus}>
                    Alterar Status <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {ALL_STATUSES.filter(s => s !== supplier.status).map(s => (
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

        {/* Top Summary Cards (Visão 360º KPIs) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          <SummaryCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Total Recebido"
            value={fmtCurrency(Number(supplier.total_spent))}
            sub="Acumulado histórico"
            iconBg="bg-blue-100 dark:bg-blue-900/40"
          />
          <SummaryCard
            icon={<Wrench className="h-4 w-4" />}
            label="Serviços Realizados"
            value={`${supplier.services_count || 0} atendimentos`}
            sub="Histórico consolidado"
            iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          />
          <SummaryCard
            icon={<FileText className="h-4 w-4" />}
            label="OS Vinculadas"
            value={`${supplier.work_orders?.length || 0} OSs`}
            sub="Registradas no sistema"
            iconBg="bg-purple-100 dark:bg-purple-900/40"
          />
          <SummaryCard
            icon={<Clock className="h-4 w-4" />}
            label="Tempo Médio"
            value="2.4 dias"
            sub="Tempo de atendimento"
            iconBg="bg-cyan-100 dark:bg-cyan-900/40"
          />
          <SummaryCard
            icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            label="Avaliação"
            value={`${supplier.rating || 5.0} ★`}
            sub="Excelente desempenho"
            iconBg="bg-amber-100 dark:bg-amber-900/40"
          />
          <SummaryCard
            icon={<Calendar className="h-4 w-4" />}
            label="Última Movimentação"
            value={fmtDate(supplier.last_service_date)}
            sub="Último lançamento"
            iconBg="bg-slate-100 dark:bg-slate-800"
          />
        </div>

        {/* 8 Abas Visão 360º */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-9 flex-wrap">
            <TabsTrigger value="visao-geral" className="text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="contratos" className="text-xs">Contratos ({supplier.contracts?.length || 0})</TabsTrigger>
            <TabsTrigger value="ordens-servico" className="text-xs">Ordens de Serviço ({supplier.work_orders?.length || 0})</TabsTrigger>
            <TabsTrigger value="financeiro" className="text-xs">Financeiro</TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs">Documentos ({supplier.documents?.length || 0})</TabsTrigger>
            <TabsTrigger value="contatos" className="text-xs">Contatos ({supplier.contacts?.length || 0})</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs">Histórico</TabsTrigger>
            <TabsTrigger value="auditoria" className="text-xs">Auditoria</TabsTrigger>
          </TabsList>

          {/* 1. ABA VISÃO GERAL */}
          <TabsContent value="visao-geral" className="mt-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-muted-foreground/10 shadow-sm md:col-span-2">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold">Dados Fiscais & Cadastro Completo</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div><span className="text-muted-foreground block">Razão Social:</span><span className="font-medium">{supplier.corporate_name}</span></div>
                    <div><span className="text-muted-foreground block">Nome Fantasia:</span><span className="font-medium">{supplier.trade_name}</span></div>
                    <div><span className="text-muted-foreground block">CNPJ:</span><span className="font-medium">{supplier.cnpj}</span></div>
                    <div><span className="text-muted-foreground block">Inscrição Estadual:</span><span className="font-medium">{supplier.state_registration || "—"}</span></div>
                    <div><span className="text-muted-foreground block">Categoria:</span><span className="font-medium">{supplier.primary_category}</span></div>
                    <div><span className="text-muted-foreground block">Especialidade:</span><span className="font-medium">{supplier.specialty || "—"}</span></div>
                    <div><span className="text-muted-foreground block">Telefone:</span><span className="font-medium">{supplier.phone || "—"}</span></div>
                    <div><span className="text-muted-foreground block">WhatsApp:</span><span className="font-medium">{supplier.whatsapp || "—"}</span></div>
                    <div><span className="text-muted-foreground block">E-mail:</span><span className="font-medium">{supplier.email || "—"}</span></div>
                    <div><span className="text-muted-foreground block">Website:</span><span className="font-medium">{supplier.website || "—"}</span></div>
                    <div className="col-span-2 pt-2 border-t mt-1"><span className="text-muted-foreground block">Endereço Completo:</span><span className="font-medium">{supplier.street}, {supplier.number} {supplier.complement && `- ${supplier.complement}`}, {supplier.neighborhood} — {supplier.city}/{supplier.state} (CEP: {supplier.zip_code || "—"})</span></div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="border-muted-foreground/10 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold">Indicadores da Parceria</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Primeira Contratação</span><span className="font-medium">{fmtDate(supplier.first_contract_date)}</span></div>
                    <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Último Serviço</span><span className="font-medium">{fmtDate(supplier.last_service_date)}</span></div>
                    <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Tempo de Parceria</span><span className="font-medium">2 anos e 4 meses</span></div>
                    <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Valor Acumulado</span><span className="font-bold text-blue-600">{fmtCurrency(Number(supplier.total_spent))}</span></div>
                    <div className="flex justify-between py-1"><span className="text-muted-foreground">Qtd. de Atendimentos</span><span className="font-medium">{supplier.services_count}</span></div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 2. ABA CONTRATOS */}
          <TabsContent value="contratos" className="mt-3 space-y-4">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Gestão de Contratos Vigentes & Histórico</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                {/* Form Adicionar Contrato */}
                <div className="p-3 border rounded-lg bg-muted/20 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Nº do Contrato</label>
                    <input
                      type="text"
                      placeholder="CTR-2026-01"
                      value={newContractNumber}
                      onChange={e => setNewContractNumber(e.target.value)}
                      className="w-full px-2 py-1 bg-background border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Descrição / Objeto</label>
                    <input
                      type="text"
                      placeholder="Manutenção Preventiva Frota"
                      value={newContractDesc}
                      onChange={e => setNewContractDesc(e.target.value)}
                      className="w-full px-2 py-1 bg-background border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Valor do Contrato (R$)</label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={newContractAmount}
                      onChange={e => setNewContractAmount(e.target.value)}
                      className="w-full px-2 py-1 bg-background border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Data Término</label>
                    <div className="flex gap-1">
                      <input
                        type="date"
                        value={newContractEndDate}
                        onChange={e => setNewContractEndDate(e.target.value)}
                        className="w-full px-2 py-1 bg-background border rounded"
                      />
                      <Button size="sm" className="h-7 text-xs bg-blue-600 text-white shrink-0" onClick={handleAddContract}>
                        + Adicionar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-2 px-3 text-left">Número</th>
                        <th className="py-2 px-3 text-left">Descrição</th>
                        <th className="py-2 px-3 text-left">Vigência Início</th>
                        <th className="py-2 px-3 text-left">Vigência Término</th>
                        <th className="py-2 px-3 text-right">Valor Total</th>
                        <th className="py-2 px-3 text-left">Status</th>
                        <th className="py-2 px-3 text-center">Arquivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplier.contracts && supplier.contracts.length > 0 ? (
                        supplier.contracts.map(c => (
                          <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-2 px-3 font-bold">{c.contract_number}</td>
                            <td className="py-2 px-3">{c.description}</td>
                            <td className="py-2 px-3 text-muted-foreground">{fmtDate(c.start_date)}</td>
                            <td className="py-2 px-3 text-muted-foreground">{fmtDate(c.end_date)}</td>
                            <td className="py-2 px-3 text-right font-bold text-foreground">{fmtCurrency(Number(c.amount))}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className={cn("text-[10px]", c.status === "Vigente" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                                {c.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <FileText className="h-3.5 w-3.5 text-blue-600" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-muted-foreground">Nenhum contrato cadastrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. ABA ORDENS DE SERVIÇO */}
          <TabsContent value="ordens-servico" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Ordens de Serviço Executadas pelo Parceiro</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-2 px-3 text-left">Nº OS</th>
                        <th className="py-2 px-3 text-left">Veículo</th>
                        <th className="py-2 px-3 text-left">Tipo</th>
                        <th className="py-2 px-3 text-left">Data Abertura</th>
                        <th className="py-2 px-3 text-right">Valor Total</th>
                        <th className="py-2 px-3 text-left">Status</th>
                        <th className="py-2 px-3 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplier.work_orders && supplier.work_orders.length > 0 ? (
                        supplier.work_orders.map((wo: any) => (
                          <tr key={wo.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-2 px-3 font-bold text-blue-600">#{String(wo.number).padStart(6, "0")}</td>
                            <td className="py-2 px-3 font-medium">{wo.vehicle_brand} {wo.vehicle_model} ({wo.vehicle_plate})</td>
                            <td className="py-2 px-3">{wo.type}</td>
                            <td className="py-2 px-3 text-muted-foreground">{fmtDate(wo.opened_at)}</td>
                            <td className="py-2 px-3 text-right font-bold">{fmtCurrency(Number(wo.cost_total))}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">{wo.status}</Badge>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px]"
                                onClick={() => router.push(`/manutencao/ordens-servico/${wo.id}`)}
                              >
                                Abrir OS →
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-muted-foreground">Nenhuma Ordem de Serviço vinculada a este fornecedor.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. ABA FINANCEIRO */}
          <TabsContent value="financeiro" className="mt-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card className="p-3 border">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Valor Total Recebido</span>
                <p className="text-base font-bold text-foreground mt-1">{fmtCurrency(Number(supplier.total_spent))}</p>
              </Card>
              <Card className="p-3 border">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Valor Pendente</span>
                <p className="text-base font-bold text-amber-600 mt-1">R$ 0,00</p>
              </Card>
              <Card className="p-3 border">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Média Mensal</span>
                <p className="text-base font-bold text-foreground mt-1">{fmtCurrency(Number(supplier.total_spent) / 12)}</p>
              </Card>
              <Card className="p-3 border">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Maior Pagamento</span>
                <p className="text-base font-bold text-blue-600 mt-1">R$ 18.500,00</p>
              </Card>
            </div>

            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Evolução Mensal de Pagamentos ao Fornecedor</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { month: "Jan", valor: 12000 },
                    { month: "Fev", valor: 15000 },
                    { month: "Mar", valor: 18000 },
                    { month: "Abr", valor: 14000 },
                    { month: "Mai", valor: 16000 },
                    { month: "Jun", valor: 19000 },
                    { month: "Jul", valor: 18500 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" fontSize={10} />
                    <YAxis fontSize={10} tickFormatter={(v) => `R$ ${v/1000}k`} />
                    <Tooltip formatter={(v: number) => [fmtCurrency(v), "Valor Pago"]} />
                    <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. ABA DOCUMENTOS */}
          <TabsContent value="documentos" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Documentação do Fornecedor & Vencimentos</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supplier.documents && supplier.documents.length > 0 ? (
                    supplier.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-xs font-semibold text-foreground">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground">{doc.doc_type} · Vencimento: {fmtDate(doc.expiry_date)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">Válido</Badge>
                      </div>
                    ))
                  ) : null}
                </div>

                <UploadArea onFileSelect={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 6. ABA CONTATOS */}
          <TabsContent value="contatos" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Contatos Comerciais & Operacionais</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-2 px-3 text-left">Nome</th>
                        <th className="py-2 px-3 text-left">Cargo</th>
                        <th className="py-2 px-3 text-left">Telefone</th>
                        <th className="py-2 px-3 text-left">WhatsApp</th>
                        <th className="py-2 px-3 text-left">E-mail</th>
                        <th className="py-2 px-3 text-center">Principal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplier.contacts && supplier.contacts.length > 0 ? (
                        supplier.contacts.map(c => (
                          <tr key={c.id} className="border-b border-border/50">
                            <td className="py-2 px-3 font-medium">{c.name}</td>
                            <td className="py-2 px-3 text-muted-foreground">{c.role || "—"}</td>
                            <td className="py-2 px-3">{c.phone || "—"}</td>
                            <td className="py-2 px-3">{c.whatsapp || "—"}</td>
                            <td className="py-2 px-3">{c.email || "—"}</td>
                            <td className="py-2 px-3 text-center">
                              {c.is_primary ? <Badge className="text-[10px] bg-blue-600 text-white">Sim</Badge> : "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground">Nenhum contato secundário cadastrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 7. ABA HISTÓRICO */}
          <TabsContent value="historico" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Linha do Tempo dos Eventos</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {supplier.history && supplier.history.length > 0 ? (
                  <Timeline
                    events={supplier.history.map((h) => ({
                      id: h.id,
                      title: h.description,
                      date: `${h.user_name || "Sistema"} · ${fmtDatetime(h.created_at)}`,
                      icon: <History className="h-3.5 w-3.5" />,
                    }))}
                  />
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-xs">Nenhum histórico registrado.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 8. ABA AUDITORIA */}
          <TabsContent value="auditoria" className="mt-3">
            <Card className="border-muted-foreground/10 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Trilha de Auditoria & Modificações</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {supplier.history && supplier.history.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 font-semibold">Evento</th>
                        <th className="text-left py-2 font-semibold">Usuário</th>
                        <th className="text-left py-2 font-semibold">Anterior</th>
                        <th className="text-left py-2 font-semibold">Novo</th>
                        <th className="text-right py-2 font-semibold">Data & Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplier.history.map(h => (
                        <tr key={h.id} className="border-b border-border/50">
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
                  <div className="py-8 text-center text-muted-foreground text-xs">Nenhum registro de auditoria.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <SupplierFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchSupplier}
        editData={supplier}
      />
    </AppLayout>
  )
}
