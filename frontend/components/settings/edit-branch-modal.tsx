"use client"

import * as React from "react"
import { Building2, Save, X, Search, CheckCircle2, AlertCircle, Loader2, MapPin, Phone, Mail, Hash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BranchConfig } from "@/types/settings"
import { fetchCnpj, formatCnpj, validateCnpj, stripCnpjMask } from "@/services/cnpj.service"

interface EditBranchModalProps {
  branch: BranchConfig | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedBranch: BranchConfig) => void
}

type CnpjState = "idle" | "loading" | "success" | "error"

export function EditBranchModal({ branch, isOpen, onClose, onSave }: EditBranchModalProps) {
  const [formData, setFormData] = React.useState<Partial<BranchConfig>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [cnpjState, setCnpjState] = React.useState<CnpjState>("idle")
  const [cnpjMessage, setCnpjMessage] = React.useState("")
  const [cnpjInput, setCnpjInput] = React.useState("")

  React.useEffect(() => {
    if (branch) {
      setFormData({ ...branch })
      setCnpjInput(branch.cnpj || "")
      setCnpjState("idle")
      setCnpjMessage("")
    }
  }, [branch])

  if (!branch) return null

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatCnpj(e.target.value)
    setCnpjInput(masked)
    setFormData((prev) => ({ ...prev, cnpj: masked }))
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
      setFormData((prev) => ({
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
      setCnpjInput(result.cnpj)
      setCnpjState("success")
      setCnpjMessage(`✓ ${result.corporateName}${result.cnpjStatus ? ` — Situação: ${result.cnpjStatus}` : ""}`)
    } catch (err: any) {
      setCnpjState("error")
      setCnpjMessage(err.message || "Erro ao consultar CNPJ.")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      onSave({
        ...branch,
        ...formData,
        cnpj: cnpjInput,
      } as BranchConfig)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const update = (key: keyof BranchConfig, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl border shadow-xl rounded-xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-3 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Editar Filial</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Atualize os dados cadastrais da filial {branch.name}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">

          {/* CNPJ */}
          <div className="flex gap-2">
            <Input
              value={cnpjInput}
              onChange={handleCnpjChange}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchCnpj())}
              placeholder="CNPJ — 00.000.000/0001-00"
              className="text-xs flex-1"
              maxLength={18}
              disabled={cnpjState === "loading"}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleSearchCnpj}
              disabled={cnpjState === "loading" || stripCnpjMask(cnpjInput).length < 14}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0"
            >
              {cnpjState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              {cnpjState === "loading" ? "Consultando..." : "Buscar CNPJ"}
            </Button>
          </div>
          {cnpjState === "success" && (
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px]">
              <CheckCircle2 className="h-3 w-3 shrink-0" /><span>{cnpjMessage}</span>
            </div>
          )}
          {cnpjState === "error" && (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-[11px]">
              <AlertCircle className="h-3 w-3 shrink-0" /><span>{cnpjMessage}</span>
            </div>
          )}

          {/* Nome + Código + Status */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <Label className="text-xs">Nome da Filial *</Label>
              <Input value={formData.name || ""} onChange={(e) => update("name", e.target.value)} placeholder="Ex: Filial Rio de Janeiro" className="text-xs mt-1" required />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Código *</Label>
              <Input value={formData.code || ""} onChange={(e) => update("code", e.target.value)} placeholder="RJ-01" className="text-xs mt-1" required />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Status</Label>
              <select
                value={formData.status || "Ativa"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="Ativa">Ativa</option>
                <option value="Inativa">Inativa</option>
              </select>
            </div>
          </div>

          {/* Gestor + Telefone + Email */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Gestor</Label>
              <Input value={formData.manager || ""} onChange={(e) => update("manager", e.target.value)} placeholder="Ex: Carlos Eduardo" className="text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs">Telefone</Label>
              <Input value={formData.phone || ""} onChange={(e) => update("phone", e.target.value)} placeholder="(00) 0000-0000" className="text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs">E-mail</Label>
              <Input type="email" value={formData.email || ""} onChange={(e) => update("email", e.target.value)} placeholder="filial@empresa.com.br" className="text-xs mt-1" />
            </div>
          </div>

          {/* Endereço compacto */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-8">
              <Label className="text-xs">Logradouro</Label>
              <Input value={formData.address || ""} onChange={(e) => update("address", e.target.value)} placeholder="Ex: Av. Paulista" className="text-xs mt-1" />
            </div>
            <div className="col-span-4">
              <Label className="text-xs">Número</Label>
              <Input value={formData.number || ""} onChange={(e) => update("number", e.target.value)} placeholder="1578" className="text-xs mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3">
              <Label className="text-xs">Bairro</Label>
              <Input value={formData.neighborhood || ""} onChange={(e) => update("neighborhood", e.target.value)} placeholder="Centro" className="text-xs mt-1" />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Complemento</Label>
              <Input value={formData.complement || ""} onChange={(e) => update("complement", e.target.value)} placeholder="Sala 205" className="text-xs mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">CEP</Label>
              <Input value={formData.zipCode || ""} onChange={(e) => update("zipCode", e.target.value)} placeholder="00000-000" className="text-xs mt-1" maxLength={9} />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Cidade *</Label>
              <Input value={formData.city || ""} onChange={(e) => update("city", e.target.value)} placeholder="Ex: Rio de Janeiro" className="text-xs mt-1" required />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">UF *</Label>
              <Input value={formData.state || ""} onChange={(e) => update("state", e.target.value.toUpperCase())} placeholder="RJ" className="text-xs uppercase mt-1" maxLength={2} required />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t flex items-center justify-between">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">Cancelar</Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Save className="h-3.5 w-3.5" /> Salvar Filial
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
