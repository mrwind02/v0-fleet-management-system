import React from "react"
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/utils/utils"

export type AlertType = "info" | "warning" | "error" | "success"

export interface AlertItem {
  id: string
  type: AlertType
  title: string
  description?: string
  date?: string
}

interface AlertPanelProps {
  title?: string
  alerts: AlertItem[]
  className?: string
}

export function AlertPanel({ title = "Alertas Recentes", alerts, className }: AlertPanelProps) {
  const getIcon = (type: AlertType) => {
    switch (type) {
      case "info": return <Info className="h-4 w-4 text-blue-500" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getBg = (type: AlertType) => {
    switch (type) {
      case "info": return "bg-blue-50 dark:bg-blue-900/10"
      case "warning": return "bg-orange-50 dark:bg-orange-900/10"
      case "error": return "bg-red-50 dark:bg-red-900/10"
      case "success": return "bg-green-50 dark:bg-green-900/10"
    }
  }

  return (
    <div className={cn("flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden", className)}>
      <div className="px-4 py-3 border-b bg-muted/20 font-semibold text-sm">
        {title}
      </div>
      <div className="flex flex-col p-2 gap-2 max-h-[500px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Nenhum alerta.</div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={cn("flex gap-3 p-3 rounded-lg border", getBg(alert.type))}>
              <div className="shrink-0 mt-0.5">{getIcon(alert.type)}</div>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-semibold">{alert.title}</span>
                  {alert.date && <span className="text-[10px] text-muted-foreground whitespace-nowrap">{alert.date}</span>}
                </div>
                {alert.description && <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
