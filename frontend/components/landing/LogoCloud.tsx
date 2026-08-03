"use client"

import * as React from "react"

export function LogoCloud() {
  const logos = [
    "LOGÍSTICA BRASIL",
    "TRANSPORTE EXPRESS",
    "FROTA & CO",
    "CARGO LOG",
    "VIASUL TRANSPORTES",
    "RODOVIA CARGO"
  ]

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
          Empresas que confiam no FrotaOne
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-center opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          {logos.map((logo, i) => (
            <div key={i} className="flex items-center justify-center">
              <span className="font-mono font-bold text-slate-400 text-sm tracking-wider hover:text-slate-800 transition-colors cursor-default">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
