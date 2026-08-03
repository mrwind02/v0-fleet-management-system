"use client"

import * as React from "react"
import { Activity, CheckCircle2, Clock, Share2, Shield, RefreshCw } from "lucide-react"

interface TimelineItemProps {
  id: string
  date: string
  time: string
  title: string
  description: string
  category: string
}

interface SyncTimelineProps {
  events: TimelineItemProps[]
}

export function SyncTimeline({ events }: SyncTimelineProps) {
  return (
    <div className="p-4 bg-card border rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" /> Atividade Recente de Integrações
        </h3>
        <span className="text-xs font-mono text-muted-foreground">{events.length} Eventos</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {events.map((evt) => (
          <div key={evt.id} className="relative flex items-start gap-3">
            <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/30 flex items-center justify-center text-[10px]">
              <CheckCircle2 className="h-3 w-3" />
            </div>

            <div className="p-3 bg-muted/20 border rounded-xl flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">{evt.title}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{evt.date} às {evt.time}</span>
              </div>
              <p className="text-xs text-muted-foreground">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
