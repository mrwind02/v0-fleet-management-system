import { API_BASE_URL, handleApiError } from "../utils"

export interface Fine {
  id: string;
  auto_number: string;
  infraction_date: string;
  organ: string;
  category: string;
  description?: string;
  vehicle_id?: string;
  vehicle_plate?: string;
  driver_id?: string;
  driver_name?: string;
  value: number;
  points: number;
  due_date: string;
  status: string;
  file_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const fineService = {
  getFines: async (): Promise<Fine[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fines`)
      if (!response.ok) throw new Error("Falha ao buscar multas")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  createFine: async (data: Partial<Fine>): Promise<Fine> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error("Falha ao criar multa")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  getFineById: async (id: string): Promise<Fine> => {
    try {
      const response = await fetch(`${API_BASE_URL}/fines/${id}`)
      if (!response.ok) throw new Error("Falha ao buscar multa")
      return await response.json()
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
