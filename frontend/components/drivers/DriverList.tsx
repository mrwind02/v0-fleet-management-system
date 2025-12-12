"use client"

import { useEffect, useState } from "react"
import { driverService } from "@/services/api"
import { Pencil, Trash2 } from "lucide-react"

interface Driver {
    id: string
    name: string
    cnhNumber: string
    cnhCategory: string
    cnhExpiryDate: string
    phone?: string
    email?: string
    status: string
}

interface DriverListProps {
    onEdit?: (driver: Driver) => void
}

export function DriverList({ onEdit }: DriverListProps) {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadDrivers()
    }, [])

    const loadDrivers = async () => {
        try {
            const response = await driverService.getAll(true)
            setDrivers(response.data.data)
        } catch (error) {
            console.error("Error loading drivers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este motorista?")) return

        try {
            await driverService.delete(id)
            loadDrivers()
        } catch (error) {
            console.error("Error deleting driver:", error)
            alert("Erro ao excluir motorista")
        }
    }

    if (isLoading) {
        return <div className="text-center py-8 text-gray-500">Carregando motoristas...</div>
    }

    if (drivers.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Nenhum motorista cadastrado via sistema.
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNH</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.map((driver) => (
                        <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{driver.name}</span>
                                    <span className="text-sm text-gray-500">{driver.email}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.cnhNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{driver.cnhCategory}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(driver.cnhExpiryDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {driver.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end items-center gap-4">
                                    <button
                                        onClick={() => onEdit?.(driver)}
                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(driver.id)}
                                        className="text-red-600 hover:text-red-900 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
