"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Menu, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FrotaOneLogo } from "@/components/ui/FrotaOneLogo"

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState<string>("")

  const navLinks = [
    { label: "O ERP", href: "#erp", id: "erp" },
    { label: "Módulos", href: "#modulos", id: "modulos" },
    { label: "Diferenciais", href: "#diferenciais", id: "diferenciais" },
    { label: "Integrações", href: "#integracoes", id: "integracoes" },
    { label: "Planos", href: "#planos", id: "planos" },
    { label: "FAQ", href: "#faq", id: "faq" },
  ]

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const sectionIds = ["erp", "modulos", "diferenciais", "integracoes", "planos", "faq"]
      const viewportHeight = window.innerHeight
      let currentActive = ""

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= viewportHeight * 0.45 && rect.bottom >= 100) {
            currentActive = id
          }
        }
      }
      setActiveSection(currentActive)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault()
    setActiveSection(id)
    if (href.startsWith("#")) {
      const targetEl = document.querySelector(href)
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-2.5 shadow-xs"
            : "bg-transparent py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Official Brand Logo */}
          <Link 
            href="/" 
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            }}
            className="group cursor-pointer hover:opacity-95 transition-opacity"
          >
            <FrotaOneLogo showTagline={true} size="md" />
          </Link>

          {/* Desktop Nav Links (No background box) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href, link.id)}
                  className={`relative py-1 text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavUnderline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button size="sm" className="h-9 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 gap-2">
                Começar agora <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[57px] z-40 bg-white border-b border-slate-200 p-4 shadow-lg md:hidden flex flex-col gap-3"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  handleScrollTo(e, link.href, link.id)
                  setMobileMenuOpen(false)
                }}
                className="text-xs font-semibold text-slate-700 py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full text-xs font-bold bg-blue-600 text-white rounded-xl h-10">
                  Começar agora
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
