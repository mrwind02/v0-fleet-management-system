"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Car, Users, Fuel, Wrench, AlertCircle, FileText, BarChart3, ChevronRight, Activity, ArrowUpRight } from "lucide-react"

export function ErpExplorer() {
  const [activeTab, setActiveTab] = React.useState<string>("dashboard")

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "veiculos", label: "Veículos", icon: Car },
    { id: "motoristas", label: "Motoristas", icon: Users },
    { id: "abastecimentos", label: "Abastecimentos", icon: Fuel },
    { id: "os", label: "Ordens de Serviço", icon: Wrench },
    { id: "preventivas", label: "Preventivas", icon: AlertCircle },
    { id: "indicadores", label: "Indicadores BI", icon: BarChart3 },
  ]

  return (
    <section id="explorer" className="h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] flex flex-col justify-center bg-slate-50 relative overflow-hidden py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold mb-1.5">
            ERP Explorer • Test Drive sem cadastro
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Explore o FrotaOne em tempo real.
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-normal">
            Clique nas abas abaixo para navegar pela interface oficial do sistema.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )}
          )}
        </div>

        {/* Simulated Browser Workspace Container */}
        <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-900/5 overflow-hidden h-[380px] sm:h-[400px] flex flex-col">
          
          {/* Browser Address Bar */}
          <div className="px-3 py-1.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 bg-white px-3 py-0.5 rounded-md border border-slate-200/80">
              https://app.frotaone.com.br/{activeTab}
            </div>
            <a href="/login" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Acessar ERP completo <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          {/* Dynamic Content View Area */}
          <div className="p-4 flex-1 overflow-y-auto bg-slate-50/50">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Veículos Ativos</span>
                      <span className="text-xl font-bold font-mono text-slate-900">42 / 42</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Gasto Mensal</span>
                      <span className="text-xl font-bold font-mono text-slate-900">R$ 24.850</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">CPK Médio</span>
                      <span className="text-xl font-bold font-mono text-slate-900">R$ 2,83/km</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Preventivas Em Dia</span>
                      <span className="text-xl font-bold font-mono text-emerald-600">98.2%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Status Geral da Operação</h4>
                      <p className="text-[11px] text-slate-500">Frota com 100% de disponibilidade operacional neste turno.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                      SISTEMA OPERACIONAL
                    </span>
                  </div>
                </motion.div>
              )}

              {activeTab === "veiculos" && (
                <motion.div key="veiculos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold flex justify-between items-center">
                    <span>Scania R450 • Placa ABC-1234</span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Em rota • 142.800 km</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold flex justify-between items-center">
                    <span>Volvo FH 540 • Placa DEF-5678</span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Em rota • 98.400 km</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold flex justify-between items-center">
                    <span>Mercedes Actros • Placa GHI-9012</span>
                    <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Revisão Agendada • 210.000 km</span>
                  </div>
                </motion.div>
              )}

              {activeTab !== "dashboard" && activeTab !== "veiculos" && (
                <motion.div key="other" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-xl">
                  <Activity className="w-8 h-8 text-blue-600 mb-2 animate-bounce" />
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Módulo {tabs.find(t=>t.id===activeTab)?.label} Ativo</h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-3">Dados simulados com métricas reais do sistema. Faça login para acessar relatórios completos.</p>
                  <a href="/login" className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl">
                    Entrar no Sistema ERP
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  )
}
