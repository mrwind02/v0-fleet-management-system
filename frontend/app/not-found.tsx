"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutGrid, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full text-center space-y-4 bg-card border rounded-2xl p-8 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-[#0F5DFB] flex items-center justify-center mx-auto">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Página não encontrada</h1>
        <p className="text-xs text-muted-foreground">
          A página ou recurso solicitado não existe ou foi movido.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button className="w-full bg-[#0F5DFB] hover:bg-[#0F5DFB]/90 text-white font-bold gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
