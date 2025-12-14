"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { driverService } from "../../services/api"

interface DriverFormProps {
  onSuccess?: () => void
  initialData?: any
}

export function DriverForm({ onSuccess, initialData }: DriverFormProps) {
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
        await driverService.update(initialData.id, data)
      } else {
        await driverService.create(data)
      }
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao salvar motorista")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            type="text"
            placeholder="João Silva"
            {...register("name", { required: "Nome é obrigatório" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <span className="text-red-600 text-sm">{String(errors.name.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CNH *</label>
          <input
            type="text"
            placeholder="12345678901"
            {...register("cnhNumber", { required: "CNH é obrigatória" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.cnhNumber && <span className="text-red-600 text-sm">{String(errors.cnhNumber.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria da CNH *</label>
          <select
            {...register("cnhCategory", { required: "Categoria é obrigatória" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma categoria</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="ADIVT">ADI VT</option>
          </select>
          {errors.cnhCategory && <span className="text-red-600 text-sm">{String(errors.cnhCategory.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Validade da CNH *</label>
          <input
            type="date"
            {...register("cnhExpiryDate", { required: "Validade é obrigatória" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.cnhExpiryDate && <span className="text-red-600 text-sm">{String(errors.cnhExpiryDate.message)}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input
            type="tel"
            placeholder="11999999999"
            {...register("phone")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="joao@email.com"
            {...register("email")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="specialLoad"
          {...register("specialLoadCertified")}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="specialLoad" className="ml-2 text-sm text-gray-700">
          Habilitado para cargas especiais
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          {...register("isActive")}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          Motorista Ativo
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Motorista"}
      </button>
    </form>
  )
}
