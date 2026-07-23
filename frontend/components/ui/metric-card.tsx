"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/utils/utils"
import { TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  iconBgColor?: string
  iconColor?: string
  sparklineData?: { value: number }[]
  sparklineColor?: string
}

export function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  sparklineData,
  sparklineColor = "var(--color-primary)",
  className,
  ...props
}: MetricCardProps) {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card className={cn("overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-all border-muted-foreground/10", className)} {...props}>
        <CardContent className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between h-full">
          {/* Top Section: Icon + Title/Value */}
          <div className="flex items-start gap-2.5">
            {icon && (
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconBgColor, iconColor)}>
                {icon}
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground leading-tight truncate">{title}</span>
              <motion.div 
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="text-sm sm:text-base font-bold tracking-tight mt-0.5 text-foreground leading-none truncate"
              >
                {value}
              </motion.div>
            </div>
          </div>
          
          {/* Trend Section */}
          <div className="mt-3">
            {(trend !== undefined || trendLabel) && (
              <p className="flex items-center text-[10px] font-medium leading-none">
                {trend !== undefined && (
                  <span
                    className={cn(
                      "flex items-center mr-1 font-bold",
                      isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {isPositive ? <TrendingUp className="mr-0.5 h-3 w-3" /> : isNegative ? <TrendingDown className="mr-0.5 h-3 w-3" /> : null}
                    {trend > 0 ? "+" : ""}
                    {trend}%
                  </span>
                )}
                <span className="text-muted-foreground truncate">{trendLabel}</span>
              </p>
            )}
          </div>
          
          {/* Sparkline Section */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-[20px] w-full mt-1 -mb-1 -mx-1 opacity-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={sparklineColor} 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
