"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Wrench, FileText, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react"

export function DashboardShowcase() {
  const [activeFeature, setActiveFeature] = React.useState<"motoristas" | "preventivas" | "documentos">("motoristas")

  const features = [
    {
      id: "motoristas",
      title: "Gestão Avançada de Motoristas",
      subtitle: "Score de conduta, controle de CNHs e autuações vinculadas por CPF.",
      icon: User,
      badge: "Módulo Motoristas"
    },
    {
      id: "preventivas",
      title: "Manutenção Preventiva Inteligente",
      subtitle: "Alertas prévios por quilometragem e tempo de uso antes que a falha ocorra.",
      icon: Wrench,
      badge: "Módulo Preventivas"
    },
    {
      id: "documentos",
      title: "Conformidade e Documentação",
      subtitle: "Certificados, licenciamento e laudos totalmente digitalizados e auditados.",
      icon: FileText,
      badge: "Módulo Documentos"
    }
  ]

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4">
            Tour pelo ERP
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Projetado para quem precisa de respostas rápidas.
          </h2>
          <p className="text-slate-600 text-base">
            Passe o mouse ou toque nos destaques para alternar as visões da plataforma.
          </p>
        </div>

        {/* Showcase Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Interactive Trigger Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {features.map((feat) => {
              const Icon = feat.icon
              const isActive = activeFeature === feat.id
              return (
                <div
                  key={feat.id}
                  onMouseEnter={() => setActiveFeature(feat.id as any)}
                  onClick={() => setActiveFeature(feat.id as any)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-white border-blue-600 shadow-md ring-1 ring-blue-600/20"
                      : "bg-white/60 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{feat.title}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed pl-10">
                    {feat.subtitle}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Right Side: Big Visual Showcase Window */}
          <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-2xl overflow-hidden min-h-[420px] flex flex-col justify-center">
            
            <AnimatePresence mode="wait">
              {activeFeature === "motoristas" && (
                <motion.div
                  key="motoristas"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-400" />
                      <span className="font-bold text-sm">Painel de Performance dos Motoristas</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">SCORE AUDITADO</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Motoristas Ativos</span>
                      <div className="text-lg font-bold font-mono text-white mt-1">32 Condutores</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Score Médio</span>
                      <div className="text-lg font-bold font-mono text-emerald-400 mt-1">96 / 100</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Infrações Mês</span>
                      <div className="text-lg font-bold font-mono text-blue-400 mt-1">0 no mês</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                    <div className="font-semibold text-slate-300 mb-1">Motorista Destaque do Mês</div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>João Silva • Volvo FH 540</span>
                      <span className="text-emerald-400 font-bold">Score 100 • 3.85 km/L</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeFeature === "preventivas" && (
                <motion.div
                  key="preventivas"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm">Cronograma de Manutenção Preventiva</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">ZERO PARADA</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">Revisão de 150.000 km • Scania R450</div>
                        <div className="text-slate-400 text-[11px]">Troca de correia dentada, pastilhas e sensores</div>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">AGENDADO</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">Alinhamento e Balanceamento • Volvo VM 330</div>
                        <div className="text-slate-400 text-[11px]">Rodízio de pneus e aferição de pressão</div>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">AGENDADO</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeFeature === "documentos" && (
                <motion.div
                  key="documentos"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-sm">Central de Documentos & Licenciamento</span>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">ALERTAS AUTOMÁTICOS</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px]">CRLV Digital (Frota)</span>
                      <div className="font-bold text-emerald-400">100% Regularizados</div>
                      <div className="text-slate-500 text-[10px]">Atualização automática anual</div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px]">Exames Toxicológicos</span>
                      <div className="font-bold text-emerald-400">Nenhum vencido</div>
                      <div className="text-slate-500 text-[10px]">Monitoramento por motorista</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </section>
  )
}
