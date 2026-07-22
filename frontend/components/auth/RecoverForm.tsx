"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "../../services/api"

export function RecoverForm() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      await authService.recoverAccount(email, newPassword)
      setSuccess("Senha atualizada com sucesso! Você pode fazer o login agora.")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      console.error("Recovery error:", err)
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao recuperar a conta. Verifique os dados fornecidos."
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">FrotaOne</h1>
          <p className="text-center text-gray-600 mb-6">Recuperação de Conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                <p className="font-semibold">Erro</p>
                <p className="font-mono text-xs mt-1">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                <p className="font-semibold">Sucesso</p>
                <p className="text-xs mt-1">{success}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Cadastrado</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="No mínimo 6 caracteres"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {isLoading ? "Processando..." : "Redefinir Senha"}
            </button>
          </form>

          <div className="mt-6 text-center flex flex-col space-y-2 text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
