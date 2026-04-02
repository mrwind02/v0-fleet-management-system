"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { reportService } from "@/services/api"
import { MainLayout } from "@/components/layout/MainLayout"

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        if (user?.role !== "driver") {
          const response = await reportService.getMetrics()
          setMetrics(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [user])

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {user?.role !== "driver" && (
          <>
            {isLoading ? (
              <div className="text-center text-gray-600">Carregando métricas...</div>
            ) : metrics ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">Veículos Ativos</h3>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{metrics.activeVehicles}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">Motoristas Ativos</h3>
                  <p className="text-4xl font-bold text-green-600 mt-2">{metrics.activeDrivers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">Manutenções Hoje</h3>
                  <p className="text-4xl font-bold text-orange-600 mt-2">{metrics.maintenancesToday}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-600 text-sm font-medium">KM Total</h3>
                  <p className="text-4xl font-bold text-purple-600 mt-2">
                    {(metrics.totalKilometers / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            ) : null}
          </>
        )}

        {user?.role === "driver" && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bem-vindo, {user.name}!</h2>
            <p className="text-gray-600 mb-6">Utilize o menu lateral para acessar suas funções de motorista.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
