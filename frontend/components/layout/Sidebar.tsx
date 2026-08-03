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
import { FrotaOneIconMark, FrotaOneLogo } from "@/components/ui/FrotaOneLogo"

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
    module: "Frota",
    items: [
      { title: "Veículos", href: "/vehicles", icon: Truck },
      { title: "Motoristas", href: "/drivers", icon: Users },
      { title: "Documentos", href: "/documents", icon: FileBadge },
      { title: "Multas", href: "/fines", icon: AlertOctagon },
    ],
  },
  {
    module: "Manutenção",
    items: [
      { title: "Ordens de Serviço", href: "/maintenance/os", icon: Wrench },
      { title: "Preventivas", href: "/maintenance/preventive", icon: Activity },
      { title: "Checklists", href: "/maintenance/checklist", icon: ClipboardCheck },
    ],
  },
  {
    module: "Financeiro",
    items: [
      { title: "Abastecimentos", href: "/fuel", icon: DollarSign },
      { title: "Despesas", href: "/financeiro/despesas", icon: Wallet },
      { title: "Fornecedores", href: "/cadastros/fornecedores", icon: Store },
    ],
  },
  {
    module: "Relatórios",
    items: [
      { title: "Relatórios", href: "/reports", icon: FileText },
      { title: "Indicadores", href: "/reports/indicators", icon: Activity },
    ],
  },
  {
    module: "Configurações",
    items: [
      { title: "Central de Configurações", href: "/settings", icon: Settings },
      { title: "Usuários & Permissões", href: "/settings/users", icon: UserCog },
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
      {/* Top Header - Official FrotaOne Logo */}
      <div className="flex h-14 items-center justify-center px-3 shrink-0 border-b border-white/10">
        {isCollapsed ? (
          <FrotaOneIconMark className="w-7 h-7" variant="dark" />
        ) : (
          <FrotaOneLogo variant="dark" size="sm" showTagline={true} />
        )}
      </div>

      {/* Navigation - Responsive & No Visible Scrollbar */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2.5 space-y-2 select-none">
        {navigation.map((nav, index) => {
          if ("module" in nav) {
            return (
              <div key={`module-${index}`} className="space-y-0.5">
                {!isCollapsed && (
                  <h3 className="px-2.5 text-[9.5px] font-bold text-slate-400/80 uppercase tracking-wider mb-0.5">
                    {nav.module}
                  </h3>
                )}
                {isCollapsed && <div className="h-1.5" />} {/* Spacer when collapsed */}
                <div className="flex flex-col space-y-0.5">
                  {nav.items.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon
                    const itemKey = `${item.href}-${item.title}`
                    
                    if (isCollapsed) {
                      return (
                        <Tooltip key={itemKey} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "flex justify-center items-center h-7 mb-0.5 rounded-md transition-colors",
                                isActive ? "bg-[#0F5DFB] text-white shadow-sm" : "text-slate-400 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0" />
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
                        key={itemKey}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                          isActive 
                            ? "bg-[#0F5DFB] text-white font-semibold shadow-sm" 
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-white" : "text-slate-400")} />
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
            
            if (isCollapsed) {
              return (
                <Tooltip key={nav.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={nav.href}
                      className={cn(
                        "flex justify-center items-center h-8 rounded-md transition-colors",
                        isActive ? "bg-[#0F5DFB] text-white shadow-sm" : "text-slate-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
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
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  isActive 
                    ? "bg-[#0F5DFB] text-white shadow-sm" 
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                <span>{nav.title}</span>
              </Link>
            )
          }
        })}
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-2 border-t border-white/10 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-white/10 h-7 text-[11px] font-medium"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Recolher Menu</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
