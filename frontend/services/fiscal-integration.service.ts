import { XmlImportItem, FiscalIntegrationConfig } from "../types/settings"

// Mock Fiscal Integration Queue & Service Layer
export const MOCK_FISCAL_QUEUE: XmlImportItem[] = [
  {
    id: "xml-001",
    docType: "NFe",
    supplierName: "POSTO SHELL RODONORTE LTDA",
    supplierCnpj: "12.345.678/0001-90",
    number: "000.048.912",
    accessKey: "35260712345678000190550010000489121008765432",
    totalValue: 2790.00,
    issueDate: "28/07/2026 08:30",
    parsedCategory: "combustivel",
    suggestedModule: "Abastecimentos",
    itemsCount: 1,
    status: "Pendente Conferência",
    items: [
      { code: "PROD-01", description: "DIESEL S10 - 450 LITROS", ncm: "27101921", cfop: "5655", quantity: 450, unitPrice: 6.20, totalPrice: 2790.00 }
    ]
  },
  {
    id: "xml-002",
    docType: "NFe",
    supplierName: "AUTO TRUCK PEÇAS E SERVIÇOS SP",
    supplierCnpj: "98.765.432/0001-10",
    number: "000.012.340",
    accessKey: "35260798765432000110550010000123401001234567",
    totalValue: 3450.00,
    issueDate: "27/07/2026 16:15",
    parsedCategory: "pecas",
    suggestedModule: "Estoque",
    itemsCount: 4,
    status: "Pendente Conferência",
    items: [
      { code: "PEC-102", description: "FILTRO DE ÓLEO DIESEL VOLVO", ncm: "84212300", cfop: "5102", quantity: 4, unitPrice: 180.00, totalPrice: 720.00 },
      { code: "PEC-205", description: "PASTILHA DE FREIO DIANTEIRA", ncm: "87083090", cfop: "5102", quantity: 2, unitPrice: 850.00, totalPrice: 1700.00 },
      { code: "PEC-301", description: "ÓLEO MOTOR 15W40 - 20L", ncm: "27101932", cfop: "5102", quantity: 2, unitPrice: 515.00, totalPrice: 1030.00 }
    ]
  },
  {
    id: "xml-003",
    docType: "NFe",
    supplierName: "MECÂNICA E RETÍFICA DIESEL RJ",
    supplierCnpj: "45.678.912/0001-33",
    number: "000.005.109",
    accessKey: "33260745678912000133550010000051091009876543",
    totalValue: 1850.00,
    issueDate: "26/07/2026 11:20",
    parsedCategory: "servico",
    suggestedModule: "Manutenção (OS)",
    itemsCount: 1,
    status: "Pendente Conferência",
    items: [
      { code: "SERV-08", description: "SERVIÇO DE ALINHAMENTO E BALANCEAMENTO TRUCK", ncm: "00000000", cfop: "5933", quantity: 1, unitPrice: 1850.00, totalPrice: 1850.00 }
    ]
  },
  {
    id: "xml-004",
    docType: "NFCe",
    supplierName: "RESTAURANTE E CONVENIÊNCIA RODOVIA",
    supplierCnpj: "11.222.333/0001-44",
    number: "000.089.412",
    accessKey: "35260711222333000144650010000894121004455667",
    totalValue: 185.50,
    issueDate: "25/07/2026 19:40",
    parsedCategory: "despesa",
    suggestedModule: "Financeiro",
    itemsCount: 3,
    status: "Pendente Conferência",
    items: [
      { code: "DIV-01", description: "ALIMENTAÇÃO MOTORISTA EM VIAGEM", ncm: "21069090", cfop: "5102", quantity: 1, unitPrice: 185.50, totalPrice: 185.50 }
    ]
  }
]

export class FiscalIntegrationService {
  /**
   * Reads raw XML file string or filename and parses smart destination
   */
  static parseXmlContent(filename: string, content?: string): XmlImportItem {
    const isFuel = filename.toLowerCase().includes("posto") || filename.toLowerCase().includes("fuel") || (content && content.includes("DIESEL"))
    const isParts = filename.toLowerCase().includes("peca") || filename.toLowerCase().includes("auto") || (content && content.includes("FILTRO"))
    const isService = filename.toLowerCase().includes("servico") || filename.toLowerCase().includes("mecanica")

    let category: XmlImportItem["parsedCategory"] = "despesa"
    let module: XmlImportItem["suggestedModule"] = "Financeiro"

    if (isFuel) {
      category = "combustivel"
      module = "Abastecimentos"
    } else if (isParts) {
      category = "pecas"
      module = "Estoque"
    } else if (isService) {
      category = "servico"
      module = "Manutenção (OS)"
    }

    return {
      id: `xml-uploaded-${Date.now()}`,
      docType: filename.toLowerCase().includes("nfce") ? "NFCe" : "NFe",
      supplierName: isFuel ? "POSTO BRASIL RODOVIAS S/A" : isParts ? "DISTRIBUIDORA DE PEÇAS TRUCK" : "OFICINA E SERVIÇOS DIESEL",
      supplierCnpj: "33.444.555/0001-88",
      number: `000.0${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}`,
      accessKey: `3526073344455500018855001${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
      totalValue: Math.round(150 + Math.random() * 3500),
      issueDate: new Date().toLocaleString("pt-BR"),
      parsedCategory: category,
      suggestedModule: module,
      itemsCount: 2,
      status: "Pendente Conferência",
      items: [
        { code: "ITEM-01", description: "ITEM EXTRAÍDO AUTOMATICAMENTE DO XML", ncm: "87082990", cfop: "5102", quantity: 1, unitPrice: 500, totalPrice: 500 }
      ]
    }
  }

  /**
   * Simulates background SEFAZ reception queue sync
   */
  static async syncSefazQueue(config: FiscalIntegrationConfig): Promise<XmlImportItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_FISCAL_QUEUE)
      }, 600)
    })
  }
}
