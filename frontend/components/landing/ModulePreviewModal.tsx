"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Car,
  Wrench,
  FileText,
  BarChart3,
  Fuel,
  Wallet,
  AlertOctagon,
  Activity,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  Users,
  ChevronDown,
  LayoutDashboard,
  Building2,
  CheckSquare,
  Shield,
  Menu,
  Bell,
  HelpCircle,
  Sun,
  Maximize2,
  Bookmark,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ModulePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  moduleId: string | null
}

export function ModulePreviewModal({ isOpen, onClose, moduleId }: ModulePreviewModalProps) {
  if (!isOpen || !moduleId) return null

  const getModuleTitle = () => {
    switch (moduleId) {
      case "veiculos":
        return { title: "Centro Operacional de Veículos", subtitle: "Gerencie o ciclo de vida, manutenção e custos da frota.", route: "/vehicles", icon: Car }
      case "os":
        return { title: "Ordens de Serviço & Manutenção", subtitle: "Planejamento e controle de OS com oficinas credenciadas.", route: "/maintenance/os", icon: Wrench }
      case "documentos":
        return { title: "Documentação & CNHs", subtitle: "Controle de licenciamentos, laudos e alertas de vencimento.", route: "/documents", icon: FileText }
      case "indicadores":
        return { title: "Indicadores BI & Performance", subtitle: "Métricas consolidadas de CPK, custo e disponibilidade.", route: "/reports/indicators", icon: BarChart3 }
      case "abastecimentos":
        return { title: "Gestão de Abastecimentos", subtitle: "Auditoria de notas, postos e cálculo exato de km/litro.", route: "/fuel", icon: Fuel }
      case "despesas":
        return { title: "Despesas Operacionais & Viagens", subtitle: "Lançamento e aprovação de pedágios, diárias e custos.", route: "/finance/expenses", icon: Wallet }
      case "multas":
        return { title: "Gestão de Multas de Trânsito", subtitle: "Mapeamento de pontuação de CNH e autos de infração.", route: "/fines", icon: AlertOctagon }
      case "preventivas":
        return { title: "Planos de Manutenção Preventiva", subtitle: "Agendamento periódico e alertas de revisão por km.", route: "/maintenance/preventive", icon: Activity }
      default:
        return { title: "Módulo ERP", subtitle: "Visão geral do módulo selecionado.", route: "/dashboard", icon: Car }
    }
  }

  const { title, subtitle, route, icon: HeaderIcon } = getModuleTitle()

  const sidebarItems = [
    { label: "Dashboard", icon: LayoutDashboard, active: false },
    { label: "Veículos", icon: Car, active: moduleId === "veiculos" },
    { label: "Motoristas", icon: Users, active: false },
    { label: "Documentos", icon: FileText, active: moduleId === "documentos" },
    { label: "Multas", icon: AlertOctagon, active: moduleId === "multas" },
    { label: "Ordens de Serviço", icon: Wrench, active: moduleId === "os" },
    { label: "Preventivas", icon: Activity, active: moduleId === "preventivas" },
    { label: "Checklists", icon: CheckSquare, active: false },
    { label: "Abastecimentos", icon: Fuel, active: moduleId === "abastecimentos" },
    { label: "Despesas", icon: Wallet, active: moduleId === "despesas" },
    { label: "Fornecedores", icon: Building2, active: false },
    { label: "Relatórios", icon: FileText, active: false },
    { label: "Indicadores", icon: BarChart3, active: moduleId === "indicadores" },
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white border border-slate-300 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Window Address Bar */}
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0 font-sans">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xs font-sans text-slate-500 font-semibold bg-white px-3 py-0.5 rounded-md border border-slate-200 shadow-2xs ml-2">
                app.frotaone.com.br{route}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href="/login">
                <Button size="sm" className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-1.5">
                  Testar este Módulo <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </a>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Full ERP System Screen Replica Container (Sidebar + Official System Screen) */}
          <div className="flex flex-1 overflow-hidden font-sans">
            
            {/* Sidebar Navigation */}
            <div className="w-48 bg-[#0b132b] text-slate-300 p-3 flex flex-col justify-between shrink-0 border-r border-slate-800 hidden md:flex select-none">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-2 py-1">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                    <Shield className="w-4 h-4 fill-white/20" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs tracking-tight text-white leading-none">
                      Frota<span className="text-blue-500">One</span>
                    </span>
                    <span className="text-[7px] font-mono tracking-widest text-slate-400 uppercase font-semibold mt-0.5">
                      GESTÃO DE FROTAS
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-[10px]">
                  {sidebarItems.map((item, idx) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          item.active
                            ? "bg-blue-600 text-white font-bold"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[9px]">
                <span className="text-slate-400 block text-[8px]">SISTEMA ATIVO</span>
                <span className="font-bold text-slate-200 block truncate">Logística TransBrasil</span>
                <span className="text-emerald-400 text-[8px]">● Conectado ao ERP</span>
              </div>
            </div>

            {/* Main Official System Screen Area */}
            <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-hidden">
              
              {/* Header Bar */}
              <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Menu className="w-4 h-4 text-slate-500 cursor-pointer md:hidden" />
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      readOnly
                      placeholder="Buscar módulos, integrações..."
                      className="pl-8 pr-8 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 sm:w-64 text-slate-600 focus:outline-none"
                    />
                    <span className="absolute right-2 top-1.5 text-[9px] font-mono bg-slate-200/60 text-slate-500 px-1 rounded">⌘K</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative cursor-pointer">
                    <Bell className="w-4 h-4 text-slate-600" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">5</span>
                  </div>
                  <HelpCircle className="w-4 h-4 text-slate-500 cursor-pointer hidden sm:block" />
                  <Sun className="w-4 h-4 text-slate-500 cursor-pointer hidden sm:block" />
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="flex flex-col text-right hidden sm:flex">
                      <span className="text-xs font-bold text-slate-800 leading-tight">Thiago Matos</span>
                      <span className="text-[9px] text-slate-400 font-medium leading-none">Administrador</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center border border-blue-200">
                      TM
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Content View Body */}
              <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 font-sans">
                
                {/* Breadcrumb & Title Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">
                      Frota &gt; <span className="font-bold text-slate-800">{title}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
                  </div>

                  <Button size="sm" className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm shadow-blue-600/20 gap-1.5">
                    <Plus className="w-4 h-4" /> Novo Registro
                  </Button>
                </div>

                {/* Module-Specific Replica Screen Layouts */}
                {moduleId === "veiculos" && (
                  <div className="space-y-4">
                    {/* 6 Metric Cards Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">Total Veículos</span>
                          <span className="text-lg font-extrabold text-slate-900">2</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">Em Operação</span>
                          <span className="text-lg font-extrabold text-slate-900">2</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">Em Manutenção</span>
                          <span className="text-lg font-extrabold text-slate-900">0</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">Docs Vencendo</span>
                          <span className="text-lg font-extrabold text-slate-900">0</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">Disponibilidade</span>
                          <span className="text-lg font-extrabold text-slate-900">100%</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">Custo Total</span>
                          <span className="text-sm font-extrabold text-slate-900">R$ 8.477,70</span>
                        </div>
                      </div>
                    </div>

                    {/* Table Controls Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          readOnly
                          placeholder="Buscar por placa, modelo, marca ou motorista..."
                          className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-200 text-slate-700 font-bold">
                          <Maximize2 className="w-3.5 h-3.5" /> Densidade
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-200 text-slate-700 font-bold">
                          <Bookmark className="w-3.5 h-3.5" /> Salvar Visão
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-slate-200 text-slate-700 font-bold">
                          <Filter className="w-3.5 h-3.5" /> Mais <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Table Official View */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                          <tr>
                            <th className="p-3">Veículo</th>
                            <th className="p-3">Placa</th>
                            <th className="p-3">Motorista</th>
                            <th className="p-3">Unidade</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Km Atual</th>
                            <th className="p-3">Manutenção</th>
                            <th className="p-3">Docs</th>
                            <th className="p-3">Custo</th>
                            <th className="p-3">Atualização</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          <tr className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">M. Benz Axor 3344S</td>
                            <td className="p-3 font-bold text-slate-800">GDW1G07</td>
                            <td className="p-3 flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">F</div>
                              <span>Flávio Marcilio</span>
                            </td>
                            <td className="p-3 text-slate-500">Filial AF-001</td>
                            <td className="p-3"><span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">Em Operação</span></td>
                            <td className="p-3 text-slate-600">0 km</td>
                            <td className="p-3 text-slate-400">-</td>
                            <td className="p-3"><span className="text-[10px] text-emerald-600 font-bold">Regular</span></td>
                            <td className="p-3 font-bold text-slate-900">R$ 0,00</td>
                            <td className="p-3 text-slate-500">30/07/2026</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">M. Benz 2634</td>
                            <td className="p-3 font-bold text-slate-800">PQF3C53</td>
                            <td className="p-3 flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">M</div>
                              <span>Mateus Bernadi de...</span>
                            </td>
                            <td className="p-3 text-slate-500">Matriz</td>
                            <td className="p-3"><span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">Em Operação</span></td>
                            <td className="p-3 text-slate-600">0 km</td>
                            <td className="p-3 text-slate-400">-</td>
                            <td className="p-3"><span className="text-[10px] text-emerald-600 font-bold">Regular</span></td>
                            <td className="p-3 font-bold text-slate-900">R$ 8.477,70</td>
                            <td className="p-3 text-slate-500">30/07/2026</td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>0 de 2 linha(s) selecionada(s).</span>
                        <div className="flex items-center gap-3">
                          <span>Página 1 de 1</span>
                          <div className="flex items-center gap-1">
                            <button className="p-1 border rounded hover:bg-slate-200"><ChevronLeft className="w-3.5 h-3.5" /></button>
                            <button className="p-1 border rounded hover:bg-slate-200"><ChevronRight className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {moduleId !== "veiculos" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
                    <HeaderIcon className="w-10 h-10 text-blue-600 mx-auto" />
                    <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      {subtitle} Interface idêntica com dados em tempo real.
                    </p>
                    <a href="/login" className="inline-block mt-2">
                      <Button size="sm" className="h-9 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        Acessar no ERP Completo
                      </Button>
                    </a>
                  </div>
                )}

              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
