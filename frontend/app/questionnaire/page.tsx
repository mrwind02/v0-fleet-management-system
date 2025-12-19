"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/authStore"
import { MainLayout } from "../../components/layout/MainLayout"
import { questionnaireService, driverService } from "../../services/api"

export default function QuestionnairePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<any>(null)
  const [lastResponse, setLastResponse] = useState<any>(null)
  const [gpsEnabled, setGpsEnabled] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const loadData = async () => {
      if (user?.id && user?.role === "driver") {
        try {
          const vehicleResponse = await driverService.getCurrentVehicle(user.id)
          setCurrentVehicle(vehicleResponse.data.data)

          const lastResp = await questionnaireService.getLatest(user.id)
          setLastResponse(lastResp.data.data)
        } catch (error) {
          console.error("Error loading data:", error)
        }
      }
    }

    loadData()
  }, [user])

  const handleResponse = async (status: "driving" | "stopped") => {
    setIsLoading(true)

    try {
      let gpsLatitude: number | undefined
      let gpsLongitude: number | undefined

      if (status === "driving" && gpsEnabled) {
        if (navigator.geolocation) {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition((position) => {
              gpsLatitude = position.coords.latitude
              gpsLongitude = position.coords.longitude
              resolve()
            })
          })
        }
      }

      const response = await questionnaireService.record({
        driverId: user?.id,
        vehicleId: currentVehicle?.id,
        status,
        gpsLatitude,
        gpsLongitude,
        timestamp: new Date().toISOString(),
      })

      setLastResponse(response.data.data)
      alert(`Status registrado: ${status === "driving" ? "Rodando" : "Parado"}`)
    } catch (error: any) {
      console.error(error)
      alert(error.response?.data?.error || "Erro ao registrar status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo, {user?.name}!</h2>
            {currentVehicle && (
              <p className="text-gray-600">
                Veículo Atual: <span className="font-semibold">{currentVehicle.plate}</span> - {currentVehicle.brand}{" "}
                {currentVehicle.model}
              </p>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="gpsEnabled"
                checked={gpsEnabled}
                onChange={(e) => setGpsEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="gpsEnabled" className="ml-2 text-sm text-gray-700">
                Permitir coleta de GPS quando rodando
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleResponse("driving")}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition text-lg"
            >
              {isLoading ? "Registrando..." : "🚚 Estou Rodando"}
            </button>

            <button
              onClick={() => handleResponse("stopped")}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition text-lg"
            >
              {isLoading ? "Registrando..." : "⏸️ Estou Parado"}
            </button>
          </div>

          {lastResponse && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Último status registrado:</strong>{" "}
                {new Date(lastResponse.timestampResponse).toLocaleString("pt-BR")}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Status:</strong> {lastResponse.status === "driving" ? "Rodando" : "Parado"}
              </p>
              {lastResponse.gpsLatitude && (
                <p className="text-sm text-gray-700">
                  <strong>Localização:</strong> {lastResponse.gpsLatitude.toFixed(4)},{" "}
                  {lastResponse.gpsLongitude.toFixed(4)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Histórico de Atividades</h2>
          <HistoryList user={user} refreshTrigger={lastResponse} />
        </div>
      </div>
    </MainLayout>
  )
}

function HistoryList({ user, refreshTrigger }: { user: any, refreshTrigger: any }) {
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      questionnaireService.getByDriver(user.id, 10).then(res => {
        setHistory(res.data.data)
      }).catch(console.error)
    }
  }, [user, refreshTrigger])

  if (history.length === 0) return <p className="text-gray-500">Nenhum histórico recente.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
          <tr>
            <th className="py-2 px-3">Data/Hora</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Localização?</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {history.map((item: any) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-2 px-3">{new Date(item.timestampResponse).toLocaleString("pt-BR")}</td>
              <td className="py-2 px-3">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.status === 'driving' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {item.status === 'driving' ? 'Rodando' : 'Parado'}
                </span>
              </td>
              <td className="py-2 px-3 text-gray-500">
                {item.gpsLatitude ? 'Sim' : 'Não'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
