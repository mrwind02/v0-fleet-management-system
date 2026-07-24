"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { vehicleService, driverService } from "@/services/api"
import { workOrderService, WorkOrder } from "@/services/work-order.service"
import { toast } from "sonner"

interface WorkOrderFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editData?: WorkOrder | null
}

const FIELD_CLASS = "w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
const LABEL_CLASS = "block text-xs font-semibold text-muted-foreground mb-1"
const SECTION_CLASS = "text-sm font-semibold border-b border-border pb-2 mb-4"

export function WorkOrderFormSheet({ open, onOpenChange, onSuccess, editData }: WorkOrderFormSheetProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!editData

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      type: "Corretiva",
      priority: "Média",
      vehicle_id: "",
      driver_id: "",
      unit: "",
      workshop_type: "Externa",
      workshop_name: "",
      responsible: "",
      origin: "Manual",
      description: "",
      diagnosis: "",
      notes: "",
      opened_at: new Date().toISOString().split("T")[0],
      estimated_at: "",
      km_opening: "",
      cost_labor: "",
      cost_towing: "",
      cost_others: "",
    }
  })

  const selectedVehicleId = watch("vehicle_id")

  useEffect(() => {
    vehicleService.getAll().then(r => setVehicles(r.data.data || [])).catch(console.error)
    driverService.getAll().then(r => setDrivers(r.data.data || [])).catch(console.error)
  }, [])

  // Auto-fill vehicle data
  useEffect(() => {
    if (selectedVehicleId && vehicles.length > 0 && !isEditing) {
      const v = vehicles.find((v: any) => v.id === selectedVehicleId)
      if (v) {
        if (v.driverName) {
          const driver = drivers.find((d: any) => d.name === v.driverName)
          if (driver) setValue("driver_id", driver.id)
        }
        if (v.currentOdometer) setValue("km_opening", v.currentOdometer.toString())
        if (v.unitName) setValue("unit", v.unitName)
      }
    }
  }, [selectedVehicleId, vehicles, drivers, isEditing, setValue])

  // Fill form for edit mode
  useEffect(() => {
    if (editData && open) {
      setValue("type", editData.type)
      setValue("priority", editData.priority)
      setValue("vehicle_id", editData.vehicle_id || "")
      setValue("driver_id", editData.driver_id || "")
      setValue("unit", editData.unit || "")
      setValue("workshop_type", editData.workshop_type || "Externa")
      setValue("workshop_name", editData.workshop_name || "")
      setValue("responsible", editData.responsible || "")
      setValue("origin", editData.origin || "Manual")
      setValue("description", editData.description || "")
      setValue("diagnosis", editData.diagnosis || "")
      setValue("notes", editData.notes || "")
      setValue("opened_at", editData.opened_at ? editData.opened_at.split("T")[0] : "")
      setValue("estimated_at", editData.estimated_at ? editData.estimated_at.split("T")[0] : "")
      setValue("km_opening", editData.km_opening?.toString() || "")
      setValue("cost_labor", editData.cost_labor?.toString() || "")
      setValue("cost_towing", editData.cost_towing?.toString() || "")
      setValue("cost_others", editData.cost_others?.toString() || "")
    } else if (!editData && open) {
      reset()
    }
  }, [editData, open, setValue, reset])

  const onSubmit = async (data: any) => {
    setError("")
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        vehicle_id: data.vehicle_id || null,
        driver_id: data.driver_id || null,
        km_opening: data.km_opening ? parseFloat(data.km_opening.toString().replace(',', '.')) : null,
        cost_labor: data.cost_labor ? parseFloat(data.cost_labor) : 0,
        cost_towing: data.cost_towing ? parseFloat(data.cost_towing) : 0,
        cost_others: data.cost_others ? parseFloat(data.cost_others) : 0,
        opened_at: data.opened_at || new Date().toISOString(),
        estimated_at: data.estimated_at || null,
      }

      if (isEditing && editData) {
        await workOrderService.update(editData.id, payload)
        toast.success("Ordem de Serviço atualizada!")
      } else {
        await workOrderService.create(payload)
        toast.success("Ordem de Serviço criada com sucesso!")
      }

      reset()
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar a Ordem de Serviço")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={{ maxWidth: 820 }} className="w-full overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="mb-6 px-0">
            <SheetTitle className="text-xl">
              {isEditing ? `Editar OS #${String(editData?.number).padStart(6, "0")}` : "Nova Ordem de Serviço"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Atualize as informações da ordem de serviço."
                : "Preencha os dados para registrar uma nova ordem de serviço de manutenção."}
            </SheetDescription>
          </SheetHeader>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* ── Seção 1: Informações Gerais ── */}
            <div>
              <h3 className={SECTION_CLASS}>1. Informações Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Tipo de Manutenção *</label>
                  <select {...register("type", { required: true })} className={FIELD_CLASS}>
                    <option value="Preventiva">Preventiva</option>
                    <option value="Corretiva">Corretiva</option>
                    <option value="Emergencial">Emergencial</option>
                    <option value="Revisão">Revisão</option>
                    <option value="Garantia">Garantia</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Prioridade *</label>
                  <select {...register("priority", { required: true })} className={FIELD_CLASS}>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Unidade</label>
                  <input type="text" {...register("unit")} className={FIELD_CLASS} placeholder="Ex: Filial São Paulo" />
                </div>
              </div>
            </div>

            {/* ── Seção 2: Veículo ── */}
            <div>
              <h3 className={SECTION_CLASS}>2. Veículo e Motorista</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Veículo *</label>
                  <select {...register("vehicle_id")} className={FIELD_CLASS}>
                    <option value="">Selecione o veículo...</option>
                    {vehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.plate} — {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Motorista</label>
                  <select {...register("driver_id")} className={FIELD_CLASS}>
                    <option value="">Selecione o motorista...</option>
                    {drivers.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>KM na Abertura</label>
                  <input
                    type="text"
                    {...register("km_opening")}
                    className={FIELD_CLASS}
                    placeholder="Ex: 125000"
                  />
                </div>
              </div>
            </div>

            {/* ── Seção 3: Origem ── */}
            <div>
              <h3 className={SECTION_CLASS}>3. Origem da OS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Origem</label>
                  <select {...register("origin")} className={FIELD_CLASS}>
                    <option value="Manual">Manual</option>
                    <option value="Checklist">Checklist</option>
                    <option value="Preventiva">Preventiva</option>
                    <option value="Telemetria">Telemetria (futuro)</option>
                    <option value="Multa">Multa</option>
                    <option value="Inspeção">Inspeção</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Seção 4: Oficina ── */}
            <div>
              <h3 className={SECTION_CLASS}>4. Oficina e Responsável</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Tipo de Oficina</label>
                  <select {...register("workshop_type")} className={FIELD_CLASS}>
                    <option value="Interna">Interna</option>
                    <option value="Externa">Externa</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Nome da Oficina / Fornecedor</label>
                  <input type="text" {...register("workshop_name")} className={FIELD_CLASS} placeholder="Ex: Oficina Central" />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Responsável Técnico</label>
                  <input type="text" {...register("responsible")} className={FIELD_CLASS} placeholder="Ex: João Mecânico" />
                </div>
              </div>
            </div>

            {/* ── Seção 5: Descrição ── */}
            <div>
              <h3 className={SECTION_CLASS}>5. Descrição do Problema</h3>
              <div className="space-y-4">
                <div>
                  <label className={LABEL_CLASS}>Problema Relatado *</label>
                  <textarea
                    {...register("description", { required: true })}
                    rows={3}
                    className={FIELD_CLASS}
                    placeholder="Descreva o problema identificado ou o serviço a ser realizado..."
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Diagnóstico Inicial</label>
                  <textarea
                    {...register("diagnosis")}
                    rows={2}
                    className={FIELD_CLASS}
                    placeholder="Diagnóstico técnico inicial..."
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Observações</label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    className={FIELD_CLASS}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
            </div>

            {/* ── Seção 6: Datas e Custos ── */}
            <div>
              <h3 className={SECTION_CLASS}>6. Datas e Custos Estimados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Data de Abertura</label>
                  <input type="date" {...register("opened_at")} className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Previsão de Conclusão</label>
                  <input type="date" {...register("estimated_at")} className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Mão de Obra (R$)</label>
                  <input type="number" step="0.01" {...register("cost_labor")} className={FIELD_CLASS} placeholder="0,00" />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Guincho / Transporte (R$)</label>
                  <input type="number" step="0.01" {...register("cost_towing")} className={FIELD_CLASS} placeholder="0,00" />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Outros Custos (R$)</label>
                  <input type="number" step="0.01" {...register("cost_others")} className={FIELD_CLASS} placeholder="0,00" />
                </div>
              </div>
            </div>

            <SheetFooter className="pt-6 border-t border-border px-0 sm:justify-end gap-3 flex-col sm:flex-row">
              <SheetClose asChild>
                <Button variant="outline" type="button" className="w-full sm:w-auto">Cancelar</Button>
              </SheetClose>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading
                  ? isEditing ? "Atualizando..." : "Criando OS..."
                  : isEditing ? "Atualizar OS" : "Criar Ordem de Serviço"}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
