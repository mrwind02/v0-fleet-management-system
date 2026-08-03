"use client"

import * as React from "react"
import { Layers, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyIntegrationStateProps {
  onOpenCatalog: () => void
}

export function EmptyIntegrationState({ onOpenCatalog }: EmptyIntegrationStateProps) {
  return (
    <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-card space-y-4 max-w-lg mx-auto my-8">
      <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center mx-auto">
        <Layers className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">Nenhuma Integração Instalada</h3>
        <p className="text-xs text-muted-foreground">
          Conecte o FrotaOne com Google Maps, WhatsApp Meta, SEFAZ DF-e, IA ou gateways REST para ampliar a automação da sua frota.
        </p>
      </div>
      <Button
        onClick={onOpenCatalog}
        className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4"
      >
        <Plus className="h-4 w-4" /> Explorar Catálogo de Integrações
      </Button>
    </div>
  )
}
