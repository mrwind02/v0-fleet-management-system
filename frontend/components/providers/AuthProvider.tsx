"use client"

import type { ReactNode } from "react"
import { useAuthInit } from "../../hooks/useAuthInit"

export function AuthProvider({ children }: { children: ReactNode }) {
  useAuthInit()
  return <>{children}</>
}
