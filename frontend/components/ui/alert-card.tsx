"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/utils/utils"
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"
import { motion } from "framer-motion"

export type AlertVariant = "default" | "success" | "warning" | "destructive"

interface AlertCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title: string
  description?: string
  action?: React.ReactNode
}

const icons = {
  default: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  destructive: XCircle,
}

const variants = {
  default: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning-foreground dark:text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
}

export function AlertCard({
  variant = "default",
  title,
  description,
  action,
  className,
  ...props
}: AlertCardProps) {
  const Icon = icons[variant]

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card
        className={cn(
          "flex items-start p-4 border shadow-sm transition-colors",
          variants[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          {description && (
            <p className="mt-1 text-sm opacity-90 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="ml-4 shrink-0">{action}</div>}
      </Card>
    </motion.div>
  )
}
