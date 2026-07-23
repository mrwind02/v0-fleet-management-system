"use client"

import * as React from "react"
import { Search, SlidersHorizontal, LayoutGrid, Download, Plus } from "lucide-react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { cn } from "@/utils/utils"

export type TableDensity = "compact" | "comfortable" | "spaced"

interface ToolbarProps {
  onSearch: (value: string) => void
  searchValue: string
  searchPlaceholder?: string
  
  density: TableDensity
  onDensityChange: (density: TableDensity) => void
  
  // Optional: For column toggling if exposed to parent, or we can just pass ReactNodes
  extraActions?: React.ReactNode
}

export function Toolbar({
  onSearch,
  searchValue,
  searchPlaceholder = "Buscar...",
  density,
  onDensityChange,
  extraActions
}: ToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-card border rounded-xl shadow-sm mb-4">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-4 py-2 text-xs border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
              <LayoutGrid className="mr-2 h-3.5 w-3.5" />
              Densidade
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 text-xs">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Layout da Tabela</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem 
              checked={density === "compact"} 
              onCheckedChange={() => onDensityChange("compact")}
              className="text-xs"
            >
              Compacta
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={density === "comfortable"} 
              onCheckedChange={() => onDensityChange("comfortable")}
              className="text-xs"
            >
              Confortável
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={density === "spaced"} 
              onCheckedChange={() => onDensityChange("spaced")}
              className="text-xs"
            >
              Espaçada
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
          <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
          Filtros
        </Button>

        {extraActions}
      </div>
    </div>
  )
}
