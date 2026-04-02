"use client"

import { useEffect, useState } from "react"
import { vehicleService } from "@/services/api"

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  loadCapacity?: number
}

export function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
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

    fetchVehicles()
  }, [])

  if (isLoading) return <div className="text-center text-gray-600">Carregando...</div>
  if (error) return <div className="text-center text-red-600">{error}</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Placa</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Marca</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Modelo</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ano</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Capacidade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{vehicle.plate}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{vehicle.brand}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{vehicle.model}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{vehicle.year}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{vehicle.loadCapacity} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
