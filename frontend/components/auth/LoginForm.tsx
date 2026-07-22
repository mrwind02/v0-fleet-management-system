"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "../../store/authStore"
import { authService } from "../../services/api"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setDebugInfo("")
    setIsLoading(true)

    try {
      console.log("[v0] Login attempt with email:", email)
      console.log("[v0] Email length:", email.length)
      console.log("[v0] Email trimmed:", email.trim())
      console.log("[v0] Password length:", password.length)
      console.log("[v0] Password first 3 chars:", password.substring(0, 3))
      console.log("[v0] Password last 3 chars:", password.substring(password.length - 3))
      setDebugInfo(`Tentando conectar em ${process.env.NEXT_PUBLIC_API_URL}/auth/login`)

      const response = await authService.login(email, password)
      console.log("[v0] Login response:", response.data)

      const { user, accessToken, refreshToken } = response.data.data

      console.log("[v0] Storing user data:", user)
      login(accessToken, refreshToken, user)

      setDebugInfo("Login bem-sucedido! Redirecionando...")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("[v0] Login error:", err)

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao fazer login. Verifique suas credenciais."

      const statusCode = err.response?.status || "Desconhecido"

      console.error("[v0] Error details:", {
        status: statusCode,
        message: errorMessage,
        fullError: err.response?.data || err.message,
      })

      setError(`[${statusCode}] ${errorMessage}`)
      setDebugInfo(
        `Erro ao conectar em ${process.env.NEXT_PUBLIC_API_URL}/auth/login\nStatus: ${statusCode}\nVerifique o console para mais detalhes.`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">FrotaOne</h1>
          <p className="text-center text-gray-600 mb-6">Gerenciamento de Frota</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                <p className="font-semibold">Erro</p>
                <p className="font-mono text-xs mt-1">{error}</p>
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

          <div className="mt-6 text-center text-sm text-gray-600 flex flex-col space-y-2">
            <p>
              <Link href="/recover" className="text-blue-600 hover:text-blue-800 font-medium">
                Esqueceu sua senha?
              </Link>
            </p>
            <p>
              Não tem uma conta?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Crie sua conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>

  )
}
