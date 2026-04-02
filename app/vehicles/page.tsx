"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Vehicle {
  id: string
  plate: string
  renavam?: string
  brand: string
  model: string
  year?: number
  color?: string
  transport_type: string
  chassis_number?: string
  load_capacity?: number
  observations?: string
  is_active: boolean
  created_at: string
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    plate: "",
    renavam: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    chassis_number: "",
    load_capacity: "",
    observations: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/")
      return
    }
    fetchVehicles()
  }, [router])

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles")
      const data = await response.json()
      if (data.success) {
        setVehicles(data.data)
      }
    } catch (err) {
      setError("Erro ao carregar veiculos")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? parseInt(formData.year) : null,
          load_capacity: formData.load_capacity ? parseFloat(formData.load_capacity) : null,
          transport_type: "Rodoviario",
        }),
      })
      const data = await response.json()

      if (data.success) {
        setVehicles([data.data, ...vehicles])
        setShowForm(false)
        setFormData({
          plate: "", renavam: "", brand: "", model: "", year: "",
          color: "", chassis_number: "", load_capacity: "", observations: "",
        })
      } else {
        setError(data.error || "Erro ao cadastrar veiculo")
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
            <h1 className="text-2xl font-bold text-gray-900">Veiculos</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {showForm ? "Cancelar" : "+ Novo Veiculo"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Cadastrar Veiculo</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                <input
                  type="text"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  required
                  placeholder="ABC-1234"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RENAVAM</label>
                <input
                  type="text"
                  value={formData.renavam}
                  onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  placeholder="Volvo"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  placeholder="FH 540"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Branco"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chassi</label>
                <input
                  type="text"
                  value={formData.chassis_number}
                  onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade de Carga (kg)</label>
                <input
                  type="number"
                  value={formData.load_capacity}
                  onChange={(e) => setFormData({ ...formData, load_capacity: e.target.value })}
                  placeholder="40000"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
                >
                  {submitting ? "Salvando..." : "Salvar Veiculo"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veiculo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum veiculo cadastrado. Clique em "+ Novo Veiculo" para adicionar.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{v.plate}</td>
                    <td className="px-6 py-4">{v.brand} {v.model}</td>
                    <td className="px-6 py-4">{v.year || "-"}</td>
                    <td className="px-6 py-4">{v.color || "-"}</td>
                    <td className="px-6 py-4">{v.load_capacity ? `${v.load_capacity.toLocaleString()} kg` : "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${v.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {v.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
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
