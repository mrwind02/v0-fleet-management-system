"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "../../store/authStore"
import { authService } from "../../services/api"

import { FrotaOneLogo } from "@/components/ui/FrotaOneLogo"

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
      if (err.response?.status !== 401) {
        console.error("[v0] Login error:", err)
      }

      const statusCode = err.response?.status
      const rawMessage = err.response?.data?.error || err.response?.data?.message || err.message || ""

      if (
        statusCode === 401 ||
        statusCode === 400 ||
        rawMessage.toLowerCase().includes("invalid") ||
        rawMessage.toLowerCase().includes("credentials") ||
        rawMessage.toLowerCase().includes("senha") ||
        rawMessage.toLowerCase().includes("unauthorized")
      ) {
        setError("E-mail ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.")
      } else if (!err.response) {
        setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.")
      } else {
        setError(rawMessage || "Erro ao fazer login. Verifique suas credenciais.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden font-sans p-4">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-600/15 blur-[130px] rounded-full pointer-events-none -z-0" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl p-8 sm:p-10 shadow-slate-200/50 dark:shadow-blue-950/50 space-y-6">
          <div className="flex justify-center mb-6">
            <FrotaOneLogo variant="default" size="lg" showTagline={true} className="dark:hidden" />
            <FrotaOneLogo variant="dark" size="lg" showTagline={true} className="hidden dark:flex" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-xs space-y-0.5">
                <p className="font-bold text-red-700 dark:text-red-300">Falha ao Entrar</p>
                <p className="font-mono">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu.email@empresa.com"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? "Conectando..." : "Entrar no Sistema"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col space-y-2 font-medium">
            <p>
              <Link href="/recover" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Esqueceu sua senha?
              </Link>
            </p>
            <p>
              Não tem uma conta?{" "}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors">
                Crie sua conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
