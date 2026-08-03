"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SuppliersRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/cadastros/fornecedores")
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen bg-background text-muted-foreground text-sm">
      Redirecionando para Fornecedores...
    </div>
  )
}
