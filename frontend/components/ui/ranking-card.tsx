"use client"

import * as React from "react"
import { Award, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RankingEntry } from "@/types/indicators"
import { cn } from "@/utils/utils"

interface RankingCardProps {
  rankings: Record<string, RankingEntry[]>
}

export function RankingCard({ rankings }: RankingCardProps) {
  const [activeTab, setActiveTab] = React.useState("vehicles")

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-amber-500 text-white font-black shadow-sm"
    if (rank === 2) return "bg-slate-300 text-slate-900 font-bold"
    if (rank === 3) return "bg-amber-700 text-white font-bold"
    return "bg-muted text-muted-foreground font-semibold"
  }

  return (
    <div className="bg-card border rounded-2xl p-4 space-y-4 shadow-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Ranking Top 10 de Desempenho</h3>
              <p className="text-xs text-muted-foreground">Classificação dos melhores ativos e operacionais do sistema</p>
            </div>
          </div>

          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="vehicles" className="text-xs font-bold px-3">Veículos</TabsTrigger>
            <TabsTrigger value="drivers" className="text-xs font-bold px-3">Motoristas</TabsTrigger>
            <TabsTrigger value="units" className="text-xs font-bold px-3">Unidades</TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs font-bold px-3">Fornecedores</TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(rankings).map(([key, list]) => (
          <TabsContent key={key} value={key} className="pt-3">
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {list.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors border border-border/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 font-mono", getRankBadge(item.rank))}>
                      #{item.rank}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                      <p className="text-[11px] text-muted-foreground truncate">{item.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-extrabold text-foreground font-mono">
                      {item.metricValue}
                    </span>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] gap-1 font-mono",
                        item.trend === "up" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : item.trend === "down" ? "bg-rose-500/10 text-rose-600 border-rose-500/30" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.trend === "up" && <TrendingUp className="h-3 w-3" />}
                      {item.trend === "down" && <TrendingDown className="h-3 w-3" />}
                      {item.trend === "flat" && <Minus className="h-3 w-3" />}
                      {item.trendText}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
