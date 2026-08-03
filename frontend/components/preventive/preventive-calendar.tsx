"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  FileText,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PreventiveCalendarEvent } from "@/types/preventive"
import { cn } from "@/utils/utils"

interface PreventiveCalendarProps {
  events: PreventiveCalendarEvent[]
}

export function PreventiveCalendar({ events }: PreventiveCalendarProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = React.useState(new Date(2026, 7, 1)) // August 2026
  const [selectedTypeFilter, setSelectedTypeFilter] = React.useState<string>("all")

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Generate 35 calendar day cells for August 2026 (starting on Saturday Aug 1)
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const startDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const calendarDays = React.useMemo(() => {
    const days = []
    // Padding days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false })
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, isCurrentMonth: true })
    }
    // Remaining padding cells to fill 35 grid items
    while (days.length < 35) {
      days.push({ day: null, isCurrentMonth: false })
    }
    return days
  }, [currentMonth, daysInMonth, startDayOfWeek])

  const filteredEvents = React.useMemo(() => {
    if (selectedTypeFilter === "all") return events
    return events.filter((e) => e.type === selectedTypeFilter)
  }, [events, selectedTypeFilter])

  const getEventsForDay = (dayNumber: number) => {
    const year = currentMonth.getFullYear()
    const monthStr = String(currentMonth.getMonth() + 1).padStart(2, "0")
    const dayStr = String(dayNumber).padStart(2, "0")
    const dateFormatted = `${year}-${monthStr}-${dayStr}`
    return filteredEvents.filter((e) => e.date === dateFormatted)
  }

  const handleEventClick = (event: PreventiveCalendarEvent) => {
    if (event.osNumber) {
      router.push(`/manutencao/ordens-servico/${event.osNumber}`)
    } else {
      router.push(`/maintenance/preventive/${event.planId}`)
    }
  }

  const getEventBadgeStyle = (type: PreventiveCalendarEvent["type"]) => {
    switch (type) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20"
      case "overdue":
        return "bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20"
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
      case "os_generated":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20"
    }
  }

  return (
    <div className="bg-card border rounded-2xl p-4 space-y-4 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-500">
                Diferencial FrotaOne
              </span>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                Visão Integrada
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-foreground">Calendário Preventivo da Frota</h3>
          </div>
        </div>

        {/* Filter Badges + Month Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedTypeFilter("all")}
              className={cn("px-2.5 py-1 rounded-lg font-bold transition-all", selectedTypeFilter === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedTypeFilter("scheduled")}
              className={cn("px-2.5 py-1 rounded-lg font-bold transition-all text-blue-600", selectedTypeFilter === "scheduled" ? "bg-background shadow-sm" : "opacity-70")}
            >
              Programados
            </button>
            <button
              onClick={() => setSelectedTypeFilter("overdue")}
              className={cn("px-2.5 py-1 rounded-lg font-bold transition-all text-rose-600", selectedTypeFilter === "overdue" ? "bg-background shadow-sm" : "opacity-70")}
            >
              Vencidos
            </button>
            <button
              onClick={() => setSelectedTypeFilter("os_generated")}
              className={cn("px-2.5 py-1 rounded-lg font-bold transition-all text-purple-600", selectedTypeFilter === "os_generated" ? "bg-background shadow-sm" : "opacity-70")}
            >
              OS Geradas
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={handlePrevMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-bold text-foreground font-mono px-2 min-w-[110px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button size="sm" variant="outline" onClick={handleNextMonth} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-muted-foreground border-b pb-1">
        <span>DOM</span>
        <span>SEG</span>
        <span>TER</span>
        <span>QUA</span>
        <span>QUI</span>
        <span>SEX</span>
        <span>SÁB</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth || !cell.day) {
            return (
              <div key={idx} className="min-h-[90px] p-1.5 rounded-xl bg-muted/10 border border-transparent opacity-30" />
            )
          }

          const dayEvents = getEventsForDay(cell.day)
          const isToday = cell.day === 28 // Current day marker

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[90px] p-1.5 rounded-xl border flex flex-col justify-between transition-colors bg-card",
                isToday ? "border-primary bg-primary/5" : "border-border/40 hover:border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("font-bold text-xs font-mono rounded-full h-5 w-5 flex items-center justify-center", isToday ? "bg-primary text-primary-foreground" : "text-foreground")}>
                  {cell.day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[9px] font-mono text-muted-foreground font-bold">
                    {dayEvents.length} ev
                  </span>
                )}
              </div>

              {/* Day Events List */}
              <div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-[60px] custom-scrollbar">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => handleEventClick(ev)}
                    className={cn(
                      "p-1 rounded-md text-[10px] font-medium border cursor-pointer truncate transition-all",
                      getEventBadgeStyle(ev.type)
                    )}
                    title={`${ev.planName} - ${ev.vehicle}`}
                  >
                    <div className="font-bold truncate leading-tight">{ev.planName}</div>
                    <div className="text-[9px] opacity-80 truncate">{ev.vehicle}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
