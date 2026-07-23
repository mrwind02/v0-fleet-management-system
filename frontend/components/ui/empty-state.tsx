"use client"

import * as React from "react"
import { cn } from "@/utils/utils"
import { FileQuestion, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed bg-muted/30 hover:bg-muted/50 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/80 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
