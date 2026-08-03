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

  getDocumentById: async (id: string): Promise<Document> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`)
      if (!response.ok) throw new Error("Falha ao buscar documento")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  createDocument: async (data: FormData | Partial<Document>): Promise<Document> => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data as FormData : JSON.stringify(data)
      })
      if (!response.ok) throw new Error("Falha ao criar documento")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateDocument: async (id: string, data: FormData | Partial<Document>): Promise<Document> => {
    try {
      const isFormData = data instanceof FormData;
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'PUT',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data as FormData : JSON.stringify(data)
      })
      if (!response.ok) throw new Error("Falha ao atualizar documento")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  deleteDocument: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error("Falha ao excluir documento")
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
