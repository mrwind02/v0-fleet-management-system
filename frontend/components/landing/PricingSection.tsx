"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      desc: "Ideal para pequenas frotas buscando organizar o básico sem complicação.",
      price: "R$ 199",
      period: "/mês",
      highlight: false,
      features: [
        "Até 15 veículos cadastrados",
        "Gestão de motoristas e CNH",
        "Lançamento de abastecimentos",
        "Ordens de Serviço básicas",
        "Alertas simples de vencimentos",
        "Suporte por e-mail"
      ],
      cta: "Começar no Starter",
      href: "/login"
    },
    {
      name: "Professional",
      desc: "Para frotas médias que exigem controle financeiro rigoroso e preventivas.",
      price: "R$ 499",
      period: "/mês",
      highlight: true,
      badge: "Mais Popular",
      features: [
        "Até 50 veículos cadastrados",
        "Tudo do plano Starter +",
        "Manutenção Preventiva automática",
        "Auditoria de combustível & CPK",
        "Relatórios dinâmicos em PDF/Excel",
        "Alertas via WhatsApp e E-mail",
        "Suporte prioritário"
      ],
      cta: "Começar no Professional",
      href: "/login"
    },
    {
      name: "Enterprise",
      desc: "Para grandes frotas com necessidade de IA, APIs customizadas e SLAs.",
      price: "Sob Consulta",
      period: "",
      highlight: false,
      features: [
        "Veículos e motoristas ilimitados",
        "Tudo do plano Professional +",
        "IA Generativa para Insights (OpenAI/Gemini)",
        "Acesso completo à API REST & Webhooks",
        "Gerente de conta dedicado",
        "SLA de suporte 99.9%",
        "Treinamento de equipe incluído"
      ],
      cta: "Falar com Consultor",
      href: "/login"
    }
  ]

  return (
    <section id="planos" className="h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] flex flex-col justify-center bg-slate-50 relative overflow-hidden py-4 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-3">
            Investimento Transparente
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Planos sob medida para o tamanho da sua frota.
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-normal">
            Sem letras miúdas. Cancele ou altere seu plano a qualquer momento.
          </p>
        </div>

        {/* 3 Cards Grid - Compact & Full Viewport Fit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className={`p-6 rounded-2xl flex flex-col justify-between relative transition-all ${
                plan.highlight
                  ? "bg-slate-900 text-white border-2 border-blue-600 shadow-xl shadow-slate-900/20 md:-translate-y-1"
                  : "bg-white text-slate-900 border border-slate-200 shadow-2xs hover:border-slate-300"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className={`text-[11px] leading-snug mb-4 font-normal ${plan.highlight ? "text-slate-400" : "text-slate-600"}`}>
                  {plan.desc}
                </p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-extrabold tracking-tight font-mono">{plan.price}</span>
                  <span className={`text-[11px] font-semibold ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}>{plan.period}</span>
                </div>

                <div className="space-y-2 mb-6 text-[11px] font-medium">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${plan.highlight ? "text-blue-400" : "text-emerald-600"}`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href={plan.href}>
                <Button
                  size="sm"
                  className={`w-full h-10 text-xs font-bold rounded-xl gap-1.5 ${
                    plan.highlight
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
