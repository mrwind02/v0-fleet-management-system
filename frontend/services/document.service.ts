import { API_BASE_URL, handleApiError } from "../utils"

export interface Document {
  id: string;
  name: string;
  category: string;
  related_to?: string;
  number?: string;
  issue_date?: string;
  expiry_date: string;
  status: string;
  responsible?: string;
  file_url?: string;
  notes?: string;
  vehicle_id?: string;
  driver_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const documentService = {
  getDocuments: async (): Promise<Document[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`)
      if (!response.ok) throw new Error("Falha ao buscar documentos")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  createDocument: async (data: Partial<Document>): Promise<Document> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error("Falha ao criar documento")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
