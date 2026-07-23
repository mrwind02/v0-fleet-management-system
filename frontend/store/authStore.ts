import { create } from "zustand"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "manager" | "driver"
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: {
    id: "dev-mock-id",
    email: "admin@fleet.com",
    name: "Administrador (Dev)",
    role: "admin",
  },
  accessToken: "mock-token",
  refreshToken: "mock-refresh",
  isLoading: false,

  login: (accessToken, refreshToken, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))
    }
    set({ accessToken, refreshToken, user })
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
    }
    set({ accessToken: null, refreshToken: null, user: null })
  },

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))
