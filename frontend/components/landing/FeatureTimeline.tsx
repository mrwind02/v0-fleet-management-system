"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight } from "lucide-react"

export function FeatureTimeline() {
  const steps = [
    {
      num: "01",
      title: "Cadastro",
      desc: "Importe veículos, motoristas, fornecedores e documentos em poucos cliques."
    },
    {
      num: "02",
      title: "Operação",
      desc: "Lance abastecimentos, ordens de serviço e despesas do dia a dia com facilidade."
    },
    {
      num: "03",
      title: "Monitoramento",
      desc: "Acompanhe hodômetros, alocações de motoristas e prazos de manutenção."
    },
    {
      num: "04",
      title: "Indicadores",
      desc: "Visualize KPIs em tempo real: CPK, consumo médio, disponibilidade e custos."
    },
    {
      num: "05",
      title: "Relatórios",
      desc: "Gere relatórios gerenciais e operacionais prontos em PDF e Excel."
    },
    {
      num: "06",
      title: "Automação",
      desc: "Receba alertas automáticos de vencimentos de CNH, revisões e regras de auditoria."
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-4">
            Jornada de Eficiência
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Como o FrotaOne transforma sua gestão.
          </h2>
          <p className="text-slate-600 text-base">
            Um fluxo contínuo e organizado que evolui do cadastro inicial até a automação total da frota.
          </p>
        </div>

        {/* Timeline Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-500/50 transition-all flex flex-col justify-between relative group"
            >
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 inline-block mb-3">
                  PASSO {step.num}
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simplificado</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
