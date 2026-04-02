"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface MaintenanceRecord {
  id: string
  vehicle_id: string
  establishment_name?: string
  maintenance_date: string
  mechanic_name?: string
  maintenance_type: string
  service_description: string
  cost: number
  odometer_reading?: number
  vehicle_plate?: string
  vehicle_brand?: string
  vehicle_model?: string
}

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
}

export default function MaintenancePage() {
  const router = useRouter()
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vehicle_id: "",
    establishment_name: "",
    maintenance_date: new Date().toISOString().split("T")[0],
    mechanic_name: "",
    maintenance_type: "preventiva",
    service_description: "",
    cost: "",
    odometer_reading: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/")
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [maintenanceRes, vehiclesRes] = await Promise.all([
        fetch("/api/maintenance"),
        fetch("/api/vehicles"),
      ])
      const maintenanceData = await maintenanceRes.json()
      const vehiclesData = await vehiclesRes.json()

      if (maintenanceData.success) setRecords(maintenanceData.data)
      if (vehiclesData.success) setVehicles(vehiclesData.data)
    } catch (err) {
      setError("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
          odometer_reading: formData.odometer_reading ? parseInt(formData.odometer_reading) : null,
        }),
      })
      const data = await response.json()

      if (data.success) {
        fetchData() // Reload to get vehicle info
        setShowForm(false)
        setFormData({
          vehicle_id: "", establishment_name: "",
          maintenance_date: new Date().toISOString().split("T")[0],
          mechanic_name: "", maintenance_type: "preventiva",
          service_description: "", cost: "", odometer_reading: "",
        })
      } else {
        setError(data.error || "Erro ao cadastrar manutencao")
      }
    } catch (err) {
      setError("Erro ao conectar com a API")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="text-gray-500 hover:text-gray-700">
              &larr; Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Manutencoes</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {showForm ? "Cancelar" : "+ Nova Manutencao"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Registrar Manutencao</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Veiculo *</label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="preventiva">Preventiva</option>
                  <option value="corretiva">Corretiva</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  value={formData.maintenance_date}
                  onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estabelecimento</label>
                <input
                  type="text"
                  value={formData.establishment_name}
                  onChange={(e) => setFormData({ ...formData, establishment_name: e.target.value })}
                  placeholder="Nome da oficina"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mecanico</label>
                <input
                  type="text"
                  value={formData.mechanic_name}
                  onChange={(e) => setFormData({ ...formData, mechanic_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KM no Atendimento</label>
                <input
                  type="number"
                  value={formData.odometer_reading}
                  onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao do Servico *</label>
                <textarea
                  value={formData.service_description}
                  onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Descreva o servico realizado..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
                >
                  {submitting ? "Salvando..." : "Salvar Manutencao"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veiculo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descricao</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma manutencao registrada. Clique em "+ Nova Manutencao" para adicionar.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{r.vehicle_plate} - {r.vehicle_brand} {r.vehicle_model}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${r.maintenance_type === "preventiva" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {r.maintenance_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(r.maintenance_date).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{r.service_description}</td>
                    <td className="px-6 py-4">R$ {Number(r.cost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">{r.odometer_reading ? r.odometer_reading.toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
