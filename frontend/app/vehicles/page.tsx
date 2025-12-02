"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { VehicleForm } from "@/components/vehicles/VehicleForm"
import { VehicleList } from "@/components/vehicles/VehicleList"

export default function VehiclesPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setShowForm(false)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {showForm ? "Listar" : "Novo Veículo"}
          </button>
        </div>

        {showForm ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <VehicleForm onSuccess={handleSuccess} />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <VehicleList key={refreshKey} />
          </div>
        )}
      </div>
    </MainLayout>
  )
}
