"use client"

import { useState } from "react"

export default function TestAPIPage() {
    const [result, setResult] = useState<string>("Clique em um botão para começar os testes...")
    const [resultType, setResultType] = useState<"info" | "success" | "error">("info")

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

    const showResult = (message: string, type: "info" | "success" | "error" = "info") => {
        setResult(message)
        setResultType(type)
    }

    const testBackendConnection = async () => {
        showResult("Testando conexão com backend...", "info")
        try {
            const response = await fetch(`${API_URL}/health`)
            const data = await response.json()
            showResult(
                `✅ Backend conectado!\n\nStatus: ${response.status}\nResposta: ${JSON.stringify(data, null, 2)}`,
                "success"
            )
        } catch (error: any) {
            showResult(
                `❌ Erro ao conectar com backend:\n\n${error.message}\n\nAPI_URL: ${API_URL}\n\nVerifique se o backend está rodando`,
                "error"
            )
        }
    }

    const testLogin = async () => {
        showResult("Testando endpoint de login...", "info")
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "admin@fleet.com",
                    password: "password123",
                }),
            })

            const data = await response.json()

            if (response.ok) {
                showResult(
                    `✅ Login bem-sucedido!\n\nStatus: ${response.status}\nResposta: ${JSON.stringify(data, null, 2)}`,
                    "success"
                )
            } else {
                showResult(
                    `⚠️ Endpoint funcionando, mas credenciais inválidas:\n\nStatus: ${response.status}\nResposta: ${JSON.stringify(data, null, 2)}\n\nIsso é NORMAL se você não tiver um usuário admin@fleet.com`,
                    "info"
                )
            }
        } catch (error: any) {
            showResult(
                `❌ Erro ao testar login:\n\n${error.message}\n\nURL testada: ${API_URL}/auth/login`,
                "error"
            )
        }
    }

    const clearStorage = () => {
        localStorage.clear()
        sessionStorage.clear()
        showResult("✅ localStorage e sessionStorage limpos!\n\nAgora você pode fazer login novamente.", "success")
    }

    const checkEnvVar = () => {
        const info =
            `Informações do ambiente:\n\n` +
            `API_URL configurado: ${API_URL}\n` +
            `Origem atual: ${window.location.origin}\n` +
            `localStorage items: ${localStorage.length}\n\n` +
            `Tokens salvos:\n` +
            `- accessToken: ${localStorage.getItem("accessToken") ? "SIM" : "NÃO"}\n` +
            `- refreshToken: ${localStorage.getItem("refreshToken") ? "SIM" : "NÃO"}\n` +
            `- user: ${localStorage.getItem("user") ? "SIM" : "NÃO"}`

        showResult(info, "info")
    }

    const bgColor =
        resultType === "success" ? "bg-green-50 text-green-800" : resultType === "error" ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">🔧 Teste de Conexão com Backend</h1>
                <p className="text-gray-600 mb-6">Use este teste para verificar se o frontend consegue se comunicar com o backend.</p>

                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={testBackendConnection}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        1. Testar Conexão Backend
                    </button>
                    <button
                        onClick={testLogin}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        2. Testar Login
                    </button>
                    <button
                        onClick={clearStorage}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        3. Limpar localStorage
                    </button>
                    <button
                        onClick={checkEnvVar}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        4. Verificar API_URL
                    </button>
                </div>

                <div className={`p-6 rounded-lg font-mono text-sm whitespace-pre-wrap ${bgColor}`}>{result}</div>
            </div>
        </div>
    )
}
