"use client"

import React, { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { fuelService, vehicleService, driverService } from "@/services/api"
import { UploadArea } from "@/components/ui/upload-area"

interface FuelFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  defaultVehicleId?: string
  editData?: any
}

export function FuelFormSheet({ open, onOpenChange, onSuccess, defaultVehicleId, editData }: FuelFormSheetProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      vehicleId: defaultVehicleId || "",
      driverId: "",
      fuelDate: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].slice(0, 5),
      gasStationName: "",
      city: "",
      uf: "",
      fuelType: "diesel",
      liters: "",
      cost: "",
      costPerLiter: "",
      odometerReading: "",
      consumption: "",
      paymentMethod: "cartao_frota",
      costCenter: "",
      fleetCard: "",
      notes: ""
    }
  })

  const selectedVehicleId = watch("vehicleId")
  const liters = watch("liters")
  const cost = watch("cost")
  const odometerReading = watch("odometerReading")

  useEffect(() => {
    vehicleService.getAll().then(res => setVehicles(res.data.data || [])).catch(console.error)
    driverService.getAll().then(res => setDrivers(res.data.data || [])).catch(console.error)
  }, [])

  useEffect(() => {
    if (editData) {
      const d = new Date(editData.fuelDate)
      setValue("vehicleId", editData.vehicleId || "")
      setValue("driverId", editData.driverId || "")
      setValue("fuelDate", d.toISOString().split("T")[0])
      setValue("time", d.toTimeString().split(" ")[0].slice(0, 5))
      setValue("gasStationName", editData.gasStationName || "")
      setValue("city", editData.city || "")
      setValue("uf", editData.uf || "")
      setValue("fuelType", editData.fuelType || "diesel")
      setValue("liters", editData.liters?.toString() || "")
      setValue("cost", editData.cost?.toString() || "")
      setValue("costPerLiter", editData.costPerLiter?.toString() || "")
      setValue("odometerReading", editData.odometerReading?.toString() || "")
      setValue("paymentMethod", editData.paymentMethod || "cartao_frota")
      setValue("costCenter", editData.costCenter || "")
      setValue("fleetCard", editData.fleetCard || "")
      setValue("notes", editData.notes || "")
    } else if (defaultVehicleId) {
      setValue("vehicleId", defaultVehicleId)
    } else {
      reset()
    }
  }, [editData, defaultVehicleId, setValue, reset, open])

  useEffect(() => {
    if (selectedVehicleId && !editData) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId)
      if (vehicle) {
        setValue("fuelType", "diesel") 
        if (vehicle.currentOdometer) {
          setValue("odometerReading", vehicle.currentOdometer.toString())
        }
      }
    }
  }, [selectedVehicleId, vehicles, setValue, editData])

  useEffect(() => {
    if (liters && cost) {
      const l = parseFloat(liters)
      const c = parseFloat(cost)
      if (l > 0) {
        setValue("costPerLiter", (c / l).toFixed(3))
      }
    }
  }, [liters, cost, setValue])

  const onSubmit = async (data: any) => {
    setError("")
    setIsLoading(true)

    try {
      const [year, month, day] = data.fuelDate.split('-')
      const [hour, minute] = data.time.split(':')
      const localDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0)

      const driver = drivers.find(d => d.id === data.driverId)
      
      const litersVal = parseFloat(data.liters)
      const costVal = parseFloat(data.cost)
      const computedCostPerLiter = litersVal > 0 ? costVal / litersVal : 0

      const payload = {
        vehicleId: data.vehicleId,
        driverId: data.driverId || undefined,
        driverName: driver ? driver.name : undefined,
        fuelDate: localDate,
        gasStationName: data.gasStationName,
        city: data.city,
        uf: data.uf,
        fuelType: data.fuelType,
        liters: litersVal,
        cost: costVal,
        costPerLiter: computedCostPerLiter,
        odometerReading: parseFloat(data.odometerReading),
        paymentMethod: data.paymentMethod,
        costCenter: data.costCenter,
        fleetCard: data.fleetCard,
        notes: data.notes
      }

      if (editData && editData.id) {
        await fuelService.update(editData.id, payload)
      } else {
        await fuelService.create(payload)
      }
      
      reset()
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao registrar abastecimento")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="mb-6 px-0">
            <SheetTitle className="text-xl">Novo Abastecimento</SheetTitle>
            <SheetDescription>
              Preencha os dados do cupom fiscal para registrar o abastecimento.
            </SheetDescription>
          </SheetHeader>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Seção 1: Veículo */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">1. Veículo e Motorista</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Veículo *</label>
                  <select
                    {...register("vehicleId", { required: "Obrigatório" })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  >
                    <option value="">Selecione um veículo...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plate} - {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                  {errors.vehicleId && <span className="text-red-500 text-[10px]">{String(errors.vehicleId.message)}</span>}
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Motorista</label>
                  <select
                    {...register("driverId")}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  >
                    <option value="">Selecione um motorista...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Tipo de Combustível *</label>
                  <select
                    {...register("fuelType", { required: "Obrigatório" })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="gasolina">Gasolina</option>
                    <option value="etanol">Etanol</option>
                    <option value="gnv">GNV</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção 2: Informações */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">2. Dados do Cupom</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Data *</label>
                  <input
                    type="date"
                    {...register("fuelDate", { required: "Obrigatório" })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Hora</label>
                  <input
                    type="time"
                    {...register("time")}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Posto *</label>
                  <input
                    type="text"
                    {...register("gasStationName", { required: "Obrigatório" })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    placeholder="Nome do posto"
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Cidade</label>
                  <input
                    type="text"
                    {...register("city")}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    {...register("uf")}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Abastecimento */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">3. Abastecimento</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Litros *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("liters", { required: "Obrigatório" })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("cost", { required: "Obrigatório" })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Valor por Litro</label>
                  <input
                    type="text"
                    value={parseFloat(liters) > 0 && parseFloat(cost) > 0 ? (parseFloat(cost) / parseFloat(liters)).toFixed(3) : ""}
                    readOnly
                    className="w-full px-3 py-2 text-sm bg-muted text-muted-foreground border border-border rounded-lg focus:outline-none"
                    placeholder="Auto-calculado"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Km Atual *</label>
                  <input
                    type="number"
                    step="any"
                    {...register("odometerReading", { required: "Obrigatório" })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Pagamento */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">4. Pagamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Forma de Pagamento</label>
                  <select
                    {...register("paymentMethod")}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  >
                    <option value="cartao_frota">Cartão Frota</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="boleto">Boleto</option>
                    <option value="pix">PIX</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Centro de Custo</label>
                  <input
                    type="text"
                    {...register("costCenter")}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    placeholder="Ex: Operação Sul"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Cartão Frota (ID)</label>
                  <input
                    type="text"
                    {...register("fleetCard")}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            {/* Seção 5: Comprovante */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">5. Comprovante</h3>
              <UploadArea 
                label="Arraste o cupom fiscal ou nota aqui"
                accept=".jpg,.jpeg,.png,.pdf"
                onFileSelect={(file) => console.log('File selected:', file)} 
              />
            </div>

            {/* Seção 6: Observações */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">6. Observações</h3>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg resize-none"
                placeholder="Detalhes adicionais sobre o abastecimento..."
              />
            </div>

            <SheetFooter className="pt-6 border-t px-0 sm:justify-end gap-3 flex-col sm:flex-row">
              <SheetClose asChild>
                <Button variant="outline" type="button" className="w-full sm:w-auto">Cancelar</Button>
              </SheetClose>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? (editData ? "Atualizando..." : "Registrando...") : (editData ? "Atualizar Abastecimento" : "Registrar Abastecimento")}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
