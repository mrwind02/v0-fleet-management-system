import React from "react"
import { cn } from "@/utils/utils"

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description?: string
  icon?: React.ReactNode
  iconBg?: string
  iconColor?: string
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
  compact?: boolean
}

export function Timeline({ events, className, compact = false }: TimelineProps) {
  if (!events || events.length === 0) {
    return <div className="text-sm text-muted-foreground p-4">Nenhum evento registrado.</div>
  }

  return (
    <div className={cn("relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent", !compact && "md:before:mx-auto md:before:translate-x-0", className)}>
      {events.map((event, index) => (
        <div key={event.id} className={cn("relative flex items-center justify-between group is-active", !compact && "md:justify-normal md:odd:flex-row-reverse")}>
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 shadow-sm z-10", !compact && "md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2")}>
            <div className={cn("w-full h-full flex items-center justify-center rounded-full", event.iconBg || "bg-muted", event.iconColor || "text-foreground")}>
              {event.icon}
            </div>
          </div>
          <div className={cn("w-[calc(100%-4rem)] p-4 rounded-xl border bg-card shadow-sm", !compact && "md:w-[calc(50%-2.5rem)]")}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-foreground">{event.title}</h4>
              <span className="text-xs font-medium text-muted-foreground">{event.date}</span>
            </div>
            {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
