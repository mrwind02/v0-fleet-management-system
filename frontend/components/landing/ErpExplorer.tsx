"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Wrench, BarChart3, Truck, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CardContent {
  id: string
  number: string
  badge: string
  title: string
  paragraph1: string
  paragraph2: string
  showCta?: boolean
  bgImage: string
  fallbackImage: string
  icon: React.ElementType
}

export function ErpExplorer() {
  const [activeIndex, setActiveIndex] = React.useState<number>(0)

  const cardsData: CardContent[] = [
    {
      id: "card-01",
      number: "01",
      badge: "Operação & Frota Rodoviária",
      title: "Controle total da sua frota",
      paragraph1:
        "Gerencie veículos, motoristas, abastecimentos, documentos, despesas e manutenções em um único ambiente, com informações centralizadas e atualizadas em tempo real.",
      paragraph2:
        "Enquanto outros sistemas distribuem dados em diferentes telas, o FrotaOne conecta toda a operação para oferecer uma visão completa da sua frota.",
      bgImage: "/images/erp/card_01_fleet.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80",
      icon: Truck
    },
    {
      id: "card-02",
      number: "02",
      badge: "Manutenção & Oficinas Especializadas",
      title: "Manutenções inteligentes",
      paragraph1:
        "Planeje preventivas, acompanhe Ordens de Serviço, registre peças, mão de obra e custos sem perder o histórico de cada veículo.",
      paragraph2:
        "Todo o processo é integrado, reduzindo paradas inesperadas e aumentando a disponibilidade da frota.",
      bgImage: "/images/erp/card_02_maintenance.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80",
      icon: Wrench
    },
    {
      id: "card-03",
      number: "03",
      badge: "Telemetria & Decisões Estratégicas",
      title: "Decisões baseadas em dados",
      paragraph1:
        "Dashboards modernos transformam informações operacionais em indicadores estratégicos.",
      paragraph2:
        "Acompanhe custos por veículo, consumo de combustível, desempenho da frota, despesas, documentos e produtividade em tempo real.",
      showCta: true,
      bgImage: "/images/erp/card_03_analytics.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80",
      icon: BarChart3
    }
  ]

  const handleNext = () => {
    setActiveIndex((prev) => (prev < cardsData.length - 1 ? prev + 1 : prev))
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const activeCard = cardsData[activeIndex]
  const CardIcon = activeCard.icon

  return (
    <section
      id="erp"
      className="relative bg-slate-50 font-sans border-t border-slate-200/80 py-12 sm:py-16 lg:py-20 scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <span>O ERP FrotaOne</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Plataforma 100% Integrada
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore os módulos operacionais da gestão de frota.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
          {cardsData.map((card, idx) => {
            const Icon = card.icon
            const isActive = activeIndex === idx
            return (
              <button
                key={card.id}
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-600"}`} />
                <span>{card.number}. {card.title}</span>
              </button>
            )
          })}
        </div>

        {/* Active Card Display Container - ALWAYS 100% VISIBLE WITH NO BLANK SPACE */}
        <div className="relative w-full max-w-7xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/10 overflow-hidden transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
            
            {/* Left Column: Title & Badge */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider w-fit">
                <CardIcon className="w-4 h-4" />
                <span>{activeCard.badge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.08]">
                {activeCard.title}
              </h2>

              <p className="text-slate-900 text-sm sm:text-base leading-relaxed font-semibold">
                {activeCard.paragraph1}
              </p>
            </div>

            {/* Right Column: High-Res Image Banner & Content */}
            <div className="lg:col-span-7 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-8 space-y-4">
              
              {/* High-Res Image Banner */}
              <div className="relative h-48 sm:h-56 lg:h-60 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <img
                  key={activeCard.id}
                  src={activeCard.bgImage}
                  onError={(e) => { (e.target as HTMLImageElement).src = activeCard.fallbackImage }}
                  alt={activeCard.title}
                  className="w-full h-full object-cover object-center transition-all duration-700 animate-in fade-in zoom-in-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-xs font-mono font-bold text-white bg-slate-900/80 px-3 py-1 rounded-md border border-slate-700">
                  {activeCard.badge}
                </div>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                {activeCard.paragraph2}
              </p>

              {activeCard.showCta && (
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <Link href="/login">
                    <Button size="default" className="h-11 px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 gap-2">
                      Começar agora <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Carousel Navigation Controls (Arrows + Indicator Dots) */}
        <div className="flex items-center justify-between max-w-7xl mx-auto mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="text-xs font-semibold gap-1.5 h-9 rounded-xl border-slate-200"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>

          {/* Indicator Dots */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            {cardsData.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === i ? "w-8 bg-blue-600" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Ver Card ${c.number} — ${c.title}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={activeIndex === cardsData.length - 1}
            className="text-xs font-semibold gap-1.5 h-9 rounded-xl border-slate-200"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </section>
  )
}
