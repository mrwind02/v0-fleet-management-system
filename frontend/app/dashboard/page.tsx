"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { reportService } from "@/services/api"
import { MainLayout } from "@/components/layout/MainLayout"

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [recentMaintenance, setRecentMaintenance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role !== "driver") {
          const [metricsRes, maintenanceRes] = await Promise.all([
            reportService.getMetrics(),
            reportService.getRecentMaintenance()
          ])
          setMetrics(metricsRes.data.data)
          setRecentMaintenance(maintenanceRes.data.data)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900" style={{ marginBottom: '3mm' }}>Dashboard</h1>

        {user?.role !== "driver" && (
          <>
            {isLoading ? (
              <div className="text-center text-gray-600 py-20 bg-white rounded-xl shadow-sm">Carregando métricas...</div>
            ) : metrics ? (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col justify-between min-h-[200px]" style={{ padding: '5mm' }}>
                    <div>
                      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Veículos Ativos</h3>
                      <p className="text-5xl font-black text-blue-600 mt-4 tracking-tight">{metrics.activeVehicles}</p>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Em operação
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col justify-between min-h-[200px]" style={{ padding: '5mm' }}>
                    <div>
                      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Motoristas Ativos</h3>
                      <p className="text-5xl font-black text-indigo-600 mt-4 tracking-tight">{metrics.activeDrivers}</p>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-indigo-600 font-medium bg-indigo-50 w-fit px-2 py-1 rounded-full">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      Registrados
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col justify-between min-h-[200px]" style={{ padding: '5mm' }}>
                    <div>
                      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Manutenções Hoje</h3>
                      <p className="text-5xl font-black text-orange-500 mt-4 tracking-tight">{metrics.maintenancesToday}</p>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-orange-600 font-medium bg-orange-50 w-fit px-2 py-1 rounded-full">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Agendadas
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col justify-between min-h-[200px]" style={{ padding: '5mm' }}>
                    <div>
                      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">KM Total</h3>
                      <p className="text-5xl font-black text-purple-600 mt-4 tracking-tight">
                        {(metrics.totalKilometers / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-purple-600 font-medium bg-purple-50 w-fit px-2 py-1 rounded-full">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Rodados
                    </div>
                  </div>
                </div>

                {/* Bottom Section: 70/30 Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                  {/* Left Column (70%) - Recent Maintenance */}
                  <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">Últimas Manutenções</h3>
                      <a href="/maintenance" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Ver todas</a>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estabelecimento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {recentMaintenance.length > 0 ? (
                            recentMaintenance.map((item: any) => (
                              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {new Date(item.maintenance_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.establishment_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.maintenance_type === 'preventiva'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                    }`}>
                                    {item.maintenance_type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                  {item.cost ? `R$ ${Number(item.cost).toFixed(2)}` : '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                                Nenhuma manutenção recente registrada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column (30%) - Status/Info */}
                  <div className="lg:col-span-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg text-white p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Frota Segura</h3>
                      <p className="text-blue-100 text-sm mb-6">
                        Mantenha as manutenções preventivas em dia para garantir a segurança dos motoristas e reduzir custos operacionais.
                      </p>

                      <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                          <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Próxima Revisão Geral</p>
                          <p className="text-lg font-bold mt-1">15/12/2025</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                          <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Eficiência da Frota</p>
                          <p className="text-lg font-bold mt-1">98.5%</p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full mt-6 bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                      Gerar Relatório Completo
                    </button>
                  </div>
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
