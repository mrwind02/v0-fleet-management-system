"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService, settingsService } from "../../services/api"

export function RegisterForm() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("driver")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [allowAdminRegister, setAllowAdminRegister] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    useEffect(() => {
        settingsService.getPublic("allow_admin_register")
            .then((res) => setAllowAdminRegister(res.data.allowed))
            .catch((err) => console.error("Failed to check admin settings", err))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setIsLoading(true)

        try {
            await authService.register(email, password, name, role)
            setSuccess("Conta criada com sucesso! Redirecionando para o login...")

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (err: any) {
            console.error("Registration error:", err)
            setError(
                err.response?.data?.error ||
                "Erro ao criar conta. Tente novamente."
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
                    <p className="text-center text-gray-600 mb-6">Crie sua conta</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                <p className="font-semibold">Erro</p>
                                <p className="text-xs mt-1">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                                <p className="font-semibold">Sucesso!</p>
                                <p className="text-xs mt-1">{success}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="driver">Motorista</option>
                                <option value="manager">Gestor</option>
                                {allowAdminRegister && <option value="admin">Administrador</option>}
                            </select>
                        </div>

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
                            {isLoading ? "Criando conta..." : "Registrar"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600 flex flex-col space-y-2">
                        <p>
                            Já tem uma conta?{" "}
                            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                                Faça login
                            </Link>
                        </p>
                        <p>
                            Já tem conta, mas <Link href="/recover" className="text-blue-600 hover:text-blue-800 font-medium">esqueceu a senha?</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
