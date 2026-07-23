import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/utils/utils"

export interface InsightCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  iconBgColor?: string
  iconColor?: string
  actionLabel?: string
  onAction?: () => void
  badgeText?: string
  badgeVariant?: "default" | "destructive" | "outline" | "secondary" | "success" | "warning"
}

export function InsightCard({
  title,
  value,
  description,
  icon,
  iconBgColor = "bg-blue-100 dark:bg-blue-900/40",
  iconColor = "text-blue-600 dark:text-blue-400",
  actionLabel,
  onAction,
  badgeText,
  badgeVariant = "secondary"
}: InsightCardProps) {
  
  const getBadgeClasses = (variant: string) => {
    switch (variant) {
      case "success": return "bg-green-100 text-green-700 hover:bg-green-100 border-0"
      case "warning": return "bg-orange-100 text-orange-700 hover:bg-orange-100 border-0"
      case "destructive": return "bg-red-100 text-red-700 hover:bg-red-100 border-0"
      default: return ""
    }
  }

  return (
    <div className="bg-card border rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative top border line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-muted to-muted opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg shrink-0", iconBgColor, iconColor)}>
            {icon}
          </div>
          <span className="text-sm font-semibold text-muted-foreground">{title}</span>
        </div>
        
        {badgeText && (
          <Badge variant={badgeVariant as any} className={cn("text-[10px] uppercase font-bold tracking-wider", getBadgeClasses(badgeVariant))}>
            {badgeText}
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-1 mb-4">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {actionLabel && (
        <div className="mt-auto pt-4 border-t border-muted/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs font-semibold justify-between px-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            onClick={onAction}
          >
            {actionLabel}
            <span className="text-lg leading-none">&rarr;</span>
          </Button>
        </div>
      )}
    </div>
  )
}
