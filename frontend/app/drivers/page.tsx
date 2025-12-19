"use client"

import { useState } from "react"
import { MainLayout } from "../../components/layout/MainLayout"
import { DriverList } from "../../components/drivers/DriverList"
import { DriverForm } from "../../components/drivers/DriverForm"

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

  return (
    <MainLayout>
      <div>
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-4">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingDriver ? 'Editar Motorista' : 'Novo Motorista'}
            </h2>
            <DriverForm onSuccess={handleSuccess} initialData={editingDriver} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DriverList key={refreshKey} onEdit={handleEdit} />
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 z-50"
        >
          {showForm ? (
            <>
              <span className="text-xl">✕</span>
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <span className="text-xl">+</span>
              <span>Adicionar Motorista</span>
            </>
          )}
        </button>
      </div>
    </MainLayout>
  )
}
