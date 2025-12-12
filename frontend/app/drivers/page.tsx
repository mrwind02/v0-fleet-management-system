"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { DriverList } from "@/components/drivers/DriverList"
import { DriverForm } from "@/components/drivers/DriverForm"

export default function DriversPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setShowForm(false)
    setEditingDriver(null)
    setRefreshKey((prev) => prev + 1)
  }

  const handleEdit = (driver: any) => {
    setEditingDriver(driver)
    setShowForm(true)
  }

  const toggleForm = () => {
    if (showForm) {
      setShowForm(false)
      setEditingDriver(null)
    } else {
      setShowForm(true)
      setEditingDriver(null)
    }
  }

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center" style={{ marginBottom: '3mm' }}>
          <h1 className="text-3xl font-bold text-gray-900">Motoristas</h1>
          <button
            onClick={toggleForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {showForm ? "Listar" : "Novo Motorista"}
          </button>
        </div>

        {showForm ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingDriver ? 'Editar Motorista' : 'Novo Motorista'}
            </h2>
            <DriverForm onSuccess={handleSuccess} initialData={editingDriver} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <DriverList key={refreshKey} onEdit={handleEdit} />
          </div>
        )}
      </div>
    </MainLayout>
  )
}
