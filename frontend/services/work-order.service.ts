const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface WorkOrderAttachment {
  id: string
  work_order_id: string
  name: string
  file_url: string
  file_type?: string
  file_size?: string
  created_at: string
}

export interface WorkOrder {
  id: string
  number: number
  type: 'Preventiva' | 'Corretiva' | 'Emergencial' | 'Revisão' | 'Garantia'
  status: 'Aberta' | 'Aguardando Aprovação' | 'Aguardando Peças' | 'Em Execução' | 'Pausada' | 'Concluída' | 'Cancelada'
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  vehicle_id?: string
  vehicle_plate?: string
  vehicle_brand?: string
  vehicle_model?: string
  vehicle_year?: number
  driver_id?: string
  driver_name?: string
  unit?: string
  workshop_name?: string
  workshop_type?: 'Interna' | 'Externa'
  responsible?: string
  origin?: string
  description?: string
  diagnosis?: string
  notes?: string
  opened_at: string
  estimated_at?: string
  closed_at?: string
  km_opening?: number
  km_closing?: number
  cost_parts: number
  cost_labor: number
  cost_towing: number
  cost_others: number
  cost_total: number
  services?: WorkOrderService[]
  parts?: WorkOrderPart[]
  history?: WorkOrderHistoryItem[]
  attachments?: WorkOrderAttachment[]
  created_at: string
  updated_at: string
}

export interface WorkOrderService {
  id: string
  work_order_id: string
  description: string
  quantity: number
  unit_time_hours?: number
  unit_price: number
  total_price: number
  responsible?: string
  created_at: string
}

export interface WorkOrderPart {
  id: string
  work_order_id: string
  name: string
  part_code?: string
  supplier?: string
  quantity: number
  unit_price: number
  total_price: number
  situation: 'Disponível' | 'Aguardando' | 'Pedido' | 'Chegou' | 'Instalado'
  created_at: string
}

export interface WorkOrderHistoryItem {
  id: string
  work_order_id: string
  event_type: string
  description: string
  old_value?: string
  new_value?: string
  user_name?: string
  created_at: string
}

export interface WorkOrderMetrics {
  total: number
  inProgress: number
  waitingParts: number
  waitingApproval: number
  paused: number
  overdue: number
  costMonth: number
  vehiclesDown: number
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const workOrderService = {
  getAll: (params?: { status?: string; type?: string; vehicle_id?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return fetchJson<WorkOrder[]>(`${API_BASE_URL}/work-orders${qs}`)
  },

  getById: (id: string) =>
    fetchJson<WorkOrder>(`${API_BASE_URL}/work-orders/${id}`),

  getMetrics: () =>
    fetchJson<WorkOrderMetrics>(`${API_BASE_URL}/work-orders/metrics`),

  getCostByMonth: () =>
    fetchJson<{ name: string; value: number }[]>(`${API_BASE_URL}/work-orders/cost-by-month`),

  getByType: () =>
    fetchJson<{ name: string; value: number }[]>(`${API_BASE_URL}/work-orders/by-type`),

  getByStatus: () =>
    fetchJson<{ name: string; value: number }[]>(`${API_BASE_URL}/work-orders/by-status`),

  getInsights: () =>
    fetchJson<any>(`${API_BASE_URL}/work-orders/insights`),

  create: (data: Partial<WorkOrder>) =>
    fetchJson<WorkOrder>(`${API_BASE_URL}/work-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<WorkOrder>) =>
    fetchJson<WorkOrder>(`${API_BASE_URL}/work-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: WorkOrder['status'], userName?: string) =>
    fetchJson<WorkOrder>(`${API_BASE_URL}/work-orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, user_name: userName }),
    }),

  addService: (id: string, serviceData: Partial<WorkOrderService>) =>
    fetchJson<WorkOrderService>(`${API_BASE_URL}/work-orders/${id}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    }),

  removeService: (id: string, serviceId: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE_URL}/work-orders/${id}/services/${serviceId}`, {
      method: 'DELETE',
    }),

  addPart: (id: string, partData: Partial<WorkOrderPart>) =>
    fetchJson<WorkOrderPart>(`${API_BASE_URL}/work-orders/${id}/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partData),
    }),

  removePart: (id: string, partId: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE_URL}/work-orders/${id}/parts/${partId}`, {
      method: 'DELETE',
    }),

  addAttachment: (id: string, attachmentData: Partial<WorkOrderAttachment>) =>
    fetchJson<WorkOrderAttachment>(`${API_BASE_URL}/work-orders/${id}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attachmentData),
    }),

  removeAttachment: (id: string, attachmentId: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE_URL}/work-orders/${id}/attachments/${attachmentId}`, {
      method: 'DELETE',
    }),
}
