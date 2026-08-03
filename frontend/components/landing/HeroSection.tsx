"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Car,
  Users,
  Wrench,
  DollarSign,
  Clock,
  LayoutDashboard,
  FileText,
  AlertOctagon,
  Activity,
  CheckSquare,
  Building2,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Plus,
  ChevronDown,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FrotaOneIconMark } from "@/components/ui/FrotaOneLogo"

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-60px)] flex flex-col justify-center overflow-hidden bg-white py-2 sm:py-2.5 font-sans">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-blue-50/60 blur-[110px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-4 flex flex-col items-start text-left font-sans"
          >
            {/* Minimalist Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-700">Plataforma ERP de Nova Geração</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-2.5 font-sans">
              Controle toda sua frota em uma <span className="text-blue-600">única plataforma.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mb-4 max-w-lg font-sans">
              Gerencie veículos, motoristas, abastecimentos, manutenções, documentos, despesas e indicadores em um ERP moderno, rápido e preparado para crescer junto com sua empresa.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <Link href="/login">
                <Button size="sm" className="w-full sm:w-auto h-9 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 gap-2">
                  Começar agora <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>

              <Link href="/login">
                <Button size="sm" variant="outline" className="w-full sm:w-auto h-9 px-5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Agendar demonstração
                </Button>
              </Link>
            </div>

            {/* Sub-proof list */}
            <div className="mt-4 flex items-center gap-5 text-[11px] text-slate-500 font-semibold font-sans">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sem necessidade de cartão</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Implantação em minutos</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Perfect Equal-Height Aligned Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-8 relative font-sans"
          >
            {/* Outer Window Frame */}
            <div className="rounded-2xl border border-slate-300/80 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden flex flex-col text-slate-800">
              
              {/* Full ERP App Container */}
              <div className="flex h-[410px] sm:h-[435px]">
                
                {/* 1. Left Dark Sidebar */}
                <div className="w-44 sm:w-48 bg-[#0b132b] text-slate-300 p-2.5 flex flex-col justify-between shrink-0 font-sans border-r border-slate-800 select-none hidden sm:flex">
                  <div className="space-y-2.5">
                    
                    {/* Official Brand Logo Header */}
                    <div className="flex items-center gap-2 px-1 py-0.5">
                      <FrotaOneIconMark className="w-7 h-7 shrink-0" variant="dark" />
                      <div className="flex flex-col leading-none">
                        <span className="font-bold text-xs tracking-tight text-white">
                          Frota<span className="text-blue-500">One</span>
                        </span>
                        <span className="text-[6.5px] tracking-widest text-slate-400 uppercase font-semibold mt-0.5">
                          GESTÃO DE FROTAS
                        </span>
                      </div>
                    </div>

                    {/* Active Dashboard Button */}
                    <div className="bg-blue-600 text-white rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs font-bold shadow-xs">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </div>

                    {/* Menu Categories */}
                    <div className="space-y-2 pt-0.5 text-[9.5px]">
                      
                      {/* Frota Category */}
                      <div>
                        <span className="text-[7.5px] font-bold uppercase tracking-wider text-slate-500 px-1.5 block mb-0.5">Frota</span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <Car className="w-3 h-3 text-slate-400" />
                            <span>Veículos</span>
                          </div>
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>Motoristas</span>
                          </div>
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>Documentos</span>
                          </div>
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <AlertOctagon className="w-3 h-3 text-slate-400" />
                            <span>Multas</span>
                          </div>
                        </div>
                      </div>

                      {/* Manutenção Category */}
                      <div>
                        <span className="text-[7.5px] font-bold uppercase tracking-wider text-slate-500 px-1.5 block mb-0.5">Manutenção</span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <Wrench className="w-3 h-3 text-slate-400" />
                            <span>Ordens de Serviço</span>
                          </div>
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <Activity className="w-3 h-3 text-slate-400" />
                            <span>Preventivas</span>
                          </div>
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <CheckSquare className="w-3 h-3 text-slate-400" />
                            <span>Checklists</span>
                          </div>
                        </div>
                      </div>

                      {/* Financeiro Category */}
                      <div>
                        <span className="text-[7.5px] font-bold uppercase tracking-wider text-slate-500 px-1.5 block mb-0.5">Financeiro</span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <DollarSign className="w-3 h-3 text-slate-400" />
                            <span>Abastecimentos</span>
                          </div>
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>Despesas</span>
                          </div>
                          <div className="flex items-center gap-2 px-1.5 py-0.5 rounded text-slate-300 hover:text-white font-semibold cursor-pointer">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>Fornecedores</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* 2. Main Content Area */}
                <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden font-sans">
                  
                  {/* Top Header Bar */}
                  <div className="h-10 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Menu className="w-3.5 h-3.5 text-slate-500 cursor-pointer sm:hidden" />
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
                        <input
                          type="text"
                          readOnly
                          placeholder="Buscar módulos, integrações..."
                          className="pl-7 pr-6 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] w-44 sm:w-60 text-slate-600 focus:outline-none font-sans"
                        />
                        <span className="absolute right-1.5 top-1 text-[8px] bg-slate-200/60 text-slate-500 px-1 rounded font-semibold">⌘K</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative cursor-pointer">
                        <Bell className="w-3.5 h-3.5 text-slate-600" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">3</span>
                      </div>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-pointer hidden sm:block" />
                      <Sun className="w-3.5 h-3.5 text-slate-500 cursor-pointer hidden sm:block" />
                      <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />
                      <div className="flex items-center gap-1.5 cursor-pointer">
                        <div className="flex flex-col text-right hidden sm:flex">
                          <span className="text-[10px] font-bold text-slate-800 leading-tight">Thiago Matos</span>
                          <span className="text-[8px] text-slate-400 font-medium leading-none">Administrador</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center border border-blue-200">
                          TM
                        </div>
                        <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Main Dashboard Panel */}
                  <div className="p-2.5 space-y-2 flex-1 overflow-hidden font-sans">
                    
                    {/* Breadcrumb & Top Action Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <div className="text-[10px] font-medium text-slate-500 flex items-center gap-1 font-sans">
                        <span className="font-bold text-slate-800">Dashboard</span>
                        <span>&gt;</span>
                        <span>Frota</span>
                        <span>&gt;</span>
                        <span>Visão Geral</span>
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <Button size="sm" className="h-6 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md gap-1 px-2.5 font-sans">
                          <Plus className="w-2.5 h-2.5" /> Novo Lançamento <ChevronDown className="w-2.5 h-2.5" />
                        </Button>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[9px] text-slate-600 font-semibold shadow-2xs font-sans">
                          <Calendar className="w-2.5 h-2.5 text-slate-400" />
                          <span>01/07/2026</span>
                          <span>→</span>
                          <span>31/07/2026</span>
                        </div>
                      </div>
                    </div>

                    {/* 5 Top KPI Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-sans items-stretch">
                      
                      <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between text-slate-500 mb-0.5">
                          <span className="text-[8.5px] font-bold text-slate-600 uppercase">VEÍCULOS ATIVOS</span>
                          <div className="w-4 h-4 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Car className="w-2.5 h-2.5" />
                          </div>
                        </div>
                        <span className="text-base font-extrabold text-slate-900 leading-tight">48</span>
                        <span className="text-[8px] text-emerald-600 font-bold mt-0.5">↗ +8% vs mês ant.</span>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between text-slate-500 mb-0.5">
                          <span className="text-[8.5px] font-bold text-slate-600 uppercase">MOTORISTAS ATIVOS</span>
                          <div className="w-4 h-4 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Users className="w-2.5 h-2.5" />
                          </div>
                        </div>
                        <span className="text-base font-extrabold text-slate-900 leading-tight">36</span>
                        <span className="text-[8px] text-emerald-600 font-bold mt-0.5">↗ +5% vs mês ant.</span>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between text-slate-500 mb-0.5">
                          <span className="text-[8.5px] font-bold text-slate-600 uppercase">MANUTENÇÕES HOJE</span>
                          <div className="w-4 h-4 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Wrench className="w-2.5 h-2.5" />
                          </div>
                        </div>
                        <span className="text-base font-extrabold text-slate-900 leading-tight">2</span>
                        <span className="text-[8px] text-rose-500 font-bold mt-0.5">↘ -4% vs mês ant.</span>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between text-slate-500 mb-0.5">
                          <span className="text-[8.5px] font-bold text-slate-600 uppercase">GASTOS TOTAIS</span>
                          <div className="w-4 h-4 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-2.5 h-2.5" />
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-slate-900 leading-tight font-sans whitespace-nowrap">R$ 38.650,40</span>
                        <span className="text-[8px] text-emerald-600 font-bold mt-0.5">↘ -6.8% vs mês ant.</span>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1 h-full">
                        <div className="flex items-center justify-between text-slate-500 mb-0.5">
                          <span className="text-[8.5px] font-bold text-slate-600 uppercase">DISPONIBILIDADE</span>
                          <div className="w-4 h-4 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Clock className="w-2.5 h-2.5" />
                          </div>
                        </div>
                        <span className="text-base font-extrabold text-slate-900 leading-tight">98.4%</span>
                        <span className="text-[8px] text-slate-400 font-semibold mt-0.5">Meta: 95%</span>
                      </div>

                    </div>

                    {/* Middle Charts & Alerts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 font-sans items-stretch">
                      
                      {/* Tendência de Gastos Area Chart */}
                      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs flex flex-col justify-between h-full">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[11px] font-extrabold text-slate-900 tracking-tight">Tendência de Gastos</h4>
                          <span className="text-[8px] font-semibold text-slate-600 border border-slate-200 rounded px-1 py-0.5 flex items-center gap-0.5 cursor-pointer bg-slate-50">
                            Todos os tipos <ChevronDown className="w-2 h-2 text-slate-400" />
                          </span>
                        </div>

                        {/* Area Chart Graphic */}
                        <div className="h-20 flex flex-col justify-end pt-1 relative">
                          <div className="absolute left-0 top-1 bottom-4 flex flex-col justify-between text-[6.5px] text-slate-300 pointer-events-none font-sans">
                            <span>R$ 45k</span>
                            <span>R$ 25k</span>
                            <span>R$ 0</span>
                          </div>
                          <div className="ml-5 h-14 relative w-full">
                            <svg className="w-full h-full text-blue-500/20 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                              <path d="M0,30 Q16,25 32,22 T66,15 T100,8 L100,50 L0,50 Z" fill="currentColor" />
                              <path d="M0,30 Q16,28 32,22 T66,15 T100,8" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="ml-5 flex justify-between text-[7.5px] text-slate-400 pt-1 border-t border-slate-100 font-sans">
                            <span>Jan</span>
                            <span>Fev</span>
                            <span>Mar</span>
                            <span>Abr</span>
                            <span>Mai</span>
                            <span>Jun</span>
                            <span>Jul</span>
                          </div>
                        </div>
                      </div>

                      {/* Gastos por Categoria Donut */}
                      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs flex flex-col justify-between h-full">
                        <h4 className="text-[11px] font-extrabold text-slate-900 tracking-tight mb-1">Gastos por Categoria</h4>
                        <div className="flex items-center gap-3 text-slate-700 my-auto">
                          
                          {/* Donut graphic */}
                          <div className="relative w-13 h-13 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path strokeDasharray="55.5 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563eb" strokeWidth="4.2" />
                              <path strokeDasharray="29.0 100" strokeDashoffset="-55.5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="4.2" />
                              <path strokeDasharray="11.1 100" strokeDashoffset="-84.5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4.2" />
                              <path strokeDasharray="4.4 100" strokeDashoffset="-95.6" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#a855f7" strokeWidth="4.2" />
                            </svg>
                            <div className="absolute text-center">
                              <span className="text-[6.5px] text-slate-400 block font-semibold leading-none font-sans">Total</span>
                              <span className="text-[8.5px] font-extrabold text-slate-900 font-sans whitespace-nowrap">R$ 38,6k</span>
                            </div>
                          </div>

                          {/* Category Legend */}
                          <div className="text-[8px] space-y-1 font-semibold font-sans w-full">
                            <div className="flex items-center justify-between gap-1 text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>Abastecimentos</span>
                              </div>
                              <span className="text-slate-500 font-normal text-[7.5px] whitespace-nowrap">R$ 21.450,00 (55.5%)</span>
                            </div>

                            <div className="flex items-center justify-between gap-1 text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span>Despesas</span>
                              </div>
                              <span className="text-slate-500 font-normal text-[7.5px] whitespace-nowrap">R$ 4.280,40 (11.1%)</span>
                            </div>

                            <div className="flex items-center justify-between gap-1 text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span>Manutenção</span>
                              </div>
                              <span className="text-slate-500 font-normal text-[7.5px] whitespace-nowrap">R$ 11.200,00 (29.0%)</span>
                            </div>

                            <div className="flex items-center justify-between gap-1 text-slate-700">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                <span>Multas</span>
                              </div>
                              <span className="text-slate-500 font-normal text-[7.5px] whitespace-nowrap">R$ 1.720,00 (4.4%)</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Alertas Importantes */}
                      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs flex flex-col justify-between h-full">
                        <div>
                          <h4 className="text-[11px] font-extrabold text-slate-900 tracking-tight mb-1">Alertas Importantes</h4>
                          <div className="flex items-center gap-2 text-slate-700 pt-0.5">
                            <div className="w-5.5 h-5.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                              ✓
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-900 block leading-tight font-sans">Tudo certo!</span>
                              <span className="text-[8px] text-slate-500 font-normal font-sans block truncate">Nenhum alerta crítico.</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[9px] font-bold text-blue-600 cursor-pointer hover:underline pt-1 block font-sans">
                          Ver todos os alertas &gt;
                        </span>
                      </div>

                    </div>

                    {/* Bottom Table & Next Maintenance Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 font-sans items-stretch">
                      
                      {/* Últimos Lançamentos Table */}
                      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-2 shadow-2xs flex flex-col justify-between h-full">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-[11px] font-extrabold text-slate-900 tracking-tight">Últimos Lançamentos</h4>
                            <span className="text-[9px] font-bold text-blue-600 cursor-pointer">Ver todos</span>
                          </div>

                          <div className="overflow-hidden">
                            <table className="w-full text-left text-[9px] font-sans">
                              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[7.5px] tracking-wider border-b border-slate-100">
                                <tr>
                                  <th className="p-1">DATA</th>
                                  <th className="p-1">VEÍCULO</th>
                                  <th className="p-1">MOTORISTA</th>
                                  <th className="p-1">TIPO</th>
                                  <th className="p-1">VALOR</th>
                                  <th className="p-1">STATUS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                <tr>
                                  <td className="p-1 text-slate-500 whitespace-nowrap">31/07/2026</td>
                                  <td className="p-1 font-bold text-slate-900 whitespace-nowrap">ABC-1234</td>
                                  <td className="p-1 font-semibold text-slate-800 whitespace-nowrap">Carlos Eduardo</td>
                                  <td className="p-1 font-semibold text-slate-700 whitespace-nowrap">Abastecimento</td>
                                  <td className="p-1 font-bold text-slate-900 whitespace-nowrap font-sans">R$ 1.850,00</td>
                                  <td className="p-1"><span className="text-[7px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Concluído</span></td>
                                </tr>
                                <tr>
                                  <td className="p-1 text-slate-500 whitespace-nowrap">30/07/2026</td>
                                  <td className="p-1 font-bold text-slate-900 whitespace-nowrap">DEF-5678</td>
                                  <td className="p-1 font-semibold text-slate-800 whitespace-nowrap">Roberto Mendes</td>
                                  <td className="p-1 font-semibold text-slate-700 whitespace-nowrap">Manutenção</td>
                                  <td className="p-1 font-bold text-slate-900 whitespace-nowrap font-sans">R$ 2.400,00</td>
                                  <td className="p-1"><span className="text-[7px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">Concluído</span></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Próximas Manutenções */}
                      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-2 shadow-2xs flex flex-col justify-between h-full">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-[11px] font-extrabold text-slate-900 tracking-tight">Próximas Manutenções</h4>
                            <span className="text-[9px] font-bold text-blue-600 cursor-pointer">Ver todas</span>
                          </div>

                          <div className="bg-slate-50 border border-slate-200/80 rounded-md p-1.5 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-slate-900 block leading-tight">Revisão Periódica 100k</span>
                              <span className="text-[8px] text-slate-500">Scania R450 (XYZ-9876)</span>
                            </div>
                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-sans whitespace-nowrap">
                              12/08/2026
                            </span>
                          </div>
                        </div>

                        <div className="text-[7.5px] text-slate-400 text-center pt-1 border-t border-slate-100 mt-1 font-sans">
                          © 2026 FrotaOne - Todos os direitos reservados.
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  )
}
