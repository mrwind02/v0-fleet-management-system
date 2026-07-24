"use client"

import * as React from "react"
import { cn } from "@/utils/utils"
import { AlertTriangle, ArrowDown, ArrowUp, Minus } from "lucide-react"

type Priority = "Baixa" | "Média" | "Alta" | "Crítica"

interface PriorityBadgeProps {
  priority: Priority
  className?: string
  showIcon?: boolean
}

const priorityConfig: Record<Priority, { label: string; classes: string; icon: React.ReactNode }> = {
  Baixa: {
    label: "Baixa",
    classes: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    icon: <ArrowDown className="h-3 w-3" />,
  },
  Média: {
    label: "Média",
    classes: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    icon: <Minus className="h-3 w-3" />,
  },
  Alta: {
    label: "Alta",
    classes: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    icon: <ArrowUp className="h-3 w-3" />,
  },
  Crítica: {
    label: "Crítica",
    classes: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
}

export function PriorityBadge({ priority, className, showIcon = true }: PriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig["Média"]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        config.classes,
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  )
}
