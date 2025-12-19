"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "../../components/layout/MainLayout"
import { vehicleService, fuelService } from "../../services/api"
import { useAuthStore } from "../../store/authStore"
import { useForm } from "react-hook-form"

export default function FuelPage() {
    const { user } = useAuthStore()
    const [vehicles, setVehicles] = useState<any[]>([])
    const [selectedVehicle, setSelectedVehicle] = useState<string>("")
    const [fuelRecords, setFuelRecords] = useState<any[]>([])
    const [showForm, setShowForm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const { register, handleSubmit, formState: { errors }, reset } = useForm()

    useEffect(() => {
        fetchVehicles()
    }, [])

    useEffect(() => {
        if (selectedVehicle) {
            fetchFuelRecords()
        }
    }, [selectedVehicle])

    const fetchVehicles = async () => {
        try {
            const response = await vehicleService.getAll(true)
            setVehicles(response.data.data)
        } catch (error) {
            console.error("Error fetching vehicles:", error)
        }
    }

    const fetchFuelRecords = async () => {
        try {
            const response = await fuelService.getByVehicle(selectedVehicle)
            setFuelRecords(response.data.data)
        } catch (error) {
            console.error("Error fetching fuel records:", error)
        }
    }

    const parseNumber = (value: any) => {
        if (!value) return undefined
        return Number.parseFloat(String(value).replace(",", "."))
    }

    const onSubmit = async (data: any) => {
        setError("")
        setIsLoading(true)

        try {
            const [year, month, day] = data.fuelDate.split('-')
            const localDate = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0)

            await fuelService.create({
                vehicleId: selectedVehicle,
                fuelDate: localDate,
                gasStationName: data.gasStationName,
                location: data.location,
                odometerReading: parseNumber(data.odometerReading),
                liters: parseNumber(data.liters),
                cost: parseNumber(data.cost),
            })

            reset()
            setShowForm(false)
            fetchFuelRecords()
        } catch (err: any) {
            setError(err.response?.data?.error || "Erro ao registrar abastecimento")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <MainLayout>
            <div>
                <div className="bg-white p-5 rounded-lg shadow-sm mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um Veículo</label>
                    <select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Selecione um veículo --</option>
                        {vehicles.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.plate} - {v.brand} {v.model}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedVehicle && (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition shadow-sm hover:shadow-md"
                            >
                                {showForm ? "✕ Cancelar" : "+ Registrar Abastecimento"}
                            </button>
                        </div>

                        {showForm && (
                            <div className="bg-white p-6 rounded-lg shadow mb-6">
                                <h2 className="text-xl font-bold mb-4 text-gray-900">Novo Abastecimento</h2>
                                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                                            <input
                                                type="date"
                                                {...register("fuelDate", { required: "Data é obrigatória" })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors.fuelDate && <span className="text-red-600 text-sm">{String(errors.fuelDate.message)}</span>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Posto *</label>
                                            <input
                                                type="text"
                                                placeholder="Posto Shell"
                                                {...register("gasStationName", { required: "Nome do posto é obrigatório" })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors.gasStationName && <span className="text-red-600 text-sm">{String(errors.gasStationName.message)}</span>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                                            <input
                                                type="text"
                                                placeholder="Av. Paulista, 1000"
                                                {...register("location")}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kilometragem Atual *</label>
                                            <input
                                                type="text"
                                                placeholder="150000,5"
                                                {...register("odometerReading", { required: "Kilometragem é obrigatória" })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors.odometerReading && <span className="text-red-600 text-sm">{String(errors.odometerReading.message)}</span>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Litros *</label>
                                            <input
                                                type="text"
                                                placeholder="45,50"
                                                {...register("liters", { required: "Litros é obrigatório" })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors.liters && <span className="text-red-600 text-sm">{String(errors.liters.message)}</span>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total *</label>
                                            <input
                                                type="text"
                                                placeholder="250,00"
                                                {...register("cost", { required: "Valor é obrigatório" })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors.cost && <span className="text-red-600 text-sm">{String(errors.cost.message)}</span>}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                                    >
                                        {isLoading ? "Salvando..." : "Salvar Abastecimento"}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Histórico de Abastecimentos</h2>
                            {fuelRecords.length === 0 ? (
                                <p className="text-gray-600">Nenhum abastecimento registrado.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Posto</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Local</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">KM</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Litros</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {fuelRecords.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(record.fuelDate).toLocaleDateString("pt-BR")}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{record.gasStationName}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{record.location || "-"}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {Number(record.odometerReading).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {Number(record.liters).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        R$ {Number(record.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    )
}
