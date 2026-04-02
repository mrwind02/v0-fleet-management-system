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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
          <input
            type="text"
            placeholder="ABC1234"
            {...register("plate", { required: "Placa é obrigatória" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.plate && <span className="text-red-600 text-sm">{String(errors.plate.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RENAVAM</label>
          <input
            type="text"
            placeholder="12345678901"
            {...register("renavam")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
          <input
            type="text"
            placeholder="Volvo"
            {...register("brand", { required: "Marca é obrigatória" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.brand && <span className="text-red-600 text-sm">{String(errors.brand.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
          <input
            type="text"
            placeholder="FH16"
            {...register("model", { required: "Modelo é obrigatório" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.model && <span className="text-red-600 text-sm">{String(errors.model.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano *</label>
          <input
            type="number"
            placeholder="2024"
            {...register("year", { required: "Ano é obrigatório" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.year && <span className="text-red-600 text-sm">{String(errors.year.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
          <input
            type="text"
            placeholder="Branco"
            {...register("color")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número do Chassi *</label>
          <input
            type="text"
            placeholder="ABC123456789DEF"
            {...register("chassisNumber", { required: "Número do chassi é obrigatório" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.chassisNumber && <span className="text-red-600 text-sm">{String(errors.chassisNumber.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade de Carga (kg)</label>
          <input
            type="number"
            placeholder="25000"
            {...register("loadCapacity")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
        <textarea
          placeholder="Adicione observações sobre o veículo"
          {...register("observations")}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Veículo"}
      </button>
    </form>
  )
}
