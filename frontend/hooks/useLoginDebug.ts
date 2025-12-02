"use client"

import { useState } from "react"

interface LoginTestResult {
  success: boolean
  status?: number
  message: string
  data?: any
  timestamp: string
}

export function useLoginDebug() {
  const [results, setResults] = useState<LoginTestResult[]>([])

  const testLogin = async (email: string, password: string) => {
    const timestamp = new Date().toISOString()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

    try {
      console.log("[v0] Testing login endpoint:", `${apiUrl}/auth/login`)

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      const result: LoginTestResult = {
        success: response.ok,
        status: response.status,
        message: response.ok ? "Login bem-sucedido" : `Erro: ${data.error || data.message}`,
        data: data,
        timestamp,
      }

      setResults((prev) => [result, ...prev])
      console.log("[v0] Login test result:", result)

      return result
    } catch (error: any) {
      const result: LoginTestResult = {
        success: false,
        message: `Erro de conexão: ${error.message}`,
        data: { error: error.toString() },
        timestamp,
      }

      setResults((prev) => [result, ...prev])
      console.error("[v0] Login test error:", result)

      return result
    }
  }

  const testApiHealth = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

    try {
      const response = await fetch(`${apiUrl.replace("/api", "")}/health`)
      const data = await response.json()
      console.log("[v0] Health check:", data)
      return { ok: response.ok, data }
    } catch (error: any) {
      console.error("[v0] Health check failed:", error)
      return { ok: false, error: error.message }
    }
  }

  return { testLogin, testApiHealth, results }
}
