"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/utils/utils"
import { motion } from "framer-motion"

interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
  type?: string
  data?: any[]
  labels?: string[]
}

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
  ...props
}: ChartCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full flex flex-col"
    >
      <Card className={cn("p-0 gap-0 flex flex-col flex-1 overflow-hidden shadow-sm border-muted-foreground/10 hover:shadow-md transition-all", className)} {...props}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1 gap-2">
          <div className="space-y-0.5 min-w-0 flex-1">
            <CardTitle className="text-xs sm:text-sm font-bold text-foreground leading-tight truncate" title={title}>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-[11px] text-muted-foreground truncate">{description}</CardDescription>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </CardHeader>
        <CardContent className="flex-1 p-3 pt-1">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}
