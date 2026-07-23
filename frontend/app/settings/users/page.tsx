"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "../../../components/layout/AppLayout"
import { userService } from "../../../services/api"
import { ChevronRight, UserCog, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll()
      setUsers(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao carregar usuários. Apenas admins têm permissão.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center text-xs font-semibold text-muted-foreground">
            <span className="text-foreground cursor-pointer hover:underline">Configurações</span>
            <ChevronRight className="h-3 w-3 mx-1.5" />
            <span>Usuários</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-2">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-slate-500" />
              <h3 className="font-semibold text-sm text-slate-800">Usuários do Sistema</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm font-medium text-slate-500 animate-pulse">
                Carregando usuários...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm font-medium text-red-500">
                {error}
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Perfil (Role)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data de Criação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={
                          user.role === 'admin' ? "bg-purple-100 text-purple-700 border-purple-200" :
                          user.role === 'manager' ? "bg-blue-100 text-blue-700 border-blue-200" :
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
