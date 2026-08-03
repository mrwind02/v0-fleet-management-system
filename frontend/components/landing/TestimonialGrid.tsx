"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

export function TestimonialGrid() {
  const testimonials = [
    {
      name: "Marcus Vinícius",
      role: "Diretor de Operações",
      company: "Viasul Logística & Cargas",
      comment: "Reduzimos em 22% nossos custos com combustível nos primeiros 60 dias de FrotaOne. A clareza dos indicadores e o controle de preventivas mudaram o jogo.",
      rating: 5,
      avatar: "MV"
    },
    {
      name: "Fernanda Alencar",
      role: "Gestora de Frota",
      company: "Expresso Transnorte",
      comment: "Antes do FrotaOne, tínhamos veículos parados por documento vencido. Hoje recebemos alertas automáticos no WhatsApp e a conformidade é de 100%.",
      rating: 5,
      avatar: "FA"
    },
    {
      name: "Roberto Mendes",
      role: "CFO & Gerente Financeiro",
      company: "Rodovia Brasil Cargo",
      comment: "A facilidade de auditoria dos relatórios e o cálculo exato do CPK trouxeram previsibilidade financeira que nunca tivemos com planilhas.",
      rating: 5,
      avatar: "RM"
    }
  ]

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-4">
            Histórias de Sucesso
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Reconhecido por quem lidera grandes operações.
          </h2>
          <p className="text-slate-600 text-base">
            Veja como o FrotaOne transforma a rotina de gestores e diretores de logística em todo o Brasil.
          </p>
        </div>

        {/* Grid Cards (No Carousel) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium mb-6 italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {item.avatar}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 font-normal">{item.role} • {item.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
