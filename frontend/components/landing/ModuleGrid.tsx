"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Car, Wrench, FileText, BarChart3, Fuel, Wallet, AlertOctagon, Activity, ArrowRight } from "lucide-react"
import { ModulePreviewModal } from "./ModulePreviewModal"

export function ModuleGrid() {
  const [selectedModuleId, setSelectedModuleId] = React.useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const modules = [
    {
      id: "veiculos",
      icon: Car,
      name: "Veículos",
      desc: "Controle completo da frota com telemetria, hodômetros e histórico de alocações."
    },
    {
      id: "os",
      icon: Wrench,
      name: "Ordens de Serviço",
      desc: "Planejamento e execução de manutenções com gestão de oficinas e fornecedores."
    },
    {
      id: "documentos",
      icon: FileText,
      name: "Documentos",
      desc: "Licenciamentos, seguros, laudos e alertas automáticos de vencimentos da CNH."
    },
    {
      id: "indicadores",
      icon: BarChart3,
      name: "Indicadores BI",
      desc: "Business Intelligence integrado para acompanhamento de CPK, disponibilidade e métricas."
    },
    {
      id: "abastecimentos",
      icon: Fuel,
      name: "Abastecimentos",
      desc: "Auditoria completa de consumos, postos parceiros e cálculo exato de km por litro."
    },
    {
      id: "despesas",
      icon: Wallet,
      name: "Despesas Operacionais",
      desc: "Lançamento e aprovação de pedágios, diárias, lavagens e despesas de viagem."
    },
    {
      id: "multas",
      icon: AlertOctagon,
      name: "Multas de Trânsito",
      desc: "Mapeamento e vinculação de infrações diretamente ao motorista responsável."
    },
    {
      id: "preventivas",
      icon: Activity,
      name: "Manutenção Preventiva",
      desc: "Planos periódicos com agendamento automático para evitar imobilizações em pista."
    }
  ]

  const handleOpenPreview = (id: string) => {
    setSelectedModuleId(id)
    setIsModalOpen(true)
  }

  return (
    <section id="modulos" className="h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] flex flex-col justify-center bg-white relative overflow-hidden py-4 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold mb-2">
            Módulos Nativos
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5">
            Tudo o que sua empresa precisa em um só lugar.
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-normal">
            Cada módulo do FrotaOne foi desenhado para resolver um gargalo específico da operação da sua frota.
          </p>
        </div>

        {/* Compact Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {modules.map((mod, idx) => {
            const Icon = mod.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    {mod.name}
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-snug mb-2 font-normal">
                    {mod.desc}
                  </p>
                </div>

                <button 
                  onClick={() => handleOpenPreview(mod.id)}
                  className="inline-flex items-center text-[11px] font-bold text-blue-600 hover:text-blue-700 gap-1 group/btn cursor-pointer pt-0.5"
                >
                  <span>Saiba mais</span>
                  <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )
          })}
        </div>

      </div>

      {/* Module Interactive System Screen Preview Modal */}
      <ModulePreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        moduleId={selectedModuleId}
      />
    </section>
  )
}
