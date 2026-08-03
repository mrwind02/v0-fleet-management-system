"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, AlertTriangle, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GoalItem } from "@/types/indicators"
import { cn } from "@/utils/utils"

interface GoalCardProps {
  goal: GoalItem
}

export function GoalCard({ goal }: GoalCardProps) {
  const percentage = Math.min(Math.max(goal.progress, 0), 100)

  return (
    <div className="bg-card border rounded-xl p-3.5 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow">
      {/* Top Header: Title (2 lines max, fixed height) + Badge */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-1.5 min-w-0">
          <div className="flex items-start gap-1.5 min-w-0 flex-1">
            <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <h4
              className="text-xs font-bold text-foreground leading-tight line-clamp-2 min-h-[32px] flex items-center"
              title={goal.title}
            >
              {goal.title}
            </h4>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] font-bold px-1.5 py-0.5 shrink-0 uppercase tracking-tight",
              goal.isMet
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-600 border-amber-500/30"
            )}
          >
            {goal.isMet ? "Atingida" : "Em Meta"}
          </Badge>
        </div>

        {/* Value Comparison Block - Fixed height to ensure progress bar alignment */}
        <div className="flex items-end justify-between min-h-[38px] pt-1">
          <div className="flex flex-col justify-end">
            <span className="text-base font-extrabold text-foreground font-mono leading-none">
              {goal.formattedCurrent}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium mt-1">
              Meta: {goal.formattedTarget}
            </span>
          </div>

          <span className="text-xs font-extrabold font-mono text-muted-foreground shrink-0">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar + Footer Status - Fixed at bottom */}
      <div className="space-y-2 pt-2.5">
        {/* Progress Bar */}
        <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-all",
              goal.isMet ? "bg-emerald-500" : "bg-amber-500"
            )}
          />
        </div>

        {/* Status Footer */}
        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground truncate">
          {goal.isMet ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          )}
          <span className="truncate" title={goal.deltaText}>{goal.deltaText}</span>
        </div>
      </div>
    </div>
  )
}
