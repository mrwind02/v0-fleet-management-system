"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Info, Truck, DollarSign, Wrench, Clock, Fuel, FileCheck } from "lucide-react"
import { ExecutiveKpiItem } from "@/types/indicators"
import { cn } from "@/utils/utils"

const ICON_MAP: Record<string, React.ReactNode> = {
  Truck: <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
  DollarSign: <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
  Wrench: <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
  Clock: <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
  Fuel: <Fuel className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />,
  FileCheck: <FileCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
}

interface ExecutiveMetricCardProps {
  item: ExecutiveKpiItem
}

export function ExecutiveMetricCard({ item }: ExecutiveMetricCardProps) {
  const icon = (item.iconName && ICON_MAP[item.iconName]) || <Info className="h-4 w-4" />

  // Generate SVG path for sparkline
  const sparklinePath = React.useMemo(() => {
    if (!item.sparklineData || item.sparklineData.length === 0) return ""
    const min = Math.min(...item.sparklineData)
    const max = Math.max(...item.sparklineData)
    const range = max - min || 1
    const width = 100
    const height = 30
    const points = item.sparklineData.map((val, idx) => {
      const x = (idx / (item.sparklineData.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 6) - 3
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return `M ${points.join(" L ")}`
  }, [item.sparklineData])

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="h-full"
    >
      <div className="h-full bg-card border border-border/70 hover:border-primary/40 rounded-xl p-3.5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative group">
        {/* Top Header: Icon + Title + Tooltip icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 rounded-lg bg-muted shrink-0">
              {icon}
            </div>
            <span className="text-xs font-semibold text-muted-foreground truncate" title={item.title}>
              {item.title}
            </span>
          </div>

          <div className="relative group/tooltip shrink-0">
            <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
            <div className="absolute right-0 top-5 hidden group-hover/tooltip:block w-52 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-30 pointer-events-none leading-relaxed">
              {item.tooltipText}
            </div>
          </div>
        </div>

        {/* Value + Sparkline Row */}
        <div className="flex items-baseline justify-between gap-2 my-2">
          <div>
            <div className="text-xl font-extrabold text-foreground tracking-tight leading-none">
              {item.value}
            </div>
            {item.target && (
              <span className="text-[10px] font-medium text-muted-foreground block mt-1">
                {item.target}
              </span>
            )}
          </div>

          {/* Mini Sparkline Chart */}
          {sparklinePath && (
            <div className="w-20 h-7 shrink-0">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke={item.isPositive ? "#10B981" : "#EF4444"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Footer Trend Row */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/40 text-[11px]">
          {item.isPositive ? (
            <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              +{Math.abs(item.trendDelta)}%
            </span>
          ) : (
            <span className="flex items-center font-bold text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-3 w-3 mr-0.5" />
              {item.trendDelta}%
            </span>
          )}
          <span className="text-muted-foreground text-[10px]">vs. mês anterior</span>
        </div>
      </div>
    </motion.div>
  )
}
