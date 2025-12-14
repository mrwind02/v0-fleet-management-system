"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { driverService, vehicleService } from "../../services/api"
import { X } from "lucide-react"

interface VehicleAssignmentModalProps {
    vehicleId: string
    vehiclePlate: string
    onClose: () => void
    onSuccess: () => void
}

export function VehicleAssignmentModal({ vehicleId, vehiclePlate, onClose, onSuccess }: VehicleAssignmentModalProps) {
    const [drivers, setDrivers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    useEffect(() => {
        const loadDrivers = async () => {
            try {
                const response = await driverService.getAll(true) // Get only active drivers
                setDrivers(response.data.data)
            } catch (error) {
                console.error("Error loading drivers:", error)
            }
        }
        loadDrivers()
    }, [])

    const onSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            await driverService.assignToVehicle(data.driverId, vehicleId, data.notes)
            onSuccess()
        } catch (error) {
            console.error("Error assigning driver:", error)
            alert("Erro ao atribuir motorista")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Atribuir Motorista</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-4">
                            Selecione o motorista responsável pelo veículo <span className="font-bold text-gray-900">{vehiclePlate}</span>.
                        </p>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Motorista *</label>
                        <select
                            {...register("driverId", { required: "Selecione um motorista" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Selecione...</option>
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.name} ({driver.cnhCategory})
                                </option>
                            ))}
                        </select>
                        {errors.driverId && <span className="text-red-500 text-xs mt-1">Selecione um motorista</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea
                            {...register("notes")}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Ex: Turno da manhã, rota específica..."
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-70"
                        >
                            {isLoading ? "Salvando..." : "Confirmar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
