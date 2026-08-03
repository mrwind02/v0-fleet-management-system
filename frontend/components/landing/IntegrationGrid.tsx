"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Globe, MessageSquare, Database, Mail, Code, Cpu, Sparkles } from "lucide-react"

export function IntegrationGrid() {
  const integrations = [
    { name: "Google Maps", category: "Rotas & Geolocalização", icon: Globe, status: "Conectado" },
    { name: "WhatsApp Business", category: "Notificações & Alertas", icon: MessageSquare, status: "Conectado" },
    { name: "Supabase", category: "Banco de Dados & Auth", icon: Database, status: "Conectado" },
    { name: "Firebase", category: "Storage & Realtime", icon: Database, status: "Conectado" },
    { name: "SMTP / SendGrid", category: "Envio de Relatórios", icon: Mail, status: "Conectado" },
    { name: "REST API v2", category: "Integração ERPs Legados", icon: Code, status: "Conectado" },
    { name: "Webhooks", category: "Gatilhos de Eventos", icon: Cpu, status: "Conectado" },
    { name: "OpenAI GPT-4o", category: "IA Generativa & Analítica", icon: Sparkles, status: "Conectado" },
    { name: "Google Gemini 1.5", category: "Inteligência de Processos", icon: Sparkles, status: "Conectado" },
  ]

  return (
    <section id="integracoes" className="h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] flex flex-col justify-center bg-white relative overflow-hidden py-4 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-4">
            Ecossistema Aberto
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Integrações nativas com suas ferramentas favoritas.
          </h2>
          <p className="text-slate-600 text-base">
            O FrotaOne se conecta perfeitamente ao seu ecossistema tecnológico existente sem atritos.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs group-hover:scale-105 group-hover:text-blue-600 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    <p className="text-[11px] text-slate-500 font-normal">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{item.status}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
