"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "../../components/layout/MainLayout"
import { MaintenanceForm } from "../../components/maintenance/MaintenanceForm"
import { EditMaintenanceModal } from "../../components/maintenance/EditMaintenanceModal"
import { vehicleService, maintenanceService } from "../../services/api"
import { Search, Edit2 } from "lucide-react"

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // All maintenance list states
  const [allMaintenance, setAllMaintenance] = useState<any[]>([])
  const [filteredMaintenance, setFilteredMaintenance] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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
    fetchAllMaintenance()
  }, [])

  const fetchAllMaintenance = async () => {
    try {
      const response = await maintenanceService.getAll()
      setAllMaintenance(response.data.data)
      setFilteredMaintenance(response.data.data)
    } catch (error) {
      console.error("Error fetching all maintenance:", error)
    }
  }

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

  useEffect(() => {
    // Filter maintenance based on search term
    const filtered = allMaintenance.filter((record) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        record.plate?.toLowerCase().includes(searchLower) ||
        record.maintenanceType?.toLowerCase().includes(searchLower) ||
        record.establishmentName?.toLowerCase().includes(searchLower)
      )
    })
    setFilteredMaintenance(filtered)
    setCurrentPage(1) // Reset to first page when searching
  }, [searchTerm, allMaintenance])

  const handleSuccess = () => {
    setShowForm(false)
    fetchAllMaintenance() // Refresh all maintenance list
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

  // Pagination logic
  const totalPages = Math.ceil(filteredMaintenance.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentMaintenance = filteredMaintenance.slice(startIndex, endIndex)

  return (
    <MainLayout>
      <div>
        <div className="bg-white p-5 rounded-lg shadow-sm mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um Veículo</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os veículos</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} - {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition shadow-sm hover:shadow-md"
          >
            {showForm ? "✕ Cancelar" : "+ Registrar Manutenção"}
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
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
                        {record.cost ? `R$ ${Number(record.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.odometerReading ? Number(record.odometerReading).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setEditingId(record.id)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Editar"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* All Maintenance List - Only show when no vehicle is selected */}
        {!selectedVehicle && (
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Todas as Manutenções</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por placa, tipo ou estabelecimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-80"
                  />
                </div>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>
            </div>

            {filteredMaintenance.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                {searchTerm ? "Nenhuma manutenção encontrada com os critérios de busca." : "Nenhuma manutenção registrada."}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Veículo</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estabelecimento</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Custo</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">KM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentMaintenance.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(record.maintenanceDate).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.plate}</td>
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
                            {record.cost ? `R$ ${Number(record.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.odometerReading ? Number(record.odometerReading).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredMaintenance.length)} de {filteredMaintenance.length} registros
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-lg ${currentPage === page
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {
        editingId && (
          <EditMaintenanceModal
            maintenanceId={editingId}
            onClose={() => setEditingId(null)}
            onSuccess={() => {
              setEditingId(null)
              fetchAllMaintenance()
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
            }}
          />
        )
      }
    </MainLayout>
  )
}
