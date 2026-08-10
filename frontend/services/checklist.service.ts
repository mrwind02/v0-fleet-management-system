import {
  ChecklistExecutionItem,
  ChecklistItemEval,
  ChecklistOccurrenceItem,
  ChecklistOsItem,
  ChecklistPhotoItem,
  ChecklistAuditItem,
  ChecklistModelTemplate,
  ChecklistFilterState
} from "@/types/checklist"

export const INITIAL_CHECKLIST_EXECUTIONS: ChecklistExecutionItem[] = [
  {
    id: "chk-001",
    code: "CHK-2026-0891",
    date: "28/07/2026",
    time: "07:15",
    modelName: "Inspeção Diária Pré-Viagem (Rodoviário)",
    vehicleModel: "Volvo FH 540",
    plate: "ABC-1234",
    driverName: "João Silva",
    unit: "Matriz SP",
    result: "Aprovado com Ressalvas",
    nonConformitiesCount: 1,
    osGenerated: true,
    durationMinutes: 14,
    osNumber: "OS-2026-904",
    location: "Pátio Principal - Matriz SP",
    observerNotes: "Pressão do pneu dianteiro direito ligeiramente abaixo do ideal. Lanterna traseira direita piscando com baixa intensidade.",
    signatureUrl: "#",
    gpsCoordinates: "-23.5505, -46.6333",
    evaluatedCount: 24,
    compliantCount: 23,
    nonCompliantCount: 1,
    photosCount: 2
  },
  {
    id: "chk-002",
    code: "CHK-2026-0890",
    date: "28/07/2026",
    time: "06:45",
    modelName: "Inspeção Diária Pré-Viagem (Rodoviário)",
    vehicleModel: "Scania R450",
    plate: "DEF-5678",
    driverName: "Carlos Henrique",
    unit: "Filial RJ",
    result: "Reprovado",
    nonConformitiesCount: 3,
    osGenerated: true,
    durationMinutes: 18,
    osNumber: "OS-2026-902",
    location: "Garagem Operacional - Filial RJ",
    observerNotes: "Vazamento contínuo de óleo no cárter detectado antes da partida. Veículo imobilizado imediatamente.",
    signatureUrl: "#",
    gpsCoordinates: "-22.9068, -43.1729",
    evaluatedCount: 24,
    compliantCount: 21,
    nonCompliantCount: 3,
    photosCount: 4
  },
  {
    id: "chk-003",
    code: "CHK-2026-0889",
    date: "28/07/2026",
    time: "06:10",
    modelName: "Checklist de Segurança & EPI (Urbano)",
    vehicleModel: "Mercedes Actros",
    plate: "GHI-9012",
    driverName: "Marcos Souza",
    unit: "Matriz SP",
    result: "Aprovado",
    nonConformitiesCount: 0,
    osGenerated: false,
    durationMinutes: 11,
    location: "Terminal de Cargas - SP",
    observerNotes: "Veículo e equipamentos de segurança em 100% de conformidade com o padrão operacional.",
    signatureUrl: "#",
    gpsCoordinates: "-23.5505, -46.6333",
    evaluatedCount: 18,
    compliantCount: 18,
    nonCompliantCount: 0,
    photosCount: 1
  },
  {
    id: "chk-004",
    code: "CHK-2026-0888",
    date: "27/07/2026",
    time: "18:30",
    modelName: "Checklist Pós-Viagem & Devolução",
    vehicleModel: "MAN TGX 28.440",
    plate: "JKL-3456",
    driverName: "Roberto Santos",
    unit: "Filial MG",
    result: "Aprovado",
    nonConformitiesCount: 0,
    osGenerated: false,
    durationMinutes: 12,
    location: "Filial Belo Horizonte",
    observerNotes: "Devolução sem avarias. Nível de combustível entregue no tanque cheio.",
    signatureUrl: "#",
    gpsCoordinates: "-19.9167, -43.9345",
    evaluatedCount: 20,
    compliantCount: 20,
    nonCompliantCount: 0,
    photosCount: 2
  },
  {
    id: "chk-005",
    code: "CHK-2026-0887",
    date: "27/07/2026",
    time: "14:20",
    modelName: "Inspeção de Carroceria & Semirreboque",
    vehicleModel: "DAF XF 105",
    plate: "MNO-7890",
    driverName: "André Luiz",
    unit: "Filial PR",
    result: "Aprovado com Ressalvas",
    nonConformitiesCount: 1,
    osGenerated: false,
    durationMinutes: 15,
    location: "Patio Curitiba",
    observerNotes: "Pequeno rasgo na lona lateral direita do baú sider. Lona vedada provisoriamente.",
    signatureUrl: "#",
    gpsCoordinates: "-25.4284, -49.2733",
    evaluatedCount: 22,
    compliantCount: 21,
    nonCompliantCount: 1,
    photosCount: 3
  }
]

export const INITIAL_CHECKLIST_MODELS: ChecklistModelTemplate[] = [
  { id: "mod-1", name: "Inspeção Diária Pré-Viagem (Rodoviário)", category: "Operacional", applicationTarget: "Caminhões Pesados", itemsCount: 24, active: true, isRequired: true },
  { id: "mod-2", name: "Checklist de Segurança & EPI (Urbano)", category: "Segurança", applicationTarget: "Toda a Frota", itemsCount: 18, active: true, isRequired: true },
  { id: "mod-3", name: "Inspeção de Carroceria & Semirreboque", category: "Equipamentos", applicationTarget: "Semirreboques / Baús", itemsCount: 22, active: true, isRequired: false },
  { id: "mod-4", name: "Checklist Pós-Viagem & Devolução", category: "Operacional", applicationTarget: "Toda a Frota", itemsCount: 20, active: true, isRequired: true }
]

export class ChecklistService {
  // 1. Get List of Executions
  static getExecutions(filter?: ChecklistFilterState): ChecklistExecutionItem[] {
    let result = [...INITIAL_CHECKLIST_EXECUTIONS]
    if (!filter) return result

    if (filter.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (e) =>
          e.code.toLowerCase().includes(q) ||
          e.plate.toLowerCase().includes(q) ||
          e.driverName.toLowerCase().includes(q) ||
          e.modelName.toLowerCase().includes(q)
      )
    }

    if (filter.result && filter.result !== "all") {
      result = result.filter((e) => e.result === filter.result)
    }

    if (filter.unit && filter.unit !== "all") {
      result = result.filter((e) => e.unit.toLowerCase().includes(filter.unit.toLowerCase()))
    }

    return result
  }

  // 2. Get Execution Details by ID
  static getExecutionById(id: string): ChecklistExecutionItem | undefined {
    return INITIAL_CHECKLIST_EXECUTIONS.find((e) => e.id === id || e.code.toLowerCase() === id.toLowerCase())
  }

  // 3. Get Evaluated Items for Execution
  static getEvaluatedItems(executionId: string): ChecklistItemEval[] {
    return [
      { id: "i-1", category: "Motor & Níveis", itemDescription: "Nível do óleo lubrificante do motor", result: "Conforme", isRequired: true },
      { id: "i-2", category: "Motor & Níveis", itemDescription: "Nível de fluido de arrefecimento do radiador", result: "Conforme", isRequired: true },
      { id: "i-3", category: "Motor & Níveis", itemDescription: "Inspeção de vazamento de óleo no cárter", result: "Não Conforme", notes: "Pressão baixa e borrifos de óleo identificados", photoUrl: "#", isRequired: true },
      { id: "i-4", category: "Pneus & Rodas", itemDescription: "Pressão e profundidade de sulco dos pneus dianteiros", result: "Conforme", isRequired: true },
      { id: "i-5", category: "Pneus & Rodas", itemDescription: "Aperto de porcas e estado de rodas de tração", result: "Conforme", isRequired: true },
      { id: "i-6", category: "Freios & Pneumática", itemDescription: "Teste de drenagem do reservatório de ar", result: "Conforme", isRequired: true },
      { id: "i-7", category: "Iluminação & Sinalização", itemDescription: "Funcionamento de faróis e lanternas traseiras", result: "Conforme", isRequired: true }
    ]
  }

  // 4. Get Occurrences (Non-Conformities ONLY)
  static getOccurrences(executionId: string): ChecklistOccurrenceItem[] {
    return [
      {
        id: "occ-1",
        category: "Motor & Níveis",
        itemDescription: "Inspeção de vazamento de óleo no cárter",
        notes: "Vazamento contínuo de óleo detectado na junta do cárter durante a partida pré-viagem.",
        priority: "Urgente",
        status: "OS Gerada",
        osNumber: "OS-2026-904",
        photoUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80"
      }
    ]
  }

  // 5. Get Generated Work Orders for Execution
  static getWorkOrders(executionId: string): ChecklistOsItem[] {
    return [
      { id: "os-1", osNumber: "OS-2026-904", date: "28/07/2026", status: "Em Andamento", workshop: "Oficina Alfa Ltda", responsible: "Marcos Engenharia", value: 1450.00, osUrl: "/manutencao/ordens-servico/OS-2026-904" }
    ]
  }

  // 6. Get Execution Photos
  static getPhotos(executionId: string): ChecklistPhotoItem[] {
    return [
      { id: "ph-1", title: "Vazamento no Cárter", caption: "Gotejamento ativo de óleo lubrificante detectado no pátio", photoUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80", uploadDate: "28/07/2026 07:16" },
      { id: "ph-2", title: "Hodômetro / Painel", caption: "Registro da quilometragem atual do veículo no momento da inspeção", photoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80", uploadDate: "28/07/2026 07:15" }
    ]
  }

  // 7. Get Execution Audit Logs
  static getAuditLogs(executionId: string): ChecklistAuditItem[] {
    return [
      { id: "aud-1", date: "28/07/2026 07:18", user: "Sistema Automático", action: "Geração de OS", detail: "Ordem de Serviço OS-2026-904 gerada automaticamente devido à não conformidade urgente no item Vazamento no Cárter.", device: "Servidor ERP" },
      { id: "aud-2", date: "28/07/2026 07:17", user: "João Silva", action: "Conclusão de Checklist", detail: "Inspeção finalizada com resultado Aprovado com Ressalvas no Aplicativo Mobile.", device: "Android (Galaxy Tab Active)" },
      { id: "aud-3", date: "28/07/2026 07:14", user: "João Silva", action: "Início de Inspeção", detail: "Checklist iniciado via leitura de QR Code no veículo Volvo FH 540.", device: "Android (Galaxy Tab Active)" }
    ]
  }

  // 8. Get Models List
  static getModels(): ChecklistModelTemplate[] {
    return INITIAL_CHECKLIST_MODELS
  }

  // 9. Get KPIs dynamically from stored executions
  static getKpis() {
    const executions = this.getExecutions()
    const totalExecutions = executions.length

    let totalEvaluated = 0
    let totalCompliant = 0
    let totalNonConformities = 0
    let totalOs = 0
    let totalDuration = 0
    const vehicleSet = new Set<string>()

    executions.forEach((e) => {
      totalEvaluated += e.evaluatedCount || 0
      totalCompliant += e.compliantCount || 0
      totalNonConformities += e.nonConformitiesCount || 0
      if (e.osGenerated) totalOs += 1
      if (e.plate) vehicleSet.add(e.plate)
      totalDuration += e.durationMinutes || 0
    })

    const complianceRate = totalEvaluated > 0 ? (totalCompliant / totalEvaluated) * 100 : 100
    const avgDuration = totalExecutions > 0 ? Math.round(totalDuration / totalExecutions) : 14

    return [
      { title: "Execuções Realizadas", value: `${totalExecutions} Inspeções`, trend: totalExecutions > 0 ? 100 : 0, trendLabel: "Ativas", tooltip: "Quantidade total de checklists operacionais realizados." },
      { title: "Índice de Conformidade", value: `${complianceRate.toFixed(1).replace(".", ",")}%`, trend: complianceRate >= 95 ? 2.5 : -1.5, trendLabel: "Meta: 95%", tooltip: "Percentual de itens avaliados aprovados nas inspeções." },
      { title: "Não Conformidades", value: `${totalNonConformities} Reprovações`, trend: totalNonConformities > 0 ? -4 : 0, trendLabel: "Identificadas", tooltip: "Itens que apresentaram defeito ou necessidade de manutenção." },
      { title: "OS Geradas por Checklist", value: `${totalOs} OS Criadas`, trend: totalOs > 0 ? 15 : 0, trendLabel: "Automação", tooltip: "Ordens de Serviço abertas automaticamente a partir de reprovações." },
      { title: "Veículos Inspecionados", value: `${vehicleSet.size} Veículos`, trend: vehicleSet.size > 0 ? 100 : 0, trendLabel: "Da frota", tooltip: "Quantidade de veículos únicos submetidos à vistoria." },
      { title: "Tempo Médio de Inspeção", value: `${avgDuration} min`, trend: -1, trendLabel: "Eficiência", tooltip: "Duração média gasta pelo motorista para concluir o checklist." }
    ]
  }
}
