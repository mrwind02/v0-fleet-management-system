"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { vehicleService } from "../../services/api"

interface VehicleFormProps {
  onSuccess?: () => void
  initialData?: any
}

export function VehicleForm({ onSuccess, initialData }: VehicleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData,
  })

  const onSubmit = async (data: any) => {
    setError("")
    setIsLoading(true)

    try {
      if (initialData?.id) {
        await vehicleService.update(initialData.id, data)
      } else {
        await vehicleService.create(data)
      }
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao salvar veículo")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-card p-4 rounded-xl shadow-sm border space-y-4 w-full">
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Placa <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="ABC1234"
            {...register("plate", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.plate && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.plate.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">RENAVAM</label>
          <input
            type="text"
            placeholder="12345678901"
            {...register("renavam")}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Marca <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Volvo"
            {...register("brand", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.brand && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.brand.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Modelo <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="FH16"
            {...register("model", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.model && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.model.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Ano <span className="text-red-500">*</span></label>
          <input
            type="number"
            placeholder="2024"
            {...register("year", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.year && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.year.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Cor</label>
          <input
            type="text"
            placeholder="Branco"
            {...register("color")}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Número do Chassi <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="ABC123456789DEF"
            {...register("chassisNumber", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.chassisNumber && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.chassisNumber.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Capacidade de Carga (kg)</label>
          <input
            type="number"
            placeholder="25000"
            {...register("loadCapacity")}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-muted-foreground">Observações</label>
        <textarea
          placeholder="Adicione observações sobre o veículo"
          {...register("observations")}
          rows={2}
          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-6 text-sm rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          {isLoading ? "Salvando..." : initialData ? "Atualizar Veículo" : "Criar Veículo"}
        </button>
      </div>
    </form>
  )
}
