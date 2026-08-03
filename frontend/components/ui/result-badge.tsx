"use client"

import * as React from "react"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ChecklistResult } from "@/types/checklist"
import { cn } from "@/utils/utils"

interface ResultBadgeProps {
  result: ChecklistResult
  className?: string
}

export function ResultBadge({ result, className }: ResultBadgeProps) {
  switch (result) {
    case "Aprovado":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold gap-1 px-2 py-0.5",
            className
          )}
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          Aprovado
        </Badge>
      )
    case "Aprovado com Ressalvas":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-bold gap-1 px-2 py-0.5",
            className
          )}
        >
          <AlertTriangle className="h-3 w-3 shrink-0" />
          Aprovado com Ressalvas
        </Badge>
      )
    case "Reprovado":
      return (
        <Badge
          variant="outline"
          className={cn(
            "bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-bold gap-1 px-2 py-0.5",
            className
          )}
        >
          <XCircle className="h-3 w-3 shrink-0" />
          Reprovado
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className={cn("text-[10px] font-bold", className)}>
          {result}
        </Badge>
      )
  }
}
