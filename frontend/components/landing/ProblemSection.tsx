"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { AlertTriangle, DollarSign, Clock, Layers, ShieldAlert, FileX } from "lucide-react"

export function ProblemSection() {
  const problems = [
    {
      icon: DollarSign,
      title: "Desperdício Silencioso",
      desc: "Combustível e manutenções não auditadas corroem a margem de lucro da empresa todos os meses."
    },
    {
      icon: AlertTriangle,
      title: "Imobilização Inesperada",
      desc: "Veículos parados por falta de preventiva geram atrasos em entregas e prejuízos operacionais."
    },
    {
      icon: Clock,
      title: "Perda de Tempo Manual",
      desc: "Planilhas dispersas e controles paralelos consomem horas valiosas da equipe de gestão."
    },
    {
      icon: Layers,
      title: "Informação Fragmentada",
      desc: "Dados espalhados em sistemas diferentes impedem uma visão consolidada e em tempo real."
    },
    {
      icon: ShieldAlert,
      title: "Risco com Multas e CNH",
      desc: "Falta de controle sobre infrações e vencimento da CNH gera riscos jurídicos e trabalhistas."
    },
    {
      icon: FileX,
      title: "Falta de Rastreabilidade",
      desc: "Dificuldade para identificar o responsável por avarias, sinistros e despesas de viagem."
    }
  ]

  return (
    <section className="h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] flex flex-col justify-center bg-white relative overflow-hidden py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Sua frota gera dados. <br />
            <span className="text-slate-500 font-normal">O problema é transformá-los em decisões.</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-normal">
            A maioria das empresas perde dinheiro todos os dias simplesmente porque os dados da operação estão fragmentados.
          </p>
        </div>

        {/* 6 Cards Grid (100vh Fit) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {problems.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs mb-2.5 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
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
