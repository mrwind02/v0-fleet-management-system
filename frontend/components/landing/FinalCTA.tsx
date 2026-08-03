"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="py-28 bg-slate-950 text-white relative overflow-hidden">
      
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-600/30">
          <Shield className="w-6 h-6 fill-white/20" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Pronto para transformar a gestão da sua frota?
        </h2>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Junte-se a centenas de gestores que reduziram custos operacionais e ganharam controle absoluto em menos de 30 dias.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-13 px-8 text-base font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xl shadow-blue-600/30 gap-2">
              Começar gratuitamente <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>

          <Link href="#explorer">
            <Button size="lg" variant="outline" className="h-13 px-8 text-base font-semibold border-slate-800 text-slate-300 hover:bg-slate-900 rounded-xl">
              Explorar ERP Demonstrativo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
