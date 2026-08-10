"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Bell, 
  CheckCheck, 
  FileText, 
  AlertTriangle, 
  Wrench, 
  AlertOctagon, 
  Receipt, 
  ExternalLink,
  Sparkles,
  Loader2,
  Inbox
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationService } from "@/services/api"
import { toast } from "sonner"

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: "nfe" | "document" | "maintenance" | "fine" | "fuel" | "system"
  severity: "info" | "warning" | "error" | "success"
  link?: string
  read: boolean
  createdAt: string
}

export function HeaderNotifications() {
  const router = useRouter()
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSimulating, setIsSimulating] = React.useState(false)
  const [filter, setFilter] = React.useState<"all" | "nfe" | "document" | "fine">("all")

  // Fetch real notifications from backend
  const fetchNotifications = React.useCallback(async () => {
    try {
      const response = await notificationService.getAll()
      if (response.data && response.data.success) {
        const items: NotificationItem[] = response.data.data || []
        setNotifications(items)
        setUnreadCount(response.data.unreadCount || items.filter(n => !n.read).length)
      }
    } catch (error) {
      console.warn("Notice loading notifications:", error)
    }
  }, [])

  React.useEffect(() => {
    fetchNotifications()
    // Poll every 15 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Mark a single notification as read
  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      if (link) {
        router.push(link)
      }
    } catch (err) {
      console.error("Error marking notification read", err)
    }
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    setIsLoading(true)
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success("Todas as notificações foram marcadas como lidas")
    } catch (err) {
      toast.error("Erro ao atualizar notificações")
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate SEFAZ NFe arrival
  const handleSimulateNFe = async () => {
    setIsSimulating(true)
    try {
      const res = await notificationService.simulateNFe()
      if (res.data && res.data.success) {
        const newNotif: NotificationItem = res.data.data
        setNotifications(prev => [newNotif, ...prev])
        setUnreadCount(prev => prev + 1)
        toast.info(newNotif.title, {
          description: newNotif.message,
          action: {
            label: "Ver Financeiro",
            onClick: () => router.push(newNotif.link || "/financeiro/despesas")
          }
        })
      }
    } catch (err) {
      toast.error("Erro ao simular NFe")
    } finally {
      setIsSimulating(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "nfe":
        return <Receipt className="h-4 w-4 text-blue-500 shrink-0" />
      case "document":
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
      case "maintenance":
        return <Wrench className="h-4 w-4 text-orange-500 shrink-0" />
      case "fine":
        return <AlertOctagon className="h-4 w-4 text-rose-500 shrink-0" />
      default:
        return <FileText className="h-4 w-4 text-slate-400 shrink-0" />
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true
    return n.type === filter
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
          aria-label="Notificações do Sistema"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] sm:w-[420px] p-0 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="font-brand font-bold text-sm text-slate-900 dark:text-white">
              Notificações
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                {unreadCount} novas
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="h-7 px-2 text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1 rounded-md"
              >
                <CheckCheck className="h-3 w-3" />
                Lidas
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] bg-white dark:bg-slate-950">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
              filter === "all"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("nfe")}
            className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
              filter === "nfe"
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            NFe SEFAZ
          </button>
          <button
            onClick={() => setFilter("document")}
            className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
              filter === "document"
                ? "bg-amber-600 text-white"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Documentos
          </button>
          <button
            onClick={() => setFilter("fine")}
            className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
              filter === "fine"
                ? "bg-rose-600 text-white"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Multas
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[360px] overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Inbox className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-500">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id, notif.link)}
                className={`flex gap-3 p-3.5 transition-colors cursor-pointer group ${
                  !notif.read
                    ? "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/40"
                    : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                {/* Unread indicator dot */}
                <div className="flex flex-col items-center pt-0.5">
                  <div className={`w-2 h-2 rounded-full mb-1 ${!notif.read ? "bg-blue-600 animate-pulse" : "bg-transparent"}`} />
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className={`text-xs font-semibold truncate ${!notif.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[9.5px] text-slate-400 shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                      <span>Ver detalhes</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-b-xl">
          <Link 
            href="/financeiro/despesas" 
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver central financeira e documentos completos →
          </Link>
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
