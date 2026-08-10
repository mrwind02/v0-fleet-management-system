"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  const faqs = [
    {
      q: "Quanto tempo leva a implantação do FrotaOne na minha empresa?",
      a: "A implantação é imediata. Você pode cadastrar seus primeiros veículos e motoristas em menos de 10 minutos ou utilizar nossa planilha de importação para migrar centenas de registros instantaneamente."
    },
    {
      q: "Preciso instalar algum hardware ou rastreador GPS nos veículos?",
      a: "Não é obrigatório. O FrotaOne funciona perfeitamente como um ERP de gestão operacional e financeira sem necessidade de hardware. Se você já utiliza telemetria ou rastreadores, nosso sistema se integra via API."
    },
    {
      q: "Como o sistema ajuda na economia de combustível?",
      a: "O FrotaOne cruza os dados de abastecimento com o hodômetro do veículo para calcular o consumo real (km/L). O sistema identifica automaticamente motoristas ou veículos com médias abaixo da meta ou suspeitas de inconformidade."
    },
    {
      q: "Posso exportar os relatórios para PDF e Excel?",
      a: "Sim! Todos os relatórios (Financeiros, de Frota, Manutenção e Motoristas) podem ser gerados dinamicamente em PDF executivo ou planilhas Excel (XLSX) com um único clique."
    },
    {
      q: "Existe fidelidade ou multa de cancelamento?",
      a: "Não. Nossos planos são mensais e sem fidelidade. Você pode alterar seu plano ou cancelar a assinatura quando desejar."
    }
  ]

  return (
    <section id="faq" className="h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] flex flex-col justify-center bg-white relative overflow-hidden py-4 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-4">
            Dúvidas Frequentes
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Perguntas & Respostas
          </h2>
          <p className="text-slate-600 text-base">
            Tudo o que você precisa saber antes de transformar a gestão da sua frota.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed border-t border-slate-100 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
