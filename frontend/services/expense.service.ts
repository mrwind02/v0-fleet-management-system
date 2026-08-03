const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface ExpenseAttachment {
  id: string
  expense_id: string
  name: string
  file_url: string
  file_type?: string
  file_size?: string
  created_at: string
}

export interface ExpenseHistoryItem {
  id: string
  expense_id: string
  event_type: string
  description: string
  old_value?: string
  new_value?: string
  user_name?: string
  created_at: string
}

export interface ExpenseCategory {
  id: string
  name: string
  icon?: string
  color?: string
  created_at?: string
}

export interface Expense {
  id: string
  number: number
  category_name: string
  description: string
  date: string
  time?: string
  amount: number
  payment_method: string
  unit_name: string
  vehicle_id?: string
  vehicle_info?: string
  vehicle_plate?: string
  vehicle_brand?: string
  vehicle_model?: string
  driver_id?: string
  driver_name?: string
  driver_full_name?: string
  cost_center: string
  supplier?: string
  city?: string
  responsible?: string
  is_reimbursable: boolean
  reimbursement_amount?: number
  reimbursement_payee?: string
  reimbursement_due_date?: string
  reimbursement_status?: string
  status: 'Pendente' | 'Aguardando Aprovação' | 'Aprovada' | 'Reembolsada' | 'Cancelada'
  has_attachment: boolean
  notes?: string
  project?: string
  attachments?: ExpenseAttachment[]
  history?: ExpenseHistoryItem[]
  created_at: string
  updated_at: string
}

export interface ExpenseMetrics {
  totalMonth: number
  pendingCount: number
  reimbursementsPending: number
  noAttachmentCount: number
  avgPerVehicle: number
  avgPerDriver: number
}

export interface ExpenseCharts {
  byMonth: { name: string; value: number }[]
  byCategory: { name: string; value: number }[]
  byUnit: { name: string; value: number }[]
}

export interface ExpenseInsights {
  topCategory: { name: string; amount: number; percent: number }
  topVehicle: { name: string; amount: number; period: string }
  topDriver: { name: string; amount: number; type: string }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const expenseService = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchJson<Expense[]>(`${API_BASE_URL}/expenses${qs}`)
  },

  getById: (id: string) =>
    fetchJson<Expense>(`${API_BASE_URL}/expenses/${id}`),

  getMetrics: () =>
    fetchJson<ExpenseMetrics>(`${API_BASE_URL}/expenses/metrics`),

  getCharts: () =>
    fetchJson<ExpenseCharts>(`${API_BASE_URL}/expenses/charts`),

  getInsights: () =>
    fetchJson<ExpenseInsights>(`${API_BASE_URL}/expenses/insights`),

  getCategories: () =>
    fetchJson<ExpenseCategory[]>(`${API_BASE_URL}/expenses/categories`),

  createCategory: (category: Partial<ExpenseCategory>) =>
    fetchJson<ExpenseCategory>(`${API_BASE_URL}/expenses/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    }),

  create: (data: Partial<Expense>) =>
    fetchJson<Expense>(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Expense>) =>
    fetchJson<Expense>(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: Expense['status'], userName?: string) =>
    fetchJson<Expense>(`${API_BASE_URL}/expenses/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, user_name: userName }),
    }),

  delete: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
    }),

  addAttachment: (id: string, attachment: Partial<ExpenseAttachment>) =>
    fetchJson<ExpenseAttachment>(`${API_BASE_URL}/expenses/${id}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attachment),
    }),

  removeAttachment: (id: string, attachmentId: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE_URL}/expenses/${id}/attachments/${attachmentId}`, {
      method: 'DELETE',
    }),
}
