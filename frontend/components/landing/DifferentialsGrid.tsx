"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles, Eye, Zap, Layers, BarChart3, ShieldCheck } from "lucide-react"

export function DifferentialsGrid() {
  const differentials = [
    {
      icon: Sparkles,
      title: "IA Integrada",
      desc: "Receba insights automáticos sobre anomalias de consumo, custos fora do padrão e oportunidades de economia."
    },
    {
      icon: Eye,
      title: "Visão 360° da Frota",
      desc: "Histórico completo de cada veículo: manutenções passadas, abastecimentos, motoristas que conduziram e custo por km."
    },
    {
      icon: Zap,
      title: "Automações Inteligentes",
      desc: "Elimine o trabalho manual repetitivo. Notificações automáticas de revisão, vencimento de CNH e alertas por e-mail."
    },
    {
      icon: Layers,
      title: "Integrações Nativas",
      desc: "Conectividade fluida com WhatsApp, Google Maps, APIs REST, Webhooks e modelos avançados de IA (OpenAI / Gemini)."
    },
    {
      icon: BarChart3,
      title: "Indicadores em Tempo Real",
      desc: "Business Intelligence dinâmico com dashboards em tempo real sem necessidade de exportação manual."
    },
    {
      icon: ShieldCheck,
      title: "Segurança & Auditoria",
      desc: "Controle estrito de permissões por perfil (RBAC), logs imutáveis de cada ação e conformidade total com LGPD."
    }
  ]

  return (
    <section id="diferenciais" className="h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] flex flex-col justify-center bg-slate-50 relative overflow-hidden py-4 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold mb-2">
            Por que o FrotaOne?
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Diferenciais que elevam o patamar da sua gestão.
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-normal">
            Desenvolvido para entregar o máximo desempenho com a menor curva de aprendizado.
          </p>
        </div>

        {/* 2x3 Compact Grid (Zero Bottom Truncation) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {differentials.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="p-4.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-500/40 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-600 leading-snug font-normal">
                  {item.desc}
                </p>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
