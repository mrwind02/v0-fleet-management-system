"use client"

import { useState } from "react"
import { MainLayout } from "../../components/layout/MainLayout"
import { VehicleForm } from "../../components/vehicles/VehicleForm"
import { VehicleList } from "../../components/vehicles/VehicleList"

import { VehicleAssignmentModal } from "../../components/vehicles/VehicleAssignmentModal"

export default function VehiclesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  const [assigningVehicle, setAssigningVehicle] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setShowForm(false)
    setEditingVehicle(null)
    setRefreshKey((prev) => prev + 1)
  }

  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setShowForm(true)
  }

  const handleAssign = (vehicle: any) => {
    setAssigningVehicle(vehicle)
  }

  const handleAssignSuccess = () => {
    setAssigningVehicle(null)
    setRefreshKey((prev) => prev + 1)
    alert("Motorista atribuído com sucesso!")
  }

  const toggleForm = () => {
    if (showForm) {
      setShowForm(false)
      setEditingVehicle(null)
    } else {
      setShowForm(true)
      setEditingVehicle(null)
    }
  }

  return (
    <MainLayout>
      <div>
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            </h2>
            <VehicleForm onSuccess={handleSuccess} initialData={editingVehicle} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <VehicleList
            key={refreshKey}
            onEdit={handleEdit}
            onAssign={handleAssign}
          />
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) { // If form was visible, it's now closing, so clear editingVehicle
              setEditingVehicle(null);
            }
          }}
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
              <span>Adicionar Veículo</span>
            </>
          )}
        </button>

        {assigningVehicle && (
          <VehicleAssignmentModal
            vehicleId={assigningVehicle.id}
            vehiclePlate={assigningVehicle.plate}
            onClose={() => setAssigningVehicle(null)}
            onSuccess={handleAssignSuccess}
          />
        )}
      </div>
    </MainLayout>
  )
}
