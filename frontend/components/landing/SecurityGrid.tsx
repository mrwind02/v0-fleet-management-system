"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Lock, Key, HardDrive, FileCheck, CheckCircle2 } from "lucide-react"

export function SecurityGrid() {
  const securityItems = [
    {
      icon: ShieldCheck,
      title: "Logs Imutáveis",
      desc: "Histórico completo de auditoria para cada alteração, deleção ou criação no sistema."
    },
    {
      icon: Key,
      title: "Controle de Permissões (RBAC)",
      desc: "Níveis de acesso específicos para Administrador, Gestor, Financeiro e Operacional."
    },
    {
      icon: HardDrive,
      title: "Backups Automatizados",
      desc: "Cópias de segurança diárias com redundância geográfica e alta disponibilidade."
    },
    {
      icon: FileCheck,
      title: "Trilha de Auditoria",
      desc: "Registro exato de autor e horário de cada lançamento financeiro ou alteração de veículo."
    },
    {
      icon: Lock,
      title: "Criptografia de Ponta a Ponta",
      desc: "Protocolos TLS 1.3 em trânsito e criptografia AES-256 para dados armazenados."
    },
    {
      icon: CheckCircle2,
      title: "Conformidade LGPD",
      desc: "Tratamento seguro e transparente de dados de motoristas e condutores."
    }
  ]

  return (
    <section className="py-12 sm:py-16 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            Segurança Enterprise
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Sua informação protegida em nível bancário.
          </h2>
          <p className="text-slate-400 text-base">
            Protegemos os dados da sua operação com os mais rigorosos padrões mundiais de segurança.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-blue-500/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
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
