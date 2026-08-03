"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function FinanceiroDespesaDetailRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (id) {
      router.replace(`/finance/expenses/${id}`)
    }
  }, [router, id])

  return (
    <div className="flex items-center justify-center h-screen bg-background text-muted-foreground text-sm">
      Redirecionando para Detalhes da Despesa...
    </div>
  )
}
