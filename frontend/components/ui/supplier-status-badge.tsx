import * as React from "react"
import { cn } from "@/utils/utils"

export type SupplierStatus = "Ativo" | "Inativo" | "Suspenso" | "Em Homologação"

interface SupplierStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: SupplierStatus | string
}

const STATUS_STYLES: Record<string, string> = {
  "Ativo": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
  "Inativo": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  "Suspenso": "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
  "Em Homologação": "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
}

const STATUS_DOT: Record<string, string> = {
  "Ativo": "bg-emerald-500",
  "Inativo": "bg-slate-400",
  "Suspenso": "bg-rose-500",
  "Em Homologação": "bg-amber-500",
}

export function SupplierStatusBadge({ status, className, ...props }: SupplierStatusBadgeProps) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES["Inativo"]
  const dotColor = STATUS_DOT[status] || STATUS_DOT["Inativo"]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors shrink-0",
        styles,
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
      {status}
    </span>
  )
}
