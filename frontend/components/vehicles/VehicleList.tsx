"use client"

import { useEffect, useState } from "react"
import { vehicleService } from "../../services/api"
import { Pencil, Trash2, UserPlus } from "lucide-react"

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  loadCapacity?: number
}

interface VehicleListProps {
  onEdit?: (vehicle: Vehicle) => void
  onAssign?: (vehicle: Vehicle) => void
}

export function VehicleList({ onEdit, onAssign }: VehicleListProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll(true)
      setVehicles(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao carregar veículos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return

    try {
      await vehicleService.delete(id)
      fetchVehicles()
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      alert("Erro ao excluir veículo")
    }
  }

  if (isLoading) return <div className="text-center text-gray-600">Carregando...</div>
  if (error) return <div className="text-center text-red-600">{error}</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motorista</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidade</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{vehicle.plate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vehicle.brand} {vehicle.model}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vehicle.year}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {/* @ts-ignore */}
                {vehicle.driverName ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {/* @ts-ignore */}
                    {vehicle.driverName}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Sem motorista</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vehicle.loadCapacity} kg</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button
                    onClick={() => onAssign?.(vehicle)}
                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                    title="Atribuir Motorista"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit?.(vehicle)}
                    className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
