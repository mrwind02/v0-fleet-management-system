"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Truck,
  Users,
  Wrench,
  DollarSign,
  FileText,
  Store,
  CheckSquare,
  PieChart,
  LayoutGrid
} from "lucide-react"

import { ReportCategory } from "@/types/reports"
import { cn } from "@/utils/utils"

interface CategoryCardProps {
  category: ReportCategory | "todos"
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  todos: <LayoutGrid className="h-4 w-4" />,
  frota: <Truck className="h-4 w-4" />,
  motoristas: <Users className="h-4 w-4" />,
  manutencao: <Wrench className="h-4 w-4" />,
  financeiro: <DollarSign className="h-4 w-4" />,
  documentacao: <FileText className="h-4 w-4" />,
  fornecedores: <Store className="h-4 w-4" />,
  checklists: <CheckSquare className="h-4 w-4" />,
  executivo: <PieChart className="h-4 w-4" />
}

export function CategoryCard({
  category,
  label,
  count,
  isActive,
  onClick
}: CategoryCardProps) {
  const icon = CATEGORY_ICONS[category] || <FileText className="h-4 w-4" />

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 shrink-0",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
          : "bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border/70"
      )}
    >
      <span className={cn("p-1 rounded-md", isActive ? "bg-white/20" : "bg-muted text-foreground")}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
      <span
        className={cn(
          "ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
          isActive
            ? "bg-white/30 text-primary-foreground"
            : "bg-muted-foreground/15 text-muted-foreground"
        )}
      >
        {count}
      </span>
    </motion.button>
  )
}
