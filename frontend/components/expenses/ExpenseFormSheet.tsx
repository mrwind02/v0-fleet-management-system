"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { vehicleService, driverService, unitService } from "@/services/api"
import { expenseService, Expense } from "@/services/expense.service"
import { UploadArea } from "@/components/ui/upload-area"
import { toast } from "sonner"
import { AlertCircle, Wallet } from "lucide-react"

interface ExpenseFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editData?: Expense | null
}

const FIELD_CLASS = "w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
const LABEL_CLASS = "block text-xs font-semibold text-muted-foreground mb-1"
const SECTION_CLASS = "text-sm font-semibold border-b border-border pb-2 mb-4 text-foreground"

const DEFAULT_CATEGORIES = [
  "Pedágio",
  "Estacionamento",
  "Lavagem",
  "Alimentação",
  "Hospedagem",
  "Guincho",
  "Táxi",
  "Aplicativo de Transporte",
  "Frete Terceirizado",
  "Material Operacional",
  "Material Administrativo",
  "EPI",
  "Ferramentas",
  "Outros"
]

export function ExpenseFormSheet({ open, onOpenChange, onSuccess, editData }: ExpenseFormSheetProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const isEditing = !!editData

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      number: "",
      category_name: "Pedágio",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      amount: "",
      payment_method: "Cartão Corporativo",
      unit_name: "",
      vehicle_id: "",
      driver_id: "",
      cost_center: "Operacional",
      supplier: "",
      city: "",
      responsible: "Gestor",
      is_reimbursable: "nao",
      reimbursement_amount: "",
      reimbursement_payee: "",
      reimbursement_due_date: "",
      notes: "",
    }
  })

  const selectedVehicleId = watch("vehicle_id")
  const isReimbursableVal = watch("is_reimbursable")
  const selectedDriverId = watch("driver_id")
  const amountVal = watch("amount")

  useEffect(() => {
    vehicleService.getAll().then(r => setVehicles(r.data.data || [])).catch(console.error)
    driverService.getAll().then(r => setDrivers(r.data.data || [])).catch(console.error)
    unitService.getAll().then(r => {
      const uArr = Array.isArray(r.data) ? r.data : (r.data?.data || [])
      const mappedUnits = uArr.map((u: any) => {
        let displayName = u.name
        if (u.name && (u.name.toLowerCase() === "matriz" || u.name.toLowerCase().includes("matriz"))) {
          displayName = "Matriz"
        } else if (u.code && u.code !== u.name) {
          displayName = u.code.toLowerCase().startsWith("filial") ? u.code : `Filial ${u.code}`
        } else if (u.name && !u.name.toLowerCase().startsWith("filial")) {
          displayName = `Filial ${u.name}`
        }
        return { ...u, displayName }
      })
      setUnits(Array.isArray(mappedUnits) ? mappedUnits : [])
    }).catch(console.error)
    expenseService.getCategories().then(cats => {
      if (cats && cats.length > 0) {
        setCategories(cats.map(c => c.name))
      }
    }).catch(console.error)
  }, [])

  // Automation: Auto-fill vehicle's Unit and Driver
  useEffect(() => {
    if (selectedVehicleId && vehicles.length > 0 && !isEditing) {
      const v = vehicles.find((v: any) => v.id === selectedVehicleId)
      if (v) {
        if (v.unitName) setValue("unit_name", v.unitName)
        if (v.driverName) {
          const d = drivers.find((d: any) => d.name === v.driverName)
          if (d) {
            setValue("driver_id", d.id)
            setValue("reimbursement_payee", d.name)
          }
        }
      }
    }
  }, [selectedVehicleId, vehicles, drivers, isEditing, setValue])

  // Automation: Update payee name when driver changes
  useEffect(() => {
    if (selectedDriverId && drivers.length > 0) {
      const d = drivers.find((d: any) => d.id === selectedDriverId)
      if (d) {
        setValue("reimbursement_payee", d.name)
      }
    }
  }, [selectedDriverId, drivers, setValue])

  // Fill form for edit mode
  useEffect(() => {
    if (editData && open) {
      setValue("number", editData.number?.toString() || "")
      setValue("category_name", editData.category_name)
      setValue("description", editData.description)
      setValue("date", editData.date ? editData.date.split("T")[0] : "")
      setValue("time", editData.time || "")
      setValue("amount", editData.amount?.toString() || "")
      setValue("payment_method", editData.payment_method || "Cartão Corporativo")
      setValue("unit_name", editData.unit_name || "Matriz São Paulo")
      setValue("vehicle_id", editData.vehicle_id || "")
      setValue("driver_id", editData.driver_id || "")
      setValue("cost_center", editData.cost_center || "Operacional")
      setValue("supplier", editData.supplier || "")
      setValue("city", editData.city || "")
      setValue("responsible", editData.responsible || "Gestor")
      setValue("is_reimbursable", editData.is_reimbursable ? "sim" : "nao")
      setValue("reimbursement_amount", editData.reimbursement_amount?.toString() || "")
      setValue("reimbursement_payee", editData.reimbursement_payee || "")
      setValue("reimbursement_due_date", editData.reimbursement_due_date ? editData.reimbursement_due_date.split("T")[0] : "")
      setValue("notes", editData.notes || "")
    } else if (!editData && open) {
      reset()
    }
  }, [editData, open, setValue, reset])

  const onSubmit = async (data: any) => {
    setError("")
    setIsLoading(true)
    try {
      const isReimbursableBool = data.is_reimbursable === "sim"
      const payload = {
        number: data.number ? parseInt(data.number.toString(), 10) : undefined,
        category_name: data.category_name,
        description: data.description,
        date: data.date,
        time: data.time || null,
        amount: parseFloat(data.amount.toString().replace(',', '.')) || 0,
        payment_method: data.payment_method,
        unit_name: data.unit_name,
        vehicle_id: data.vehicle_id || null,
        driver_id: data.driver_id || null,
        cost_center: data.cost_center || 'Operacional',
        supplier: data.supplier || null,
        city: data.city || null,
        responsible: data.responsible || 'Gestor',
        is_reimbursable: isReimbursableBool,
        reimbursement_amount: isReimbursableBool ? (parseFloat(data.reimbursement_amount || data.amount) || 0) : 0,
        reimbursement_payee: isReimbursableBool ? data.reimbursement_payee : null,
        reimbursement_due_date: isReimbursableBool && data.reimbursement_due_date ? data.reimbursement_due_date : null,
        notes: data.notes || null,
        has_attachment: !!attachedFile,
      }

      let savedExp: Expense
      if (isEditing && editData) {
        savedExp = await expenseService.update(editData.id, payload)
        toast.success("Despesa atualizada com sucesso!")
      } else {
        savedExp = await expenseService.create(payload)
        toast.success("Despesa registrada com sucesso!")
      }

      // If file attached, record attachment
      if (attachedFile && savedExp?.id) {
        await expenseService.addAttachment(savedExp.id, {
          name: attachedFile.name,
          file_type: attachedFile.type || "Documento",
          file_size: `${(attachedFile.size / 1024 / 1024).toFixed(2)} MB`,
          file_url: "#",
        })
      }

      reset()
      setAttachedFile(null)
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar a despesa")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={{ maxWidth: 820 }} className="w-full overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="mb-6 px-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl">
                  {isEditing ? `Editar Despesa #${String(editData?.number).padStart(6, "0")}` : "Nova Despesa Operacional"}
                </SheetTitle>
                <SheetDescription>
                  {isEditing
                    ? "Atualize as informações da despesa operacional."
                    : "Registre despesas operacionais diversas como pedágios, estacionamentos e lavagens."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Seção 1: Informações Gerais ── */}
            <div>
              <h3 className={SECTION_CLASS}>1. Informações Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Número da Despesa</label>
                  <input
                    type="number"
                    {...register("number")}
                    className={FIELD_CLASS}
                    placeholder="Automático"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Categoria *</label>
                  <select {...register("category_name", { required: true })} className={FIELD_CLASS}>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Data *</label>
                  <input
                    type="date"
                    required
                    {...register("date", { required: true })}
                    className={FIELD_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Hora</label>
                  <input
                    type="time"
                    {...register("time")}
                    className={FIELD_CLASS}
                  />
                </div>
                <div className="md:col-span-4">
                  <label className={LABEL_CLASS}>Descrição Detalhada *</label>
                  <input
                    type="text"
                    required
                    {...register("description", { required: true })}
                    className={FIELD_CLASS}
                    placeholder="Ex: Pedágio Rodovia dos Bandeirantes KM 36 - Trecho SP -> Campinas"
                  />
                </div>
              </div>
            </div>

            {/* ── Seção 2: Relacionamentos ── */}
            <div>
              <h3 className={SECTION_CLASS}>2. Relacionamentos & Origem</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Unidade Operacional *</label>
                  <select {...register("unit_name", { required: true })} className={FIELD_CLASS}>
                    <option value="" disabled>Selecione uma unidade...</option>
                    {Array.isArray(units) && units.map((u: any) => (
                      <option key={u.id} value={u.displayName || u.name || u.unitName}>{u.displayName || u.name || u.unitName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Veículo (Opcional)</label>
                  <select {...register("vehicle_id")} className={FIELD_CLASS}>
                    <option value="">Nenhum veículo vinculado</option>
                    {vehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.plate})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Motorista (Opcional)</label>
                  <select {...register("driver_id")} className={FIELD_CLASS}>
                    <option value="">Nenhum motorista vinculado</option>
                    {drivers.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Centro de Custo *</label>
                  <select {...register("cost_center", { required: true })} className={FIELD_CLASS}>
                    <option value="Operacional">Operacional</option>
                    <option value="Viagens & Estadia">Viagens & Estadia</option>
                    <option value="Manutenção Operacional">Manutenção Operacional</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Logística Especial">Logística Especial</option>
                    <option value="Suprimentos Operacionais">Suprimentos Operacionais</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Fornecedor / Estabelecimento</label>
                  <input
                    type="text"
                    {...register("supplier")}
                    className={FIELD_CLASS}
                    placeholder="Ex: AutoBred / Sem Parar, Hotel Ibis"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Cidade / Local</label>
                  <input
                    type="text"
                    {...register("city")}
                    className={FIELD_CLASS}
                    placeholder="Ex: Jundiaí - SP"
                  />
                </div>
              </div>
            </div>

            {/* ── Seção 3: Valores & Reembolso ── */}
            <div>
              <h3 className={SECTION_CLASS}>3. Valores & Reembolso</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Valor da Despesa (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    {...register("amount", { required: true })}
                    className={FIELD_CLASS}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Forma de Pagamento *</label>
                  <select {...register("payment_method", { required: true })} className={FIELD_CLASS}>
                    <option value="Cartão Corporativo">Cartão Corporativo</option>
                    <option value="Sem Parar">Sem Parar / Tag</option>
                    <option value="Reembolso">Reembolso</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Faturamento">Faturamento / Faturado</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Responsável pelo Lançamento</label>
                  <input
                    type="text"
                    {...register("responsible")}
                    className={FIELD_CLASS}
                    placeholder="Ex: Gestor, Supervisor"
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Despesa Reembolsável?</label>
                  <select {...register("is_reimbursable")} className={FIELD_CLASS}>
                    <option value="nao">Não — Paga diretamente pela empresa</option>
                    <option value="sim">Sim — Reembolsar motorista/funcionário</option>
                  </select>
                </div>

                {isReimbursableVal === "sim" && (
                  <>
                    <div>
                      <label className={LABEL_CLASS}>Beneficiário do Reembolso</label>
                      <input
                        type="text"
                        {...register("reimbursement_payee")}
                        className={FIELD_CLASS}
                        placeholder="Nome de quem receberá o reembolso"
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Valor a Reembolsar (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("reimbursement_amount")}
                        className={FIELD_CLASS}
                        placeholder={amountVal || "0,00"}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Data Prevista do Pagamento</label>
                      <input
                        type="date"
                        {...register("reimbursement_due_date")}
                        className={FIELD_CLASS}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Seção 4: Comprovantes ── */}
            <div>
              <h3 className={SECTION_CLASS}>4. Comprovante / Anexo</h3>
              <UploadArea
                onFileSelect={(file) => setAttachedFile(file)}
                accept="image/*,.pdf,.xml"
              />
            </div>

            {/* ── Seção 5: Observações ── */}
            <div>
              <h3 className={SECTION_CLASS}>5. Observações</h3>
              <textarea
                rows={3}
                {...register("notes")}
                className={FIELD_CLASS}
                placeholder="Adicione informações complementares ou justificativas..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Salvar..." : isEditing ? "Atualizar Despesa" : "Salvar Despesa"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
