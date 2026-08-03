"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, TrendingUp, Award, CheckCircle2, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FleetScoreData } from "@/types/indicators"
import { cn } from "@/utils/utils"

interface ScoreCardProps {
  scoreData: FleetScoreData
}

export function ScoreCard({ scoreData }: ScoreCardProps) {
  return (
    <div
      className="w-full shrink-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white border border-slate-700/60 rounded-2xl p-5 shadow-xl relative overflow-hidden"
    >
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Section: Big Score Circle & Overview */}
        <div className="flex flex-col sm:flex-row items-center gap-5 shrink-0 text-center sm:text-left">
          {/* Circular Gauge / Badge */}
          <div className="relative flex items-center justify-center h-28 w-28 rounded-full bg-slate-900/90 border-4 border-emerald-500/40 shadow-2xl p-2 shrink-0">
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-white leading-none">
                {scoreData.score}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-0.5">
                / {scoreData.maxScore}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg font-bold text-xs">
              <Award className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Diferencial FrotaOne
              </span>
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] uppercase font-extrabold px-2">
                {scoreData.classification}
              </Badge>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Score Operacional da Frota
            </h2>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <TrendingUp className="h-3.5 w-3.5" /> +{scoreData.trendDelta} pontos
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">em relação ao {scoreData.comparedTo}</span>
            </div>
          </div>
        </div>

        {/* Right Section: 6 Composition Weights Pills */}
        <div className="w-full lg:w-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t lg:border-t-0 lg:border-l border-slate-700/60 pt-4 lg:pt-0 lg:pl-6">
          {scoreData.composition.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-semibold truncate">{item.indicator}</span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">({item.weight}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">
                  {typeof item.score === "number" ? item.score.toFixed(1) : item.score}%
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">{item.targetText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
