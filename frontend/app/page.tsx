"use client"

import * as React from "react"
import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { LogoCloud } from "@/components/landing/LogoCloud"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { ArchitectureDiagram } from "@/components/landing/ArchitectureDiagram"
import { ModuleGrid } from "@/components/landing/ModuleGrid"
import { ErpExplorer } from "@/components/landing/ErpExplorer"
import { DifferentialsGrid } from "@/components/landing/DifferentialsGrid"
import { IntegrationGrid } from "@/components/landing/IntegrationGrid"
import { SecurityGrid } from "@/components/landing/SecurityGrid"
import { TestimonialGrid } from "@/components/landing/TestimonialGrid"
import { PricingSection } from "@/components/landing/PricingSection"
import { FAQAccordion } from "@/components/landing/FAQAccordion"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Footer } from "@/components/landing/Footer"

export default function RootPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white antialiased">
      <Navbar />
      <main className="pt-0">
        <HeroSection />
        <ProblemSection />
        <ErpExplorer />
        <ArchitectureDiagram />
        <ModuleGrid />
        <DifferentialsGrid />
        <IntegrationGrid />
        <SecurityGrid />
        <TestimonialGrid />
        <PricingSection />
        <FAQAccordion />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
