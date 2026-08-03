"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FinanceiroDespesasRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/finance/expenses")
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen bg-background text-muted-foreground text-sm">
      Redirecionando para Despesas Operacionais...
    </div>
  )
}
