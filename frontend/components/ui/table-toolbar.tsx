"use client"

import * as React from "react"
import {
  Search,
  Filter,
  Columns,
  Maximize2,
  Bookmark,
  MoreVertical,
  FileSpreadsheet,
  FileText,
  Upload,
  Printer,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/utils/utils"

export interface TableToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filtersContent?: React.ReactNode
  activeFiltersCount?: number
  allowImport?: boolean
  onImport?: () => void
  onExportExcel?: () => void
  onExportCsv?: () => void
  onPrint?: () => void
  onSaveView?: () => void
  density?: "compact" | "comfortable" | "spacious"
  onDensityChange?: (density: "compact" | "comfortable" | "spacious") => void
  extraTools?: React.ReactNode
  className?: string
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar registros...",
  filtersContent,
  activeFiltersCount = 0,
  allowImport = false,
  onImport,
  onExportExcel,
  onExportCsv,
  onPrint,
  onSaveView,
  density = "comfortable",
  onDensityChange,
  extraTools,
  className
}: TableToolbarProps) {
  const [showFiltersPopover, setShowFiltersPopover] = React.useState(false)

  const handleDefaultExportExcel = () => {
    if (onExportExcel) {
      onExportExcel()
    } else {
      alert("Exportando relatório em formato Excel (.xlsx)...")
    }
  }

  const handleDefaultExportCsv = () => {
    if (onExportCsv) {
      onExportCsv()
    } else {
      alert("Exportando dados em formato CSV (.csv)...")
    }
  }

  const handleDefaultPrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  const handleDefaultImport = () => {
    if (onImport) {
      onImport()
    } else {
      alert("Abrindo assistente de importação em lote por planilha...")
    }
  }

  const handleDefaultSaveView = () => {
    if (onSaveView) {
      onSaveView()
    } else {
      alert("Visão de colunas e filtros salva com sucesso para este usuário!")
    }
  }

  return (
    <div className={cn("bg-card border rounded-2xl p-3.5 shadow-sm space-y-3", className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Left Side: Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 text-xs h-9 bg-background"
          />
        </div>

        {/* Right Side: Action Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          {/* Custom Filters Slot or Filter Toggle Button */}
          {filtersContent ? (
            <div className="flex items-center gap-2 flex-wrap">{filtersContent}</div>
          ) : null}

          {/* Extra Tools Slot (e.g. View Toggle Table/Calendar) */}
          {extraTools}

          {/* Density Selector */}
          {onDensityChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 px-3">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Densidade</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuLabel>Ajuste de Linhas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDensityChange("compact")}>
                  Compacta {density === "compact" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDensityChange("comfortable")}>
                  Confortável {density === "comfortable" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDensityChange("spacious")}>
                  Espaçosa {density === "spacious" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Save View Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDefaultSaveView}
            className="h-9 text-xs gap-1.5 px-3 hidden lg:flex"
            title="Salvar visão atual de filtros e colunas"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Salvar Visão</span>
          </Button>

          {/* Unified "Mais ▼" Corporate Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 px-3 bg-muted/30">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold">Mais</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuLabel>Opções da Tabela</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDefaultExportExcel}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Exportar Excel (.xlsx)
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDefaultExportCsv}>
                <FileText className="h-3.5 w-3.5 mr-2 text-blue-600" /> Exportar CSV (.csv)
              </DropdownMenuItem>

              {allowImport && (
                <DropdownMenuItem onClick={handleDefaultImport}>
                  <Upload className="h-3.5 w-3.5 mr-2 text-amber-600" /> Importar Dados em Lote
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDefaultPrint}>
                <Printer className="h-3.5 w-3.5 mr-2 text-slate-600" /> Imprimir Tabela
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
