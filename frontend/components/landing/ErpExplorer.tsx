"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CardContent {
  id: string
  number: string
  title: string
  paragraph1: string
  paragraph2: string
  showCta?: boolean
}

export function ErpExplorer() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = React.useState<number>(0)
  const [activeCardIndex, setActiveCardIndex] = React.useState<number>(0)

  React.useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const totalScrollable = rect.height - windowHeight

      if (totalScrollable <= 0) return

      // Progress from 0 (top of section hits viewport top) to 1 (bottom of section hits viewport bottom)
      const rawProgress = -rect.top / totalScrollable
      const clampedProgress = Math.max(0, Math.min(1, rawProgress))

      setScrollProgress(clampedProgress)

      if (clampedProgress < 0.38) {
        setActiveCardIndex(0)
      } else if (clampedProgress < 0.72) {
        setActiveCardIndex(1)
      } else {
        setActiveCardIndex(2)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleStepClick = (index: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const totalScrollable = rect.height - windowHeight

    const targetProgress = index === 0 ? 0.05 : index === 1 ? 0.50 : 0.90
    const targetScrollY = window.pageYOffset + rect.top + targetProgress * totalScrollable

    window.scrollTo({ top: targetScrollY, behavior: "smooth" })
  }

  const cardsData: CardContent[] = [
    {
      id: "card-01",
      number: "01",
      title: "Controle total da sua frota",
      paragraph1:
        "Gerencie veículos, motoristas, abastecimentos, documentos, despesas e manutenções em um único ambiente, com informações centralizadas e atualizadas em tempo real.",
      paragraph2:
        "Enquanto outros sistemas distribuem dados em diferentes telas, o FrotaOne conecta toda a operação para oferecer uma visão completa da sua frota."
    },
    {
      id: "card-02",
      number: "02",
      title: "Manutenções inteligentes",
      paragraph1:
        "Planeje preventivas, acompanhe Ordens de Serviço, registre peças, mão de obra e custos sem perder o histórico de cada veículo.",
      paragraph2:
        "Todo o processo é integrado, reduzindo paradas inesperadas e aumentando a disponibilidade da frota."
    },
    {
      id: "card-03",
      number: "03",
      title: "Decisões baseadas em dados",
      paragraph1:
        "Dashboards modernos transformam informações operacionais em indicadores estratégicos.",
      paragraph2:
        "Acompanhe custos por veículo, consumo de combustível, desempenho da frota, despesas, documentos e produtividade em tempo real.",
      showCta: true
    }
  ]

  return (
    <section
      id="erp"
      ref={containerRef}
      className="relative h-[260vh] sm:h-[280vh] bg-slate-50 font-sans border-t border-slate-200/80 scroll-mt-20"
    >
      {/* Sticky Viewport Area */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Background Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-blue-100/30 blur-[150px] rounded-full pointer-events-none -z-0" />

        {/* Storytelling Cards Area */}
        <div className="max-w-7xl mx-auto w-full relative h-[460px] sm:h-[400px] flex items-center justify-center">
          {cardsData.map((card, idx) => {
            // Calculate state for each card based on scrollProgress
            let y = 0
            let scale = 1
            let opacity = 1
            let blur = "blur(0px)"
            let zIndex = 10

            if (idx === 0) {
              if (scrollProgress < 0.32) {
                // Focused
                y = 0
                scale = 1
                opacity = 1
                blur = "blur(0px)"
                zIndex = 10
              } else {
                // Pushed back
                const p = Math.min(1, (scrollProgress - 0.32) / 0.15)
                y = -24 * p
                scale = 1 - 0.03 * p
                opacity = 1 - 0.6 * p
                blur = `blur(${3 * p}px)`
                zIndex = 5
              }
            } else if (idx === 1) {
              if (scrollProgress < 0.28) {
                // Below viewport
                y = 500
                scale = 0.97
                opacity = 0
                blur = "blur(4px)"
                zIndex = 20
              } else if (scrollProgress < 0.42) {
                // Sliding up into focus
                const p = (scrollProgress - 0.28) / 0.14
                y = 500 * (1 - p)
                scale = 0.97 + 0.03 * p
                opacity = p
                blur = `blur(${4 * (1 - p)}px)`
                zIndex = 20
              } else if (scrollProgress < 0.65) {
                // Focused
                y = 0
                scale = 1
                opacity = 1
                blur = "blur(0px)"
                zIndex = 20
              } else {
                // Pushed back
                const p = Math.min(1, (scrollProgress - 0.65) / 0.15)
                y = -24 * p
                scale = 1 - 0.03 * p
                opacity = 1 - 0.6 * p
                blur = `blur(${3 * p}px)`
                zIndex = 15
              }
            } else if (idx === 2) {
              if (scrollProgress < 0.60) {
                // Below viewport
                y = 500
                scale = 0.97
                opacity = 0
                blur = "blur(4px)"
                zIndex = 30
              } else if (scrollProgress < 0.78) {
                // Sliding up into focus
                const p = (scrollProgress - 0.60) / 0.18
                y = 500 * (1 - p)
                scale = 0.97 + 0.03 * p
                opacity = p
                blur = `blur(${4 * (1 - p)}px)`
                zIndex = 30
              } else {
                // Focused
                y = 0
                scale = 1
                opacity = 1
                blur = "blur(0px)"
                zIndex = 30
              }
            }

            return (
              <div
                key={card.id}
                onClick={() => handleStepClick(idx)}
                style={{
                  transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                  opacity: opacity,
                  filter: blur,
                  zIndex: zIndex,
                  transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, filter 0.4s ease"
                }}
                className="absolute inset-x-0 mx-auto w-full max-w-7xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/10 cursor-pointer pointer-events-auto select-none"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
                  
                  {/* Left Column: Enormous Title */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                      {card.title}
                    </h2>
                  </div>

                  {/* Right Column: Paragraph 1 & Paragraph 2 */}
                  <div className="lg:col-span-7 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-10 space-y-4">
                    <p className="text-slate-900 text-base sm:text-lg leading-relaxed font-semibold">
                      {card.paragraph1}
                    </p>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                      {card.paragraph2}
                    </p>

                    {card.showCta && (
                      <div className="pt-2 flex flex-wrap items-center gap-3">
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
            )
          })}
        </div>

        {/* Step Indicator Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/80 shadow-md">
          {cardsData.map((c, i) => (
            <button
              key={c.id}
              onClick={() => handleStepClick(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeCardIndex === i ? "w-8 bg-blue-600" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              title={`Ver Card ${c.number}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
