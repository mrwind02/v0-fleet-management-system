"use client"

import { AppLayout } from "../../../components/layout/AppLayout"
import { ChevronRight, Wrench } from "lucide-react"

export default function ServiceOrdersPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center text-xs font-semibold text-muted-foreground">
            <span className="text-foreground cursor-pointer hover:underline">Manutenção</span>
            <ChevronRight className="h-3 w-3 mx-1.5" />
            <span>Ordens de Serviço</span>
          </div>
        </div>

        {/* Empty State Content */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col items-center justify-center p-16 mt-4 text-center">
          <Wrench className="h-16 w-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">Ordens de Serviço</h2>
          <p className="text-sm text-slate-500 max-w-md">
            O módulo de ordens de serviço está em desenvolvimento. Em breve, você poderá criar, aprovar e acompanhar os serviços corretivos da frota.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
