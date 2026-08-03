"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, CheckCircle2, AlertCircle, Loader2, MapPin, Phone, Mail, Hash } from "lucide-react"
import { fetchCnpj, formatCnpj, stripCnpjMask } from "@/services/cnpj.service"

export type ModalType =
  | "user"
  | "branch"
  | "fleet_param"
  | "finance_param"
  | "doc_rule"
  | "maint_rule"
  | "supplier_rule"
  | null

interface NewItemModalProps {
  type: ModalType
  isOpen: boolean
  onClose: () => void
  onSubmit: (type: ModalType, formData: Record<string, any>) => void
}

export function NewItemModal({ type, isOpen, onClose, onSubmit }: NewItemModalProps) {
  const [form, setForm] = React.useState<Record<string, any>>({})
  const [cnpjInput, setCnpjInput] = React.useState("")
  const [cnpjState, setCnpjState] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [cnpjMessage, setCnpjMessage] = React.useState("")

  React.useEffect(() => {
    setForm({})
    setCnpjInput("")
    setCnpjState("idle")
    setCnpjMessage("")
  }, [type, isOpen])

  if (!type) return null

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatCnpj(e.target.value)
    setCnpjInput(masked)
    setForm((prev) => ({ ...prev, cnpj: masked }))
    setCnpjState("idle")
    setCnpjMessage("")
  }

  const handleSearchCnpj = async () => {
    const digits = stripCnpjMask(cnpjInput)
    if (digits.length < 14) {
      setCnpjState("error")
      setCnpjMessage("Digite o CNPJ completo (14 dígitos) antes de buscar.")
      return
    }
    setCnpjState("loading")
    setCnpjMessage("")
    try {
      const result = await fetchCnpj(cnpjInput)
      setCnpjInput(result.cnpj)
      setForm((prev) => ({
        ...prev,
        cnpj: result.cnpj,
        cnpjStatus: result.cnpjStatus,
        name: result.tradeName || result.corporateName || prev.name,
        address: result.address,
        number: result.number,
        complement: result.complement,
        neighborhood: result.neighborhood,
        city: result.city,
        state: result.state,
        zipCode: result.zipCode,
        phone: result.phone,
        email: result.email,
      }))
      setCnpjState("success")
      setCnpjMessage(`✓ ${result.corporateName}${result.cnpjStatus ? ` — Situação: ${result.cnpjStatus}` : ""}`)
    } catch (err: any) {
      setCnpjState("error")
      setCnpjMessage(err.message || "Erro ao consultar CNPJ.")
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(type, {
      ...form,
      cnpj: cnpjInput || form.cnpj || ""
    })
    onClose()
  }

  const titles: Record<NonNullable<ModalType>, string> = {
    user: "Cadastrar Novo Usuário",
    branch: "Cadastrar Nova Filial",
    fleet_param: "Cadastrar Parâmetro de Frota",
    finance_param: "Cadastrar Parâmetro Financeiro",
    doc_rule: "Nova Regra de Documento",
    maint_rule: "Nova Regra de Manutenção",
    supplier_rule: "Nova Regra de Fornecedores"
  }

  const descriptions: Record<NonNullable<ModalType>, string> = {
    user: "Preencha os dados cadastrais e defina o perfil de acesso (RBAC) do novo usuário.",
    branch: "Informe os dados da nova filial para compor a estrutura multiempresa do ERP.",
    fleet_param: "Cadastre novas marcas, modelos, combustíveis ou status operacionais.",
    finance_param: "Cadastre centros de custo, contas bancárias ou categorias de despesas.",
    doc_rule: "Defina o prazo de alerta antecedente e as regras de bloqueio para o documento.",
    maint_rule: "Cadastre novos tipos de OS, oficinas credenciadas ou modelos de checklist.",
    supplier_rule: "Cadastre categorias e regras de homologação para qualificação de fornecedores."
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={type === "branch" ? "sm:max-w-xl max-h-[85vh] overflow-y-auto" : "sm:max-w-lg"}>
        <form onSubmit={handleSave} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              {titles[type]}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {descriptions[type]}
            </DialogDescription>
          </DialogHeader>

          {/* FORM FIELDS PER MODAL TYPE */}
          {type === "user" && (
            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Nome Completo *</Label>
                <Input
                  required
                  placeholder="ex: Roberto Carlos Matos"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">E-mail Corporativo *</Label>
                <Input
                  required
                  type="email"
                  placeholder="roberto.matos@frotaone.com.br"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Perfil (RBAC) *</Label>
                  <select
                    value={form.role || "operacional"}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="admin">Administrador Total</option>
                    <option value="gestor">Gestor de Operações</option>
                    <option value="financeiro">Analista Financeiro</option>
                    <option value="operacional">Operador de Pátio</option>
                    <option value="driver">Motorista / Condutor</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Filial Alocada</Label>
                  <select
                    value={form.branch || "Matriz SP"}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="Matriz SP">Matriz São Paulo</option>
                    <option value="Filial RJ">Filial Rio de Janeiro</option>
                    <option value="Filial BH">Filial Belo Horizonte</option>
                    <option value="Filial PR">Filial Curitiba</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <Checkbox
                  checked={form.require2fa !== false}
                  onCheckedChange={(c) => setForm({ ...form, require2fa: !!c })}
                />
                <span>Exigir Autenticação 2FA no Primeiro Acesso</span>
              </label>
            </div>
          )}

          {type === "branch" && (
            <div className="space-y-3 text-xs">
              {/* CNPJ */}
              <div>
                <Label className="text-xs font-semibold">CNPJ da Filial</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={cnpjInput}
                    onChange={handleCnpjChange}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchCnpj())}
                    placeholder="00.000.000/0001-00"
                    className="text-xs flex-1"
                    maxLength={18}
                    disabled={cnpjState === "loading"}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSearchCnpj}
                    disabled={cnpjState === "loading" || stripCnpjMask(cnpjInput).length < 14}
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0"
                  >
                    {cnpjState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                    {cnpjState === "loading" ? "Consultando..." : "Buscar CNPJ"}
                  </Button>
                </div>
                {cnpjState === "success" && (
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px] mt-1">
                    <CheckCircle2 className="h-3 w-3 shrink-0" /><span>{cnpjMessage}</span>
                  </div>
                )}
                {cnpjState === "error" && (
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-[11px] mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" /><span>{cnpjMessage}</span>
                  </div>
                )}
              </div>

              {/* Nome + Código + Gestor */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs">Nome da Filial *</Label>
                  <Input required placeholder="ex: Filial Campinas" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Código *</Label>
                  <Input required placeholder="SP-05" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="text-xs mt-1 uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Responsável</Label>
                  <Input placeholder="Nome do Gestor" value={form.manager || ""} onChange={(e) => setForm({ ...form, manager: e.target.value })} className="text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Telefone</Label>
                  <Input placeholder="(00) 0000-0000" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="text-xs mt-1" />
                </div>
              </div>

              {/* Endereço compacto */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <Label className="text-xs">Logradouro</Label>
                  <Input placeholder="Av. Paulista" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className="text-xs mt-1" />
                </div>
                <div className="col-span-4">
                  <Label className="text-xs">Número</Label>
                  <Input placeholder="1578" value={form.number || ""} onChange={(e) => setForm({ ...form, number: e.target.value })} className="text-xs mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <Label className="text-xs">Bairro</Label>
                  <Input placeholder="Centro" value={form.neighborhood || ""} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="text-xs mt-1" />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">CEP</Label>
                  <Input placeholder="00000-000" maxLength={9} value={form.zipCode || ""} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className="text-xs mt-1" />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Cidade *</Label>
                  <Input required placeholder="Campinas" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className="text-xs mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">UF *</Label>
                  <Input required placeholder="SP" maxLength={2} value={form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} className="text-xs mt-1 uppercase" />
                </div>
              </div>
              <div>
                <Label className="text-xs">E-mail</Label>
                <Input type="email" placeholder="filial@empresa.com.br" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="text-xs mt-1" />
              </div>
            </div>
          )}

          {type === "fleet_param" && (
            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Tipo de Parâmetro *</Label>
                <select
                  value={form.paramType || "marca"}
                  onChange={(e) => setForm({ ...form, paramType: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="marca">Marca de Veículo</option>
                  <option value="modelo">Modelo / Versão</option>
                  <option value="categoria">Categoria de Veículo</option>
                  <option value="combustivel">Tipo de Combustível</option>
                  <option value="status">Status Operacional</option>
                  <option value="eixos">Configuração de Eixos</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Nome / Descrição do Parâmetro *</Label>
                <Input
                  required
                  placeholder="ex: Scania R450, Gasolina Aditivada, Cavalo 6x2"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Informação Adicional / Detalhes</Label>
                <Input
                  placeholder="ex: Combustível Euro 6 / Padrão ANP"
                  value={form.extraInfo || ""}
                  onChange={(e) => setForm({ ...form, extraInfo: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>
          )}

          {type === "finance_param" && (
            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Classificação Financeira *</Label>
                <select
                  value={form.paramType || "categoria_despesa"}
                  onChange={(e) => setForm({ ...form, paramType: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="categoria_despesa">Categoria de Despesa</option>
                  <option value="centro_custo">Centro de Custo</option>
                  <option value="conta_bancaria">Conta Bancária / PIX</option>
                  <option value="forma_pagamento">Forma de Pagamento / Cartão</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Código *</Label>
                  <Input
                    required
                    placeholder="CC-05 / DESP-09"
                    value={form.code || ""}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="text-xs font-mono mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Nome da Categoria / Centro *</Label>
                  <Input
                    required
                    placeholder="ex: Manutenção de Pneus"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="text-xs mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Conta Analítica / Detalhes</Label>
                <Input
                  placeholder="ex: Conta 3.1.08 ou Dados da Conta Bancária"
                  value={form.detail || ""}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>
          )}

          {type === "doc_rule" && (
            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Nome do Tipo de Documento *</Label>
                <Input
                  required
                  placeholder="ex: Certificado MOPP / CNH Categoria E"
                  value={form.docType || ""}
                  onChange={(e) => setForm({ ...form, docType: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Obrigatoriedade</Label>
                  <select
                    value={form.requiredFor || "Veículo"}
                    onChange={(e) => setForm({ ...form, requiredFor: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                  >
                    <option value="Veículo">Veículo</option>
                    <option value="Motorista">Motorista</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Notificar Antecedência</Label>
                  <select
                    value={form.alertDays || 60}
                    onChange={(e) => setForm({ ...form, alertDays: Number(e.target.value) })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                  >
                    <option value={30}>30 Dias Antes</option>
                    <option value={60}>60 Dias Antes</option>
                    <option value={90}>90 Dias Antes</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <Checkbox
                  checked={form.blocksAllocation !== false}
                  onCheckedChange={(c) => setForm({ ...form, blocksAllocation: !!c })}
                />
                <span>Bloquear alocação se documento estiver VENCIDO</span>
              </label>
            </div>
          )}

          {type === "maint_rule" && (
            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Tipo de Regra *</Label>
                <select
                  value={form.maintType || "tipo_os"}
                  onChange={(e) => setForm({ ...form, maintType: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="tipo_os">Tipo de Ordem de Serviço</option>
                  <option value="prioridade">Nível de Prioridade</option>
                  <option value="oficina">Oficina Credenciada</option>
                  <option value="checklist">Modelo de Checklist</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Título *</Label>
                <Input
                  required
                  placeholder="ex: Revisão Geral de 50.000 KM"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Detalhes / SLA</Label>
                <Input
                  placeholder="ex: Troca de filtros e alinhamento completo"
                  value={form.detail || ""}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="text-xs h-9 bg-primary text-primary-foreground font-semibold">
              Salvar Registro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
