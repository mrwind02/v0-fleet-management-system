"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { maintenanceService } from "../../services/api"
import { X } from "lucide-react"

interface EditMaintenanceModalProps {
    maintenanceId: string
    onClose: () => void
    onSuccess: () => void
}

export function EditMaintenanceModal({ maintenanceId, onClose, onSuccess }: EditMaintenanceModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [loadingData, setLoadingData] = useState(true)
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm()

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                const response = await maintenanceService.getById(maintenanceId)
                const data = response.data.data

                // Format date for input
                const date = new Date(data.maintenanceDate)
                const formattedDate = date.toISOString().split('T')[0]

                setValue("maintenanceDate", formattedDate)
                setValue("maintenanceType", data.maintenanceType)
                setValue("mechanicName", data.mechanicName)
                setValue("establishmentName", data.establishmentName)
                setValue("serviceDescription", data.serviceDescription)
                setValue("cost", data.cost || "")
                setValue("odometerReading", data.odometerReading || "")

                setLoadingData(false)
            } catch (err: any) {
                setError("Erro ao carregar dados da manutenção")
                setLoadingData(false)
            }
        }

        fetchMaintenance()
    }, [maintenanceId, setValue])

    const parseFormattedNumber = (value: any) => {
        if (!value) return undefined
        const stringValue = String(value).replace(",", ".")
        return Number.parseFloat(stringValue)
    }

    const onSubmit = async (data: any) => {
        setError("")
        setIsLoading(true)

        try {
            // Fix date offset
            const [year, month, day] = data.maintenanceDate.split('-')
            const localDate = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0)

            await maintenanceService.update(maintenanceId, {
                maintenanceDate: localDate,
                maintenanceType: data.maintenanceType,
                mechanicName: data.mechanicName,
                establishmentName: data.establishmentName,
                serviceDescription: data.serviceDescription,
                cost: parseFormattedNumber(data.cost),
                odometerReading: parseFormattedNumber(data.odometerReading),
            })
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.error || "Erro ao atualizar manutenção")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Editar Manutenção</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {loadingData ? (
                    <div className="p-6 text-center text-gray-600">Carregando...</div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data da Manutenção *</label>
                                <input
                                    type="date"
                                    {...register("maintenanceDate", { required: "Data é obrigatória" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.maintenanceDate && (
                                    <span className="text-red-600 text-sm">{String(errors.maintenanceDate.message)}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Manutenção *</label>
                                <select
                                    {...register("maintenanceType", { required: "Tipo é obrigatório" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Selecione um tipo</option>
                                    <option value="preventiva">Preventiva</option>
                                    <option value="corretiva">Corretiva</option>
                                </select>
                                {errors.maintenanceType && (
                                    <span className="text-red-600 text-sm">{String(errors.maintenanceType.message)}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Mecânico *</label>
                                <input
                                    type="text"
                                    placeholder="João Silva"
                                    {...register("mechanicName", { required: "Nome do mecânico é obrigatório" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.mechanicName && (
                                    <span className="text-red-600 text-sm">{String(errors.mechanicName.message)}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estabelecimento *</label>
                                <input
                                    type="text"
                                    placeholder="Oficina Mecânica XYZ"
                                    {...register("establishmentName", { required: "Estabelecimento é obrigatório" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.establishmentName && (
                                    <span className="text-red-600 text-sm">{String(errors.establishmentName.message)}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custo</label>
                                <input
                                    type="text"
                                    placeholder="500,00"
                                    {...register("cost")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quilometragem</label>
                                <input
                                    type="text"
                                    placeholder="150000,5"
                                    {...register("odometerReading")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço *</label>
                            <textarea
                                placeholder="Descreva os serviços realizados..."
                                {...register("serviceDescription", { required: "Descrição é obrigatória" })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.serviceDescription && (
                                <span className="text-red-600 text-sm">{String(errors.serviceDescription.message)}</span>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                            >
                                {isLoading ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
