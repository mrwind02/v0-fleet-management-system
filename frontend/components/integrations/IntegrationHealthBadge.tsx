"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/utils/utils"

interface IntegrationHealthBadgeProps {
  uptimePct: number
  latencyMs: number
  className?: string
}

export function IntegrationHealthBadge({ uptimePct, latencyMs, className }: IntegrationHealthBadgeProps) {
  // Compute health bar color segments (5 bars)
  const isHealthy = uptimePct >= 99.0
  const isWarning = uptimePct >= 95.0 && uptimePct < 99.0

  return (
    <div className={cn("flex items-center gap-2 text-[11px]", className)}>
      {/* 5-segment health bar */}
      <div className="flex items-center gap-0.5" title={`Disponibilidade: ${uptimePct}%`}>
        {[1, 2, 3, 4, 5].map((seg) => {
          const active = uptimePct >= seg * 20 - 5
          return (
            <div
              key={seg}
              className={cn(
                "h-2 w-1 rounded-xs transition-colors",
                active
                  ? isHealthy
                    ? "bg-emerald-500"
                    : isWarning
                    ? "bg-amber-500"
                    : "bg-red-500"
                  : "bg-muted"
              )}
            />
          )
        })}
      </div>

      <span className="font-mono text-[10px] font-bold text-foreground">
        {uptimePct}% <span className="text-muted-foreground font-normal">Uptime</span>
      </span>

      <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 bg-muted/50 border-border">
        ⚡ {latencyMs > 0 ? `${latencyMs}ms` : "-- ms"}
      </Badge>
    </div>
  )
}
