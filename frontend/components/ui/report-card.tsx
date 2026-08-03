"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Star,
  Play,
  Settings,
  Copy,
  Clock,
  FileSpreadsheet,
  FileText,
  FileCode,
  MoreVertical,
  Truck,
  Activity,
  Gauge,
  Percent,
  Award,
  FileCheck,
  AlertTriangle,
  Wrench,
  DollarSign,
  Fuel,
  TrendingUp,
  Building2,
  Store,
  CheckSquare,
  PieChart,
  Users,
  ShieldCheck
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReportConfig } from "@/types/reports"
import { cn } from "@/utils/utils"

interface ReportCardProps {
  report: ReportConfig
  onExecute: (report: ReportConfig) => void
  onConfigure: (report: ReportConfig) => void
  onDuplicate: (report: ReportConfig) => void
  onToggleFavorite: (reportId: string) => void
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Truck: <Truck className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />,
  Gauge: <Gauge className="h-4 w-4" />,
  Percent: <Percent className="h-4 w-4" />,
  Award: <Award className="h-4 w-4" />,
  FileCheck: <FileCheck className="h-4 w-4" />,
  AlertTriangle: <AlertTriangle className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
  Fuel: <Fuel className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Store: <Store className="h-4 w-4" />,
  CheckSquare: <CheckSquare className="h-4 w-4" />,
  PieChart: <PieChart className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  frota: { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  motoristas: { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  manutencao: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  financeiro: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  documentacao: { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20" },
  fornecedores: { bg: "bg-cyan-500/10 dark:bg-cyan-500/20", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/20" },
  checklists: { bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20" },
  executivo: { bg: "bg-rose-500/10 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" }
}

export function ReportCard({
  report,
  onExecute,
  onConfigure,
  onDuplicate,
  onToggleFavorite
}: ReportCardProps) {
  const catStyle = CATEGORY_COLORS[report.category] || CATEGORY_COLORS.frota
  const icon = (report.iconName && ICON_MAP[report.iconName]) || <FileText className="h-4 w-4" />

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col justify-between overflow-hidden border border-border/60 hover:border-primary/40 bg-card hover:shadow-md transition-all">
        <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-3">
          {/* Header section: Icon + Badges + Favorite */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className={cn("p-2 rounded-lg border shrink-0 mt-0.5", catStyle.bg, catStyle.text, catStyle.border)}>
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground block leading-none mb-1">
                  {report.code}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-foreground leading-tight line-clamp-2">
                  {report.name}
                </h3>
              </div>
            </div>

            <button
              onClick={() => onToggleFavorite(report.id)}
              className="p-1 rounded-full text-muted-foreground hover:text-amber-500 transition-colors shrink-0"
              title={report.isFavorite ? "Remover dos favoritos" : "Marcar como favorito"}
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-all",
                  report.isFavorite
                    ? "fill-amber-400 text-amber-500 scale-110"
                    : "hover:scale-110"
                )}
              />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {report.description}
          </p>

          {/* Badges Info row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <Badge variant="outline" className={cn("text-[10px] capitalize px-2 py-0.5 font-medium", catStyle.bg, catStyle.text, catStyle.border)}>
              {report.category}
            </Badge>

            {report.isScheduled && (
              <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Clock className="h-3 w-3" />
                <span className="capitalize">{report.schedule.periodicity}</span>
              </Badge>
            )}

            <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0.5 text-muted-foreground">
              {report.exportFormat}
            </Badge>

            {report.lastRun && (
              <span className="text-[10px] text-muted-foreground ml-auto truncate">
                {report.lastRun}
              </span>
            )}
          </div>

          {/* Action buttons footer */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/40">
            <Button
              size="sm"
              className="flex-1 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8"
              onClick={() => onExecute(report)}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Executar
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onConfigure(report)}
              title="Configurar Relatório"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                <DropdownMenuItem onClick={() => onExecute(report)} className="gap-2 text-xs">
                  <Play className="h-3.5 w-3.5 text-primary" />
                  Executar agora
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConfigure(report)} className="gap-2 text-xs">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Configurar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(report)} className="gap-2 text-xs">
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleFavorite(report.id)} className="gap-2 text-xs">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  {report.isFavorite ? "Remover Favorito" : "Favoritar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
