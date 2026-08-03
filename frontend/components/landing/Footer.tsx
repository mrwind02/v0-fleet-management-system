"use client"

import * as React from "react"
import Link from "next/link"
import { FrotaOneLogo } from "@/components/ui/FrotaOneLogo"

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <FrotaOneLogo variant="dark" size="md" showTagline={true} />
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs font-normal">
              A plataforma ERP inteligente para controle operacional, redução de custos e inteligência de frotas.
            </p>
          </div>

          {/* Empresa */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Empresa</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Imprensa</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
            </ul>
          </div>

          {/* Produto */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Produto</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#modulos" className="hover:text-white transition-colors">Módulos</a></li>
              <li><a href="#integracoes" className="hover:text-white transition-colors">Integrações</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API & Docs</a></li>
            </ul>
          </div>

          {/* Recursos */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Recursos</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Calculadora de CPK</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog de Gestão</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Guias & Ebooks</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Legal</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-medium">
          <p>© 2026 FrotaOne Inc. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Status: Todos os sistemas operacionais</span>
            <span>Certificação ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
