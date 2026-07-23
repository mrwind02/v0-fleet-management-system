export interface DocumentDashboardMetrics {
  totalDocuments: number
  validDocuments: number
  expiringDocuments: number
  expiredDocuments: number
  pendingApproval: number
  complianceIndex: number
}

/**
 * Camada de abstração para os dados do Dashboard de Documentos.
 * Fornece dados mockados para UI até que a API esteja pronta.
 */
export const documentDashboardService = {
  getMetrics: async (): Promise<DocumentDashboardMetrics> => {
    // Simulando delay de rede
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      totalDocuments: 1450,
      validDocuments: 1320,
      expiringDocuments: 85,
      expiredDocuments: 12,
      pendingApproval: 33,
      complianceIndex: 96.8
    }
  },

  getComplianceData: async () => {
    return [
      { name: 'Válidos', value: 1320, fill: 'var(--color-success)' },
      { name: 'A Vencer', value: 85, fill: 'var(--color-warning)' },
      { name: 'Vencidos', value: 12, fill: 'var(--color-destructive)' },
    ]
  },

  getCategoryData: async () => {
    return [
      { name: 'Veículos', value: 650 },
      { name: 'Motoristas', value: 420 },
      { name: 'Seguros', value: 180 },
      { name: 'Empresa', value: 120 },
      { name: 'Licenças', value: 80 }
    ]
  }
}
