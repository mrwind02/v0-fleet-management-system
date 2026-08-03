"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Car, Users, FileText, Fuel, Wrench, Wallet, BarChart3, FileSpreadsheet, Activity } from "lucide-react"

export function ArchitectureDiagram() {
  const [activeModule, setActiveModule] = React.useState<string | null>(null)

  const modules = [
    { id: "veiculos", name: "Veículos", icon: Car, syncData: "42 veículos ativos • Telemetria em tempo real" },
    { id: "motoristas", name: "Motoristas", icon: Users, syncData: "32 CNHs válidas • 0 pendências" },
    { id: "documentos", name: "Documentos", icon: FileText, syncData: "100% CRLV e Laudos regularizados" },
    { id: "abastecimentos", name: "Abastecimentos", icon: Fuel, syncData: "Consumo médio 3,45 km/L auditado" },
    { id: "manutencoes", name: "Manutenções", icon: Wrench, syncData: "98,2% Preventivas no prazo" },
    { id: "despesas", name: "Despesas", icon: Wallet, syncData: "R$ 24,8k geridos no mês" },
    { id: "indicadores", name: "Indicadores BI", icon: BarChart3, syncData: "CPK R$ 2,83/km (Meta atingida)" },
    { id: "relatorios", name: "Relatórios", icon: FileSpreadsheet, syncData: "Relatórios PDF/Excel prontos" },
  ]

  const activeModuleData = modules.find((m) => m.id === activeModule)

  return (
    <section id="erp" className="h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] flex flex-col justify-center bg-white relative overflow-hidden py-4 scroll-mt-14">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-50/50 blur-[90px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold mb-2">
            Arquitetura ERP Integrada
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Tudo conectado. Um único sistema.
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-normal">
            Passe o mouse pelos módulos para ver como os dados fluem em tempo real para o Dashboard.
          </p>
        </div>

        {/* Interactive Light-Theme Center Hub Diagram */}
        <div className="max-w-3xl mx-auto bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          
          {/* Center Hub: Dashboard */}
          <div className="flex flex-col items-center justify-center mb-5 relative">
            <motion.div
              animate={{ scale: activeModule ? 1.08 : 1 }}
              className="w-16 h-16 rounded-xl bg-blue-600 flex flex-col items-center justify-center text-white shadow-lg shadow-blue-600/30 border border-blue-400/30 relative z-20 cursor-pointer"
            >
              <LayoutDashboard className="w-7 h-7 mb-0.5" />
              <span className="text-[9px] font-bold tracking-wider uppercase font-mono">DASHBOARD</span>
            </motion.div>

            {/* Glowing Ring */}
            <div className="absolute w-24 h-24 rounded-full border border-blue-500/20 animate-ping pointer-events-none" />

            {/* Live Data Transmission Banner */}
            <div className="h-6 mt-3 flex items-center">
              <AnimatePresence mode="wait">
                {activeModuleData ? (
                  <motion.div
                    key={activeModuleData.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-mono font-semibold shadow-xs"
                  >
                    <Activity className="w-3 h-3 animate-pulse text-emerald-300" />
                    <span>SINCRONIZANDO: {activeModuleData.syncData}</span>
                  </motion.div>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    Passe o cursor sobre os módulos abaixo para simular o fluxo
                  </span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Connected Modules Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {modules.map((mod) => {
              const Icon = mod.icon
              const isSelected = activeModule === mod.id
              return (
                <motion.div
                  key={mod.id}
                  onMouseEnter={() => setActiveModule(mod.id)}
                  onMouseLeave={() => setActiveModule(null)}
                  whileHover={{ scale: 1.03 }}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-600/30 text-slate-900"
                      : "bg-white border-slate-200/90 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">{mod.name}</span>
                  <span className={`text-[9px] font-mono font-semibold flex items-center gap-1 ${isSelected ? "text-blue-600 font-bold" : "text-emerald-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-600 animate-ping" : "bg-emerald-500"}`} />
                    {isSelected ? "Fluxo Ativo" : "Sincronizado"}
                  </span>
                </motion.div>
              )
            })}
          </div>

        </div>

      </div>
    </section>
  )
}
