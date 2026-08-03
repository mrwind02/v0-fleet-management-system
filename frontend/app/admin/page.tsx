"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { useAuthStore } from "../../store/authStore"
import { userService, settingsService } from "../../services/api"
import { Shield, Users, Trash2, Edit, Save, X, Ban, CheckCircle } from "lucide-react"
import useSWR from "swr"

export default function AdminPage() {
    const { user } = useAuthStore()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<any>({})

    const fetchAdminData = async () => {
        try {
            const [usersRes, settingsRes] = await Promise.all([
                userService.getAll(),
                settingsService.getPublic("allow_admin_register")
            ])
            return {
                users: usersRes.data?.data || [],
                allowAdminRegister: settingsRes.data?.allowed || false
            }
        } catch (error) {
            console.error("Error loading admin data", error)
            return null
        }
    }

    const { data, isLoading, mutate } = useSWR(user?.role === "admin" ? 'admin_dashboard_data' : null, fetchAdminData, { revalidateOnFocus: false })

    const users = data?.users || []
    const allowAdminRegister = data?.allowAdminRegister || false

    useEffect(() => {
        if (!user) return
        if (user.role !== "admin") {
            router.push("/dashboard")
        }
    }, [user, router])

    const toggleAdminRegister = async () => {
        try {
            const newValue = !allowAdminRegister
            await settingsService.update("allow_admin_register", String(newValue))
            mutate()
        } catch (error) {
            console.error("Failed to update settings", error)
            alert("Erro ao atualizar configuração.")
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) return
        try {
            await userService.delete(id)
            mutate()
        } catch (error) {
            console.error("Error deleting user", error)
            alert("Erro ao excluir usuário.")
        }
    }

    const handleEditStart = (user: any) => {
        setIsEditing(user.id)
        setEditForm({ ...user })
    }

    const handleEditSave = async () => {
        try {
            await userService.update(editForm.id, editForm)
            setIsEditing(null)
            mutate()
        } catch (error) {
            console.error("Error updating user", error)
            alert("Erro ao atualizar usuário.")
        }
    }

    const toggleUserActive = async (user: any) => {
        try {
            const newValue = !user.is_active
            await userService.update(user.id, { is_active: newValue })
            mutate()
        } catch (error) {
            console.error("Error toggling user status", error)
        }
    }

    if (isLoading) return <div className="p-8 text-center">Carregando painel administrativo...</div>

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                </div>

                {/* Settings Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Shield className="h-5 w-5" /> Configurações de Segurança
                    </h2>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">Registro Público de Administradores</p>
                            <p className="text-sm text-gray-500">
                                Se ativado, a opção "Administrador" aparecerá no formulário de criação de conta.
                            </p>
                        </div>
                        <button
                            onClick={toggleAdminRegister}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${allowAdminRegister ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span
                                className={`${allowAdminRegister ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>
                </div>

                {/* Users Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Users className="h-5 w-5" /> Gerenciamento de Usuários
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="py-3 px-4">Nome</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Função</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            {isEditing === u.id ? (
                                                <input
                                                    className="border px-2 py-1 rounded w-full"
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                />
                                            ) : u.name}
                                        </td>
                                        <td className="py-3 px-4">{u.email}</td>
                                        <td className="py-3 px-4">
                                            {isEditing === u.id ? (
                                                <select
                                                    className="border px-2 py-1 rounded w-full bg-white"
                                                    value={editForm.role}
                                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                                >
                                                    <option value="driver">Motorista</option>
                                                    <option value="manager">Gestor</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                    ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {u.role === 'admin' ? 'Administrador' : u.role === 'manager' ? 'Gestor' : 'Motorista'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => toggleUserActive(u)}
                                                className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1
                                                ${u.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                            >
                                                {u.is_active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                                {u.is_active ? 'Ativo' : 'Bloqueado'}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-right flex justify-end gap-2">
                                            {isEditing === u.id ? (
                                                <>
                                                    <button onClick={handleEditSave} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Salvar"><Save className="w-4 h-4" /></button>
                                                    <button onClick={() => setIsEditing(null)} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Cancelar"><X className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditStart(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteUser(u.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
