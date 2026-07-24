import { API_BASE_URL, handleApiError } from "../utils"

export interface DocumentDashboardMetrics {
  totalDocuments: number
  validDocuments: number
  expiringDocuments: number
  expiredDocuments: number
  pendingApproval: number
  complianceIndex: number
}

export const documentDashboardService = {
  getMetrics: async (): Promise<DocumentDashboardMetrics> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/metrics`)
      if (!response.ok) throw new Error("Falha ao buscar métricas de documentos")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  getComplianceData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/compliance`)
      if (!response.ok) throw new Error("Falha ao buscar dados de conformidade")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  getCategoryData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/by-category`)
      if (!response.ok) throw new Error("Falha ao buscar documentos por categoria")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  getExpiryByMonth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/expiry-by-month`)
      if (!response.ok) throw new Error("Falha ao buscar previsão de vencimentos")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
