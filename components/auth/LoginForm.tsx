"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { authService } from "@/services/api"

export function LoginForm() {
  const [email, setEmail] = useState("admin@fleet.com")
  const [password, setPassword] = useState("password123")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [seedLoading, setSeedLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleSeed = async () => {
    setSeedLoading(true)
    setError("")
    setDebugInfo("Criando dados de teste no banco...")
    
    try {
      const response = await fetch("/api/seed", { method: "POST" })
      const data = await response.json()
      
      if (data.success) {
        setDebugInfo(`Seed concluido! ${data.message}`)
      } else {
        setError(data.error || "Erro ao criar dados de teste")
      }
    } catch (err: any) {
      setError("Erro ao conectar com a API de seed")
    } finally {
      setSeedLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setDebugInfo("")
    setIsLoading(true)

    try {
      setDebugInfo("Conectando...")

      const response = await authService.login(email, password)

      const { user, accessToken, refreshToken } = response.data.data

      login(accessToken, refreshToken, user)

      setDebugInfo("Login bem-sucedido! Redirecionando...")
      router.push("/dashboard")
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao fazer login. Verifique suas credenciais."

      const statusCode = err.response?.status || "Desconhecido"

      setError(`[${statusCode}] ${errorMessage}`)
      
      if (statusCode === 401) {
        setDebugInfo("Credenciais invalidas. Clique em 'Criar Dados de Teste' se for a primeira vez usando o sistema.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Fleet Manager</h1>
          <p className="text-center text-gray-600 mb-6">Gerenciamento de Frota</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                <p className="font-semibold">Erro</p>
                <p className="font-mono text-xs mt-1">{error}</p>
              </div>
            )}

            {debugInfo && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm font-mono text-xs whitespace-pre-wrap">
                {debugInfo}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {isLoading ? "Conectando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleSeed}
              disabled={seedLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
            >
              {seedLoading ? "Criando..." : "Criar Dados de Teste (Primeiro Acesso)"}
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
            <p className="font-semibold mb-2">Credenciais de Teste:</p>
            <p>Admin: admin@fleet.com</p>
            <p>Gerente: manager@fleet.com</p>
            <p>Motorista: driver1@fleet.com</p>
            <p>Senha: password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
