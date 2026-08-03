import * as React from "react"
import { cn } from "@/utils/utils"
import { Tag } from "lucide-react"

interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: string
  showIcon?: boolean
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  "Pedágio": "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
  "Estacionamento": "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
  "Lavagem": "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60",
  "Alimentação": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
  "Hospedagem": "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60",
  "Balsa": "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/60",
  "Ferry Boat": "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/60",
  "Ferry": "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/60",
  "Guincho": "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800/60",
  "Táxi": "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
  "Aplicativo de Transporte": "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
  "Frete Terceirizado": "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800/60",
  "Material Operacional": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  "Material Administrativo": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  "EPI": "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
  "Ferramentas": "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700",
  "Outros": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
}

export function CategoryBadge({ category, showIcon = false, className, ...props }: CategoryBadgeProps) {
  const styles = CATEGORY_COLOR_MAP[category] || CATEGORY_COLOR_MAP["Outros"]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border transition-colors shrink-0",
        styles,
        className
      )}
      {...props}
    >
      {showIcon && <Tag className="h-3 w-3 opacity-70" />}
      {category}
    </span>
  )
}
