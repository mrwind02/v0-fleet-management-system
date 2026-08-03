"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { IntegrationStatusType } from "@/types/integrations"

interface IntegrationStatusProps {
  status: IntegrationStatusType
  className?: string
}

export function IntegrationStatus({ status, className }: IntegrationStatusProps) {
  switch (status) {
    case "connected":
      return (
        <Badge variant="outline" className={`bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold text-[10px] gap-1 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Conectado
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className={`bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold text-[10px] gap-1 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Configuração Pendente
        </Badge>
      )
    case "warning":
      return (
        <Badge variant="outline" className={`bg-orange-500/10 text-orange-600 border-orange-500/30 font-bold text-[10px] gap-1 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Atenção
        </Badge>
      )
    case "error":
      return (
        <Badge variant="outline" className={`bg-red-500/10 text-red-600 border-red-500/30 font-bold text-[10px] gap-1 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Erro de Conexão
        </Badge>
      )
    case "disabled":
    default:
      return (
        <Badge variant="outline" className={`bg-muted text-muted-foreground border-border font-bold text-[10px] gap-1 ${className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Desativado
        </Badge>
      )
  }
}
