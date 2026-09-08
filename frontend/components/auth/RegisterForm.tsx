"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService, settingsService } from "../../services/api"
import { FrotaOneLogo } from "@/components/ui/FrotaOneLogo"

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
        <div className="flex items-center justify-center h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden font-sans p-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-600/15 blur-[130px] rounded-full pointer-events-none -z-0" />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl p-8 sm:p-10 shadow-slate-200/50 dark:shadow-blue-950/50 space-y-6">
                    <div className="flex justify-center mb-4">
                        <FrotaOneLogo variant="default" size="lg" showTagline={true} className="dark:hidden" />
                        <FrotaOneLogo variant="dark" size="lg" showTagline={true} className="hidden dark:flex" />
                    </div>
                    <p className="text-center text-slate-500 dark:text-slate-400 text-xs font-medium mb-4">Crie sua conta no sistema</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-xs space-y-0.5">
                                <p className="font-bold text-red-700 dark:text-red-300">Erro no Registro</p>
                                <p className="font-mono">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-xs space-y-0.5">
                                <p className="font-bold text-emerald-700 dark:text-emerald-300">Sucesso!</p>
                                <p>{success}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Nome Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Seu Nome Completo"
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Tipo de Conta</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
                            >
                                <option value="driver">Motorista</option>
                                <option value="manager">Gestor</option>
                                {allowAdminRegister && <option value="admin">Administrador</option>}
                            </select>
                        </div>

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
                            {isLoading ? "Criando conta..." : "Criar Minha Conta"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col space-y-2 font-medium">
                        <p>
                            Já tem uma conta?{" "}
                            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors">
                                Faça login
                            </Link>
                        </p>
                        <p>
                            Esqueceu a senha?{" "}
                            <Link href="/recover" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                Recuperar conta
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
