"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { MaintenanceForm } from "@/components/maintenance/MaintenanceForm"
import { vehicleService, maintenanceService } from "@/services/api"

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehicleService.getAll(true)
        setVehicles(response.data.data)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
      }
    }

    fetchVehicles()
  }, [])

  useEffect(() => {
    if (selectedVehicle) {
      const fetchMaintenance = async () => {
        try {
          const response = await maintenanceService.getByVehicle(selectedVehicle)
          setMaintenanceRecords(response.data.data)
        } catch (error) {
          console.error("Error fetching maintenance:", error)
        }
      }

      fetchMaintenance()
    }
  }, [selectedVehicle])

  const handleSuccess = () => {
    setShowForm(false)
    if (selectedVehicle) {
      const fetchMaintenance = async () => {
        try {
          const response = await maintenanceService.getByVehicle(selectedVehicle)
          setMaintenanceRecords(response.data.data)
        } catch (error) {
          console.error("Error fetching maintenance:", error)
        }
      }
      fetchMaintenance()
    }
  }

  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900" style={{ marginBottom: '3mm' }}>Manutenção</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um Veículo</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Selecione um veículo --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} - {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>

        {selectedVehicle && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {showForm ? "Cancelar" : "Registrar Manutenção"}
              </button>
            </div>

            {showForm && (
              <div className="bg-white p-6 rounded-lg shadow">
                <MaintenanceForm vehicleId={selectedVehicle} onSuccess={handleSuccess} />
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Histórico de Manutenção</h2>
              {maintenanceRecords.length === 0 ? (
                <p className="text-gray-600">Nenhum registro de manutenção encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estabelecimento</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Custo</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">KM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {maintenanceRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(record.maintenanceDate).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${record.maintenanceType === "preventiva"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {record.maintenanceType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.establishmentName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.cost ? `R$ ${Number(record.cost).toFixed(2)}` : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.odometerReading || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout >
  )
}
