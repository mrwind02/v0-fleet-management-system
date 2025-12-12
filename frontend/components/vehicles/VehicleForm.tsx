"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { vehicleService } from "@/services/api"

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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Placa <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="ABC1234"
            {...register("plate", { required: "Placa é obrigatória" })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {errors.plate && <span className="text-red-500 text-xs mt-1">{String(errors.plate.message)}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">RENAVAM</label>
          <input
            type="text"
            placeholder="12345678901"
            {...register("renavam")}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Marca <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Volvo"
            {...register("brand", { required: "Marca é obrigatória" })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {errors.brand && <span className="text-red-500 text-xs mt-1">{String(errors.brand.message)}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Modelo <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="FH16"
            {...register("model", { required: "Modelo é obrigatório" })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {errors.model && <span className="text-red-500 text-xs mt-1">{String(errors.model.message)}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Ano <span className="text-red-500">*</span></label>
          <input
            type="number"
            placeholder="2024"
            {...register("year", { required: "Ano é obrigatório" })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {errors.year && <span className="text-red-500 text-xs mt-1">{String(errors.year.message)}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Cor</label>
          <input
            type="text"
            placeholder="Branco"
            {...register("color")}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Número do Chassi <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="ABC123456789DEF"
            {...register("chassisNumber", { required: "Número do chassi é obrigatório" })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {errors.chassisNumber && <span className="text-red-500 text-xs mt-1">{String(errors.chassisNumber.message)}</span>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Capacidade de Carga (kg)</label>
          <input
            type="number"
            placeholder="25000"
            {...register("loadCapacity")}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Observações</label>
        <textarea
          placeholder="Adicione observações sobre o veículo"
          {...register("observations")}
          rows={4}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          {isLoading ? "Salvando..." : initialData ? "Atualizar Veículo" : "Criar Veículo"}
        </button>
      </div>
    </form>
  )
}
