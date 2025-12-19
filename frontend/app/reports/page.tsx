"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "../../components/layout/MainLayout"
import { reportService, vehicleService, driverService } from "../../services/api"

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [selectedDriver, setSelectedDriver] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          vehicleService.getAll(),
          driverService.getAll()
        ])
        setVehicles(vehiclesRes.data.data)
        setDrivers(driversRes.data.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

  const handleExportMaintenance = async () => {
    // ... same as before but include Vehicle in dependency list if needed, actually params are read from state
    setIsLoading(true)
    try {
      const response = await reportService.exportMaintenanceCSV({
        vehicleId: selectedVehicle || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      // ... download logic
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = "maintenance-report.csv"
      a.click()
    } catch (error) {
      alert("Erro ao exportar")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportMaintenancePDF = async () => {
    setIsLoading(true)
    try {
      const response = await reportService.exportMaintenancePDF({
        vehicleId: selectedVehicle || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        timezone: getTimezone()
      })
      // ... download logic
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = "maintenance-report.pdf"
      a.click()
    } catch (error) {
      alert("Erro ao exportar PDF")
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

      const response = await reportService.exportQuestionnaireCSV(
        startDate,
        endDate,
        selectedDriver || undefined
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
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

  const handleExportQuestionnairePDF = async () => {
    setIsLoading(true)
    try {
      if (!startDate || !endDate) {
        alert("Selecione um período")
        return
      }

      const response = await reportService.exportQuestionnairePDF(
        startDate,
        endDate,
        selectedDriver || undefined,
        getTimezone()
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = "questionnaire-report.pdf"
      a.click()
    } catch (error) {
      alert("Erro ao exportar relatório PDF")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Relatório de Manutenção */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Relatório de Manutenção</h2>
            {/* ... fields ... */}
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
              {/* Dates and Buttons */}
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

              <div className="flex space-x-2">
                <button
                  onClick={handleExportMaintenance}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {isLoading ? "..." : "CSV"}
                </button>
                <button
                  onClick={handleExportMaintenancePDF}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {isLoading ? "..." : "PDF"}
                </button>
              </div>
            </div>
          </div>

          {/* Relatório de Questionário */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Relatório de Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motorista (Opcional)</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os motoristas</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

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

              <div className="flex space-x-2">
                <button
                  onClick={handleExportQuestionnaire}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {isLoading ? "..." : "CSV"}
                </button>
                <button
                  onClick={handleExportQuestionnairePDF}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {isLoading ? "..." : "PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
