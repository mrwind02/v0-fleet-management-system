"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { MainLayout } from "@/components/layout/MainLayout"
import { questionnaireService, driverService } from "@/services/api"

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
      })

      setLastResponse(response.data.data)
      alert(`Status registrado: ${status === "driving" ? "Rodando" : "Parado"}`)
    } catch (error: any) {
      alert("Erro ao registrar status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Status do Motorista</h1>

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
      </div>
    </MainLayout>
  )
}
