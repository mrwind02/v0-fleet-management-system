"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/utils/utils"
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Wrench, 
  Activity, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  FileBadge,
  AlertOctagon,
  PenTool,
  ClipboardCheck,
  Settings,
  Shield,
  UserCog,
  DollarSign,
  Wallet,
  Store
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type NavItem = {
  title: string
  href: string
  icon: React.ElementType
}

type NavModule = {
  module: string
  items: NavItem[]
}

const navigation: (NavItem | NavModule)[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    module: "FROTA",
    items: [
      { title: "Veículos", href: "/vehicles", icon: Truck },
      { title: "Motoristas", href: "/drivers", icon: Users },
      { title: "Documentos", href: "/documents", icon: FileBadge },
      { title: "Multas", href: "/fines", icon: AlertOctagon },
    ],
  },
  {
    module: "MANUTENÇÃO",
    items: [
      { title: "Ordens de Serviço", href: "/maintenance/os", icon: Wrench },
      { title: "Preventivas", href: "/maintenance/preventive", icon: Activity },
      { title: "Checklists", href: "/maintenance/checklist", icon: ClipboardCheck },
    ],
  },
  {
    module: "FINANCEIRO",
    items: [
      { title: "Abastecimentos", href: "/fuel", icon: DollarSign },
      { title: "Despesas", href: "/finance/expenses", icon: Wallet },
      { title: "Fornecedores", href: "/finance/suppliers", icon: Store },
    ],
  },
  {
    module: "RELATÓRIOS",
    items: [
      { title: "Relatórios", href: "/reports", icon: FileText },
      { title: "Indicadores", href: "/reports/indicators", icon: Activity },
    ],
  },
  {
    module: "CONFIGURAÇÕES",
    items: [
      { title: "Usuários", href: "/settings/users", icon: UserCog },
      { title: "Configurações", href: "/settings/general", icon: Settings },
    ],
  },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "relative flex flex-col bg-[#0B132B] text-slate-300 transition-all duration-300 ease-in-out z-20 shadow-xl",
        isCollapsed ? "w-[72px]" : "w-64",
        className
      )}
    >
      {/* Top Header - Logo */}
      <div className="flex h-16 items-center justify-center px-4 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-3 w-full">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0F5DFB] text-white shadow-sm">
            <Truck className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col items-start overflow-hidden text-left">
              <span className="text-lg font-bold text-white tracking-tight leading-none mb-1">FrotaOne</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase leading-none">Gestão de Frotas</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-0.5 custom-scrollbar">
        {navigation.map((nav, index) => {
          if ("module" in nav) {
            return (
              <div key={nav.module} className="mb-1">
                {!isCollapsed && (
                  <h4 className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 mt-3">
                    {nav.module}
                  </h4>
                )}
                {isCollapsed && <div className="h-3" />} {/* Spacer when collapsed */}
                <div className="flex flex-col space-y-0.5">
                  {nav.items.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon
                    
                    if (isCollapsed) {
                      return (
                        <Tooltip key={item.href} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "flex justify-center items-center h-8 mb-0.5 rounded-lg transition-colors",
                                isActive ? "bg-[#0F5DFB] text-white shadow-sm" : "text-slate-400 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[11px] transition-colors",
                          isActive 
                            ? "bg-[#0F5DFB] text-white font-medium shadow-sm" 
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          } else {
            // Direct Link (Dashboard)
            const isActive = pathname === nav.href || pathname.startsWith(nav.href)
            const Icon = nav.icon
            
            if (isCollapsed) {
              return (
                <Tooltip key={nav.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={nav.href}
                      className={cn(
                        "flex justify-center items-center h-8 mb-2 rounded-lg transition-colors",
                        isActive ? "bg-[#0F5DFB] text-white shadow-sm" : "text-slate-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {nav.title}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={nav.href}
                href={nav.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[11px] transition-colors mb-2",
                  isActive 
                    ? "bg-[#0F5DFB] text-white font-medium shadow-sm" 
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                <span className="truncate">{nav.title}</span>
              </Link>
            )
          }
        })}
      </div>
    </div>
  )
}
