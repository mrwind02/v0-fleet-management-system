"use client"

import { useEffect } from "react"
import { useAuthStore } from "../store/authStore"

export function useAuthInit() {
  const { setUser, login } = useAuthStore()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      const accessToken = localStorage.getItem("accessToken")
      const refreshToken = localStorage.getItem("refreshToken")

      if (user && accessToken && refreshToken) {
        try {
          const parsedUser = JSON.parse(user)
          login(accessToken, refreshToken, parsedUser)
        } catch (e) {
          console.error("Failed to restore auth state:", e)
        }
      }
    }
  }, [login])
}
