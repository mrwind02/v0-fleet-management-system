"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { DriverForm } from "@/components/drivers/DriverForm"

interface Driver {
  id: string
  name: string
  cnhNumber: string
  cnhCategory: string
  cnhExpiryDate: string
  phone?: string
  email?: string
}

export default function DriversPage() {
  const [showForm, setShowForm] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setShowForm(false)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Motoristas</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {showForm ? "Listar" : "Novo Motorista"}
          </button>
        </div>

        {showForm ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <DriverForm onSuccess={handleSuccess} />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Selecione "Novo Motorista" para adicionar um motorista.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
