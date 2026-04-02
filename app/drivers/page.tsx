"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Driver {
  id: string
  user_id?: string
  name: string
  cnh_number: string
  cnh_category: string
  cnh_expiry_date?: string
  phone?: string
  email?: string
  special_load_certified: boolean
  is_active: boolean
  created_at: string
}

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cnh_number: "",
    cnh_category: "B",
    cnh_expiry_date: "",
    phone: "",
    email: "",
    special_load_certified: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/")
      return
    }
    fetchDrivers()
  }, [router])

  const fetchDrivers = async () => {
    try {
      const response = await fetch("/api/drivers")
      const data = await response.json()
      if (data.success) {
        setDrivers(data.data)
      }
    } catch (err) {
      setError("Erro ao carregar motoristas")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (data.success) {
        setDrivers([data.data, ...drivers])
        setShowForm(false)
        setFormData({
          name: "", cnh_number: "", cnh_category: "B", cnh_expiry_date: "",
          phone: "", email: "", special_load_certified: false,
        })
      } else {
        setError(data.error || "Erro ao cadastrar motorista")
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
            <h1 className="text-2xl font-bold text-gray-900">Motoristas</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {showForm ? "Cancelar" : "+ Novo Motorista"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Cadastrar Motorista</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero CNH *</label>
                <input
                  type="text"
                  value={formData.cnh_number}
                  onChange={(e) => setFormData({ ...formData, cnh_number: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria CNH *</label>
                <select
                  value={formData.cnh_category}
                  onChange={(e) => setFormData({ ...formData, cnh_category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="AB">AB</option>
                  <option value="AC">AC</option>
                  <option value="AD">AD</option>
                  <option value="AE">AE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validade CNH</label>
                <input
                  type="date"
                  value={formData.cnh_expiry_date}
                  onChange={(e) => setFormData({ ...formData, cnh_expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="special_load"
                  checked={formData.special_load_certified}
                  onChange={(e) => setFormData({ ...formData, special_load_certified: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="special_load" className="ml-2 text-sm text-gray-700">
                  Habilitado para cargas especiais
                </label>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
                >
                  {submitting ? "Salvando..." : "Salvar Motorista"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum motorista cadastrado. Clique em "+ Novo Motorista" para adicionar.
                  </td>
                </tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{d.name}</td>
                    <td className="px-6 py-4">{d.cnh_number}</td>
                    <td className="px-6 py-4">{d.cnh_category}</td>
                    <td className="px-6 py-4">
                      {d.cnh_expiry_date ? new Date(d.cnh_expiry_date).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="px-6 py-4">{d.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${d.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {d.is_active ? "Ativo" : "Inativo"}
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
