"use client"

import * as React from "react"
import { Badge, BadgeProps } from "@/components/ui/badge"
import { cn } from "@/utils/utils"
import { motion } from "framer-motion"

export type StatusPillVariant = 
  | "default" 
  | "success" 
  | "warning" 
  | "destructive"
  | "neutral"

interface StatusPillProps extends Omit<BadgeProps, "variant"> {
  status: StatusPillVariant
  label: string
  pulse?: boolean
}

const variantStyles: Record<StatusPillVariant, string> = {
  default: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
  success: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  warning: "bg-warning/10 text-warning-foreground dark:text-warning border-warning/20 hover:bg-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
}

const dotStyles: Record<StatusPillVariant, string> = {
  default: "bg-blue-500",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

export function StatusPill({
  status = "default",
  label,
  pulse = false,
  className,
  ...props
}: StatusPillProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border shadow-sm flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap",
        variantStyles[status],
        className
      )}
      {...props}
    >
      <div className="relative flex h-2 w-2 items-center justify-center">
        {pulse && (
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", dotStyles[status])}
          />
        )}
        <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", dotStyles[status])} />
      </div>
      {label}
    </Badge>
  )
}
