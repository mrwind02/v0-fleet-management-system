"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { maintenanceService } from "../../services/api"

interface MaintenanceFormProps {
  vehicleId: string
  onSuccess?: () => void
}

export function MaintenanceForm({ vehicleId, onSuccess }: MaintenanceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const parseFormattedNumber = (value: any) => {
    if (!value) return undefined
    const stringValue = String(value).replace(",", ".")
    return Number.parseFloat(stringValue)
  }

  const onSubmit = async (data: any) => {
    setError("")
    setIsLoading(true)

    try {
      // Fix date offset: create date at noon local time to avoid timezone issues
      const [year, month, day] = data.maintenanceDate.split('-')
      const localDate = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0)

      await maintenanceService.create({
        vehicleId,
        maintenanceDate: localDate,
        maintenanceType: data.maintenanceType,
        mechanicName: data.mechanicName,
        establishmentName: data.establishmentName,
        serviceDescription: data.serviceDescription,
        cost: parseFormattedNumber(data.cost),
        odometerReading: parseFormattedNumber(data.odometerReading),
      })
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao registrar manutenção")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data da Manutenção *</label>
          <input
            type="date"
            {...register("maintenanceDate", { required: "Data é obrigatória" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.maintenanceDate && (
            <span className="text-red-600 text-sm">{String(errors.maintenanceDate.message)}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Manutenção *</label>
          <select
            {...register("maintenanceType", { required: "Tipo é obrigatório" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um tipo</option>
            <option value="preventiva">Preventiva</option>
            <option value="corretiva">Corretiva</option>
          </select>
          {errors.maintenanceType && (
            <span className="text-red-600 text-sm">{String(errors.maintenanceType.message)}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Mecânico *</label>
          <input
            type="text"
            placeholder="Carlos Silva"
            {...register("mechanicName", { required: "Nome do mecânico é obrigatório" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.mechanicName && <span className="text-red-600 text-sm">{String(errors.mechanicName.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estabelecimento *</label>
          <input
            type="text"
            placeholder="Oficina ABC"
            {...register("establishmentName", { required: "Estabelecimento é obrigatório" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.establishmentName && (
            <span className="text-red-600 text-sm">{String(errors.establishmentName.message)}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$)</label>
          <input
            type="text"
            placeholder="500,00"
            {...register("cost")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quilometragem</label>
          <input
            type="text"
            placeholder="150000,5"
            {...register("odometerReading")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço *</label>
        <textarea
          placeholder="Descreva os serviços realizados..."
          {...register("serviceDescription", { required: "Descrição é obrigatória" })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.serviceDescription && (
          <span className="text-red-600 text-sm">{String(errors.serviceDescription.message)}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        {isLoading ? "Registrando..." : "Registrar Manutenção"}
      </button>
    </form>
  )
}
