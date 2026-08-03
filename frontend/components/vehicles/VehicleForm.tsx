"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { vehicleService, unitService, settingsService } from "../../services/api"

interface VehicleFormProps {
  onSuccess?: () => void
  initialData?: any
}

export function VehicleForm({ onSuccess, initialData }: VehicleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [units, setUnits] = useState<any[]>([])
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || { status: "operando" },
  })

  useEffect(() => {
    const loadUnits = async () => {
      const list: { id: string; name: string; code?: string }[] = []

      // Buscar Unidades reais da API
      try {
        const res = await unitService.getAll()
        const fetched = res.data?.data || res.data || []
        if (Array.isArray(fetched) && fetched.length > 0) {
          fetched.forEach((u: any) => {
            if (u.name) {
              let displayName = u.name
              if (u.name.toLowerCase() === "matriz" || u.name.toLowerCase().includes("matriz")) {
                displayName = "Matriz"
              } else if (u.code && u.code !== u.name) {
                displayName = u.code.toLowerCase().startsWith("filial") ? u.code : `Filial ${u.code}`
              } else if (!u.name.toLowerCase().startsWith("filial")) {
                displayName = `Filial ${u.name}`
              }

              if (!list.some((item) => item.name.toLowerCase() === displayName.toLowerCase())) {
                list.push({ id: u.id || u.name, name: displayName, code: u.code })
              }
            }
          })
        }
      } catch (err) {
        console.error("Erro ao buscar unidades da API:", err)
      }

      setUnits(list)
    }

    loadUnits()
  }, [])

  // Pré-selecionar a unidade ao abrir para edição
  useEffect(() => {
    if (units.length > 0 && initialData) {
      let matched = units.find((u) => u && String(u.id) === String(initialData.unitId))
      if (!matched && initialData.unitName) {
        const nameLower = initialData.unitName.toLowerCase()
        matched = units.find((u) => u.name.toLowerCase() === nameLower || nameLower.includes(u.name.toLowerCase()))
      }
      if (matched) {
        setValue("unitId", matched.id)
        setValue("unitName", matched.name)
      } else if (initialData.unitId) {
        setValue("unitId", initialData.unitId)
      }
    }
  }, [units, initialData, setValue])

  const onSubmit = async (data: any) => {
    setError("")
    setIsLoading(true)

    // Resolver o nome real da unidade selecionada
    const selectedUnit = units.find((u) => u && String(u.id) === String(data.unitId))
    const unitName = selectedUnit?.name || data.unitName || ""
    const payload = { ...data, unitName }

    try {
      if (initialData?.id) {
        await vehicleService.update(initialData.id, payload)
      } else {
        await vehicleService.create(payload)
      }
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao salvar veículo")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-card p-4 rounded-xl shadow-sm border space-y-4 w-full">
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Unidade <span className="text-red-500">*</span></label>
          <select
            {...register("unitId", { 
              required: "Obrigatório",
              onChange: (e) => {
                const selectedUnit = units.find((u) => u && u.id && String(u.id) === String(e.target.value))
                setValue("unitName", selectedUnit?.name || "")
              }
            })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Selecione...</option>
            {units.filter((u) => u && u.id).map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {errors.unitId && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.unitId.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Status <span className="text-red-500">*</span></label>
          <select
            {...register("status", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="operando">Em Operação</option>
            <option value="manutencao">Em Manutenção</option>
            <option value="oficina">Na Oficina</option>
            <option value="inativo">Inativo</option>
            <option value="vendido">Vendido</option>
          </select>
          {errors.status && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.status.message)}</span>}
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Placa <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="ABC1234"
            {...register("plate", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.plate && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.plate.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">RENAVAM</label>
          <input
            type="text"
            placeholder="12345678901"
            {...register("renavam")}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Marca <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Volvo"
            {...register("brand", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.brand && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.brand.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Modelo <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="FH16"
            {...register("model", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.model && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.model.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Ano <span className="text-red-500">*</span></label>
          <input
            type="number"
            placeholder="2024"
            {...register("year", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.year && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.year.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Cor</label>
          <input
            type="text"
            placeholder="Branco"
            {...register("color")}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground">Número do Chassi <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="ABC123456789DEF"
            {...register("chassisNumber", { required: "Obrigatório" })}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.chassisNumber && <span className="text-red-500 text-[10px] mt-0.5">{String(errors.chassisNumber.message)}</span>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-muted-foreground truncate" title="Capacidade de Carga (kg)">Capacidade de Carga (kg)</label>
          <input
            type="number"
            placeholder="25000"
            {...register("loadCapacity")}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-muted-foreground">Observações</label>
        <textarea
          placeholder="Adicione observações sobre o veículo"
          {...register("observations")}
          rows={2}
          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-6 text-sm rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          {isLoading ? "Salvando..." : initialData ? "Atualizar Veículo" : "Criar Veículo"}
        </button>
      </div>
    </form>
  )
}
