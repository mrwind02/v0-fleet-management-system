const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface SupplierContract {
  id: string
  supplier_id: string
  contract_number: string
  description: string
  start_date: string
  end_date: string
  amount: number
  status: 'Vigente' | 'Vencendo em breve' | 'Vencido' | 'Encerrado'
  file_url?: string
  created_at: string
}

export interface SupplierContact {
  id: string
  supplier_id: string
  name: string
  role?: string
  phone?: string
  whatsapp?: string
  email?: string
  is_primary: boolean
  created_at: string
}

export interface SupplierDocument {
  id: string
  supplier_id: string
  doc_type: string
  name: string
  file_url?: string
  expiry_date?: string
  created_at: string
}

export interface SupplierHistoryItem {
  id: string
  supplier_id: string
  event_type: string
  description: string
  old_value?: string
  new_value?: string
  user_name?: string
  created_at: string
}

export interface SupplierCategory {
  id: string
  name: string
  description?: string
  created_at?: string
}

export interface Supplier {
  id: string
  code: string
  trade_name: string
  corporate_name: string
  cnpj: string
  state_registration?: string
  municipal_registration?: string
  primary_category: string
  specialty?: string
  categories: string[]
  status: 'Ativo' | 'Inativo' | 'Suspenso' | 'Em Homologação'
  is_homologated: boolean
  rating: number
  contact_name?: string
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  zip_code?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city: string
  state: string
  country?: string
  units: string[]
  preferred_payment_method?: string
  payment_terms_days?: number
  bank_info?: string
  pix_key?: string
  financial_notes?: string
  notes?: string
  first_contract_date?: string
  last_service_date?: string
  total_spent: number
  services_count: number
  active_contracts_count?: number
  contracts?: SupplierContract[]
  contacts?: SupplierContact[]
  documents?: SupplierDocument[]
  history?: SupplierHistoryItem[]
  work_orders?: any[]
  expenses?: any[]
  created_at: string
  updated_at: string
}

export interface SupplierMetrics {
  activeSuppliers: number
  activeContracts: number
  expiringContracts: number
  monthPayments: number
  totalSpentYear: number
  avgRating: number
}

export interface SupplierCharts {
  bySpent: { name: string; value: number }[]
  byCategory: { name: string; value: number }[]
  contractsHistory: { name: string; novos: number; renovados: number; encerrados: number }[]
}

export interface SupplierInsights {
  topBilling: { name: string; amount: number; period: string }
  topRated: { name: string; rating: number; servicesCount: number }
  criticalContract: { name: string; description: string; daysLeft: number }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const supplierService = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchJson<Supplier[]>(`${API_BASE_URL}/suppliers${qs}`)
  },

  getById: (id: string) =>
    fetchJson<Supplier>(`${API_BASE_URL}/suppliers/${id}`),

  getMetrics: () =>
    fetchJson<SupplierMetrics>(`${API_BASE_URL}/suppliers/metrics`),

  getCharts: () =>
    fetchJson<SupplierCharts>(`${API_BASE_URL}/suppliers/charts`),

  getInsights: () =>
    fetchJson<SupplierInsights>(`${API_BASE_URL}/suppliers/insights`),

  getCategories: () =>
    fetchJson<SupplierCategory[]>(`${API_BASE_URL}/suppliers/categories`),

  createCategory: (data: Partial<SupplierCategory>) =>
    fetchJson<SupplierCategory>(`${API_BASE_URL}/suppliers/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  create: (data: Partial<Supplier>) =>
    fetchJson<Supplier>(`${API_BASE_URL}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Supplier>) =>
    fetchJson<Supplier>(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: Supplier['status'], userName?: string) =>
    fetchJson<Supplier>(`${API_BASE_URL}/suppliers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, user_name: userName }),
    }),

  delete: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'DELETE',
    }),

  addContract: (id: string, contract: Partial<SupplierContract>) =>
    fetchJson<SupplierContract>(`${API_BASE_URL}/suppliers/${id}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contract),
    }),

  deleteContract: (id: string, contractId: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE_URL}/suppliers/${id}/contracts/${contractId}`, {
      method: 'DELETE',
    }),

  addContact: (id: string, contact: Partial<SupplierContact>) =>
    fetchJson<SupplierContact>(`${API_BASE_URL}/suppliers/${id}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    }),

  addDocument: (id: string, doc: Partial<SupplierDocument>) =>
    fetchJson<SupplierDocument>(`${API_BASE_URL}/suppliers/${id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    }),
}
