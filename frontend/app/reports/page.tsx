"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { reportService, vehicleService } from "@/services/api"

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

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

  const handleExportMaintenance = async () => {
    setIsLoading(true)
    try {
      const blob = await reportService.exportMaintenanceCSV({
        vehicleId: selectedVehicle || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "maintenance-report.csv"
      a.click()
    } catch (error) {
      alert("Erro ao exportar relatório")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportQuestionnaire = async () => {
    setIsLoading(true)
    try {
      if (!startDate || !endDate) {
        alert("Selecione um período")
        return
      }

      const blob = await reportService.exportQuestionnaireCSV(startDate, endDate)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "questionnaire-report.csv"
      a.click()
    } catch (error) {
      alert("Erro ao exportar relatório")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900" style={{ marginBottom: '3mm' }}>Relatórios</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Relatório de Manutenção */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Relatório de Manutenção</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Veículo (Opcional)</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleExportMaintenance}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {isLoading ? "Exportando..." : "Exportar CSV"}
              </button>
            </div>
          </div>

          {/* Relatório de Questionário */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Relatório de Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleExportQuestionnaire}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {isLoading ? "Exportando..." : "Exportar CSV"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
