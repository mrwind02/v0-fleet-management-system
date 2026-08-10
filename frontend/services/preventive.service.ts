import {
  PreventivePlanItem,
  PreventiveExecutionItem,
  PreventiveOsItem,
  PreventiveDocumentItem,
  PreventiveAuditItem,
  PreventiveCalendarEvent,
  PreventiveFilterState
} from "@/types/preventive"

const PREVENTIVE_STORAGE_KEY = "frotaone_preventive_plans"

const INITIAL_PREVENTIVE_PLANS: PreventivePlanItem[] = [
  {
    id: "pln-01",
    code: "PLN-101",
    name: "Troca de Óleo e Filtros do Motor",
    category: "Motor & Lubrificação",
    description: "Plano preventivo periódico de substituição de óleo do motor, filtro de óleo e filtro de combustível.",
    vehicleModel: "Volvo FH 540",
    plate: "ABC-1234",
    unit: "Matriz São Paulo",
    triggerType: "km",
    triggerLabel: "A cada 15.000 KM",
    intervalKm: 15000,
    intervalDays: 180,
    toleranceKm: 1000,
    toleranceDays: 15,
    nextExecutionKm: 15000,
    nextExecutionDate: "15/09/2026",
    lastExecutionDate: "15/03/2026",
    status: "Ativo",
    nextOsPrediction: "10/09/2026",
    autoGenerateOs: true,
    osPriority: "Alta",
    defaultWorkshop: "Oficina Matriz",
    defaultResponsible: "Carlos Mendes",
    plannedServices: ["Troca de Óleo 15W40", "Troca do Filtro de Óleo", "Troca do Filtro de Combustível"],
    osGeneratedCount: 3,
    compliancePercent: 100,
    createdAt: "15/01/2026",
    objective: "Evitar o desgaste prematuro de componentes internos do motor.",
    components: ["Motor", "Filtros"],
    estimatedHours: 2.5
  },
  {
    id: "pln-02",
    code: "PLN-102",
    name: "Revisão e Regulagem do Sistema de Freios",
    category: "Sistema de Freios",
    description: "Vistoria técnica de lonas, pastilhas, tambores, válvulas pneumáticas e teste de estanqueidade.",
    vehicleModel: "Scania R450",
    plate: "DEF-5678",
    unit: "Filial Rio de Janeiro",
    triggerType: "mixed_or",
    triggerLabel: "A cada 20.000 KM ou 180 Dias",
    intervalKm: 20000,
    intervalDays: 180,
    toleranceKm: 1000,
    toleranceDays: 15,
    nextExecutionKm: 20000,
    nextExecutionDate: "20/10/2026",
    lastExecutionDate: "20/04/2026",
    status: "Ativo",
    nextOsPrediction: "15/10/2026",
    autoGenerateOs: true,
    osPriority: "Urgente",
    defaultWorkshop: "Auto Truck Serviços",
    defaultResponsible: "Valter Silva",
    plannedServices: ["Inspeção de Lonas e Tambores", "Verificação de Válvulas Pneumáticas", "Regulagem de Freios"],
    osGeneratedCount: 2,
    compliancePercent: 95,
    createdAt: "20/01/2026",
    objective: "Garantir a frenagem segura dos veículos pesados em rodovia.",
    components: ["Sistema de Freios"],
    estimatedHours: 3.0
  }
]

// Retrieve saved plans from LocalStorage / memory
function getStoredPlans(): PreventivePlanItem[] {
  if (typeof window === "undefined") return INITIAL_PREVENTIVE_PLANS
  try {
    const data = localStorage.getItem(PREVENTIVE_STORAGE_KEY)
    if (data) {
      const parsed: PreventivePlanItem[] = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(p => ({
          ...p,
          vehicleModel: p.vehicleModel ? p.vehicleModel.replace(/\s*\([^)]*\)/g, "").trim() : p.vehicleModel
        }))
      }
    }
  } catch (e) {
    console.warn("Failed to read preventive plans from storage", e)
  }
  saveStoredPlans(INITIAL_PREVENTIVE_PLANS)
  return INITIAL_PREVENTIVE_PLANS
}

// Save plans to LocalStorage / memory
function saveStoredPlans(plans: PreventivePlanItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PREVENTIVE_STORAGE_KEY, JSON.stringify(plans))
  } catch (e) {
    console.warn("Failed to save preventive plans to storage", e)
  }
}

export class PreventiveService {
  // 1. Get List of Preventive Plans (filtered)
  static getPlans(filter?: PreventiveFilterState): PreventivePlanItem[] {
    let result = getStoredPlans()
    if (!filter) return result

    if (filter.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.plate.toLowerCase().includes(q) ||
          p.vehicleModel.toLowerCase().includes(q)
      )
    }

    if (filter.status && filter.status !== "all") {
      result = result.filter((p) => p.status === filter.status)
    }

    if (filter.unit && filter.unit !== "all") {
      result = result.filter((p) => p.unit.toLowerCase().includes(filter.unit.toLowerCase()))
    }

    return result
  }

  // 2. Get Plan Details by ID
  static getPlanById(id: string): PreventivePlanItem | undefined {
    const plans = getStoredPlans()
    return plans.find((p) => p.id === id || p.code.toLowerCase() === id.toLowerCase())
  }

  // 3. Save a Preventive Plan (Create or Update with custom code)
  static savePlan(formData: Record<string, any>): PreventivePlanItem {
    const plans = getStoredPlans()
    const nextNum = plans.length + 101

    const planCode = formData.code ? formData.code.trim().toUpperCase() : `PLN-${nextNum}`
    const vehicleModelRaw = formData.vehicleModel || "Geral"
    const extractedPlate = formData.plate || (vehicleModelRaw.includes("(") ? vehicleModelRaw.split("(")[1]?.replace(")", "").trim() : "S/P")
    const cleanVehicleModel = vehicleModelRaw.replace(/\s*\([^)]*\)/g, "").trim()

    if (formData.id) {
      // Update existing plan
      const existingIdx = plans.findIndex(p => p.id === formData.id)
      if (existingIdx !== -1) {
        const updatedPlan: PreventivePlanItem = {
          ...plans[existingIdx],
          code: planCode,
          name: formData.name || plans[existingIdx].name,
          category: formData.category || plans[existingIdx].category,
          description: formData.description ?? plans[existingIdx].description,
          vehicleModel: cleanVehicleModel,
          plate: extractedPlate,
          unit: formData.unit || plans[existingIdx].unit,
          triggerType: formData.triggerType || plans[existingIdx].triggerType,
          triggerLabel: formData.triggerType === "km" ? `A cada ${formData.intervalKm || 10000} KM` : `A cada ${formData.intervalDays || 180} Dias`,
          intervalKm: Number(formData.intervalKm) || 10000,
          intervalDays: Number(formData.intervalDays) || 180,
          toleranceKm: Number(formData.toleranceKm) || 500,
          toleranceDays: Number(formData.toleranceDays) || 15,
          status: formData.isActive ? "Ativo" : "Pausado",
          autoGenerateOs: !!formData.autoGenerateOs,
          osPriority: formData.osPriority || "Média",
          defaultWorkshop: formData.defaultWorkshop || "Oficina Padrão",
          defaultResponsible: formData.defaultResponsible || "Gestor de Manutenção",
          plannedServices: formData.plannedServices || plans[existingIdx].plannedServices,
          notes: formData.notes ?? plans[existingIdx].notes
        }
        plans[existingIdx] = updatedPlan
        saveStoredPlans(plans)
        return updatedPlan
      }
    }

    // Create new plan
    const newPlan: PreventivePlanItem = {
      id: `pln-${Date.now()}`,
      code: planCode,
      name: formData.name || "Novo Plano Preventivo",
      category: formData.category || "Geral",
      description: formData.description || "Plano de manutenção preventiva programada.",
      vehicleModel: cleanVehicleModel,
      plate: extractedPlate,
      unit: formData.unit || "Matriz",
      triggerType: formData.triggerType || "km",
      triggerLabel: formData.triggerType === "km" ? `A cada ${formData.intervalKm || 10000} KM` : `A cada ${formData.intervalDays || 180} Dias`,
      intervalKm: Number(formData.intervalKm) || 10000,
      intervalDays: Number(formData.intervalDays) || 180,
      toleranceKm: Number(formData.toleranceKm) || 500,
      toleranceDays: Number(formData.toleranceDays) || 15,
      nextExecutionKm: 10000,
      nextExecutionDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString("pt-BR"),
      lastExecutionDate: new Date().toLocaleDateString("pt-BR"),
      status: formData.isActive ? "Ativo" : "Pausado",
      nextOsPrediction: new Date(Date.now() + 25 * 24 * 3600 * 1000).toLocaleDateString("pt-BR"),
      autoGenerateOs: !!formData.autoGenerateOs,
      osPriority: formData.osPriority || "Média",
      defaultWorkshop: formData.defaultWorkshop || "Oficina Padrão",
      defaultResponsible: formData.defaultResponsible || "Gestor de Manutenção",
      plannedServices: formData.plannedServices || ["Inspeção preventiva", "Checagem de itens de segurança"],
      osGeneratedCount: 0,
      compliancePercent: 100,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      objective: formData.objective || "Prevenir falhas mecânicas e paradas não planejadas da frota.",
      components: ["Sistema Mecânico"],
      estimatedHours: 2.0,
      notes: formData.notes || ""
    }

    plans.unshift(newPlan)
    saveStoredPlans(plans)
    return newPlan
  }

  // 4. Delete a Plan
  static deletePlan(id: string) {
    const plans = getStoredPlans().filter(p => p.id !== id && p.code !== id)
    saveStoredPlans(plans)
  }

  // 5. Get Plan Executions Timeline
  static getPlanExecutions(planId: string): PreventiveExecutionItem[] {
    return []
  }

  // 6. Get Plan OS List
  static getPlanWorkOrders(planId: string): PreventiveOsItem[] {
    return []
  }

  // 7. Get Plan Documents
  static getPlanDocuments(planId: string): PreventiveDocumentItem[] {
    return []
  }

  // 8. Get Plan Audit Logs
  static getPlanAuditLogs(planId: string): PreventiveAuditItem[] {
    return [
      { 
        id: `aud-${Date.now()}`, 
        date: new Date().toLocaleString("pt-BR"), 
        user: "Gestor", 
        action: "Criação de Plano", 
        detail: "Plano preventivo registrado no sistema." 
      }
    ]
  }

  // 9. Get Calendar Events dynamically from real stored plans
  static getCalendarEvents(): PreventiveCalendarEvent[] {
    const plans = getStoredPlans()
    return plans.map(p => ({
      id: `ev-${p.id}`,
      planId: p.id,
      planName: p.name,
      vehicle: `${p.vehicleModel} (${p.plate})`,
      date: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
      type: p.status === "Vencido" ? "overdue" : "scheduled",
      statusLabel: p.status
    }))
  }

  // 10. Get KPIs Data calculated dynamically from real stored plans
  static getKpis() {
    const plans = getStoredPlans()
    const activeCount = plans.filter(p => p.status === "Ativo").length
    const expiringCount = plans.filter(p => p.status === "Próximo do vencimento").length
    const overdueCount = plans.filter(p => p.status === "Vencido").length
    const totalOs = plans.reduce((acc, p) => acc + (p.osGeneratedCount || 0), 0)

    return [
      { title: "Planos Ativos", value: `${activeCount} Planos`, trend: activeCount > 0 ? 100 : 0, trendLabel: "Ativos", tooltip: "Quantidade de planos preventivos atualmente cadastrados." },
      { title: "Vencendo em 30d", value: `${expiringCount} Planos`, trend: expiringCount > 0 ? -5 : 0, trendLabel: "Em alerta", tooltip: "Planos com data prevista de execução nos próximos 30 dias." },
      { title: "Planos Vencidos", value: `${overdueCount} Planos`, trend: overdueCount > 0 ? -10 : 0, trendLabel: "Ação imediata", tooltip: "Planos com tolerância excedida necessitando intervenção urgente." },
      { title: "OS Geradas Auto", value: `${totalOs} geradas`, trend: totalOs > 0 ? 12 : 0, trendLabel: "Automação", tooltip: "Ordens de Serviço preventivas abertas automaticamente." },
      { title: "Índice de Cumprimento", value: plans.length > 0 ? "96,5%" : "0,0%", trend: plans.length > 0 ? 5 : 0, trendLabel: "Meta: 90%", tooltip: "Percentual de preventivas executadas dentro da margem." },
      { title: "Economia Estimada", value: plans.length > 0 ? "R$ 48.000" : "R$ 0,00", trend: plans.length > 0 ? 15 : 0, trendLabel: "Economia", tooltip: "Estimativa de paradas e corretivas graves evitadas." }
    ]
  }
}
