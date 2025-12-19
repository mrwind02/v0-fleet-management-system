import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Interceptor para renovar token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })

        const { accessToken } = response.data.data
        localStorage.setItem("accessToken", accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  },
)

// Auth Services
export const authService = {
  register: (email: string, password: string, name: string, role?: string) => api.post("/auth/register", { email, password, name, role }),
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  getProfile: () => api.get("/auth/profile"),
}

// Vehicle Services
export const vehicleService = {
  create: (data: any) => api.post("/vehicles", data),
  getAll: (active?: boolean) => api.get("/vehicles", { params: { active } }),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
}

// Driver Services
export const driverService = {
  create: (data: any) => api.post("/drivers", data),
  getAll: (active?: boolean) => api.get("/drivers", { params: { active } }),
  getById: (id: string) => api.get(`/drivers/${id}`),
  update: (id: string, data: any) => api.put(`/drivers/${id}`, data),
  assignToVehicle: (driverId: string, vehicleId: string, notes?: string) =>
    api.post(`/drivers/${driverId}/assign-vehicle`, { vehicleId, notes }),
  getCurrentVehicle: (driverId: string) => api.get(`/drivers/${driverId}/current-vehicle`),
  delete: (id: string) => api.delete(`/drivers/${id}`),
}

// Maintenance Services
export const maintenanceService = {
  getAll: () => api.get("/maintenance"),
  create: (data: any) => api.post("/maintenance", data),
  getByVehicle: (vehicleId: string, filters?: any) => api.get(`/maintenance/vehicle/${vehicleId}`, { params: filters }),
  getById: (id: string) => api.get(`/maintenance/${id}`),
  update: (id: string, data: any) => api.put(`/maintenance/${id}`, data),
}

// Questionnaire Services
export const questionnaireService = {
  record: (data: any) => api.post("/questionnaire", data),
  getByDriver: (driverId: string, limit?: number) =>
    api.get(`/questionnaire/driver/${driverId}`, { params: { limit } }),
  getLatest: (driverId: string) => api.get(`/questionnaire/driver/${driverId}/latest`),
}

// Report Services
export const reportService = {
  getMetrics: () => api.get("/reports/metrics"),
  getRecentMaintenance: (limit?: number) => api.get("/reports/recent-maintenance", { params: { limit } }),
  getRecentActivities: (limit?: number, vehicleId?: string) =>
    api.get("/reports/recent-activities", { params: { limit, vehicleId } }),
  exportMaintenanceCSV: (params: { vehicleId?: string; startDate?: string; endDate?: string }) =>
    api.get("/reports/maintenance/csv", { params, responseType: "blob" }),
  exportMaintenancePDF: (params: { vehicleId?: string; startDate?: string; endDate?: string; timezone?: string }) =>
    api.get("/reports/maintenance/pdf", { params, responseType: "blob" }),
  exportQuestionnaireCSV: (startDate: string, endDate: string, driverId?: string, timezone?: string) =>
    api.get("/reports/questionnaire/csv", { params: { startDate, endDate, driverId, timezone }, responseType: "blob" }),
  exportQuestionnairePDF: (startDate: string, endDate: string, driverId?: string, timezone?: string) =>
    api.get("/reports/questionnaire/pdf", { params: { startDate, endDate, driverId, timezone }, responseType: "blob" }),
}

// User Services (Admin)
export const userService = {
  getAll: () => api.get("/users"),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

// Settings Services
export const settingsService = {
  getPublic: (key: string) => api.get("/settings/public", { params: { key } }),
  getAll: () => api.get("/settings"),
  update: (key: string, value: string) => api.put(`/settings/${key}`, { value }),
}

// Fuel Services
export const fuelService = {
  getAll: () => api.get("/fuel"),
  create: (data: any) => api.post("/fuel", data),
  getByVehicle: (vehicleId: string) => api.get(`/fuel/vehicle/${vehicleId}`),
  getById: (id: string) => api.get(`/fuel/${id}`),
  update: (id: string, data: any) => api.put(`/fuel/${id}`, data),
  delete: (id: string) => api.delete(`/fuel/${id}`),
}
