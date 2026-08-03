"use client"

import * as React from "react"
import {
  Search, Layers, Plus, Check, Download, ShieldCheck, Sparkles, MapPin,
  MessageSquare, Database, FileCheck, Cpu, Flame, Mail, Share2, Activity,
  Truck, DollarSign, Server, Globe, HardDrive, Lock
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IntegrationItem, IntegrationCategory } from "@/types/integrations"

const ICON_MAP: Record<string, any> = {
  MapPin,
  MessageSquare,
  Database,
  FileCheck,
  Cpu,
  Sparkles,
  Flame,
  Mail,
  Share2,
  Activity,
  Truck,
  DollarSign
}

interface IntegrationCatalogProps {
  isOpen: boolean
  onClose: () => void
  catalog: IntegrationItem[]
  onInstall: (item: IntegrationItem) => void
}

export function IntegrationCatalog({ isOpen, onClose, catalog, onInstall }: IntegrationCatalogProps) {
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Todas")

  const categories = [
    "Todas",
    "Instaladas",
    "Não instaladas",
    "Comunicação",
    "APIs",
    "Banco de Dados",
    "Fiscal",
    "IA",
    "Mapas"
  ]

  const filteredItems = React.useMemo(() => {
    return catalog.filter((item) => {
      // Category filter
      if (selectedCategory === "Instaladas" && !item.installed) return false
      if (selectedCategory === "Não instaladas" && item.installed) return false
      if (
        selectedCategory !== "Todas" &&
        selectedCategory !== "Instaladas" &&
        selectedCategory !== "Não instaladas" &&
        item.category !== selectedCategory
      ) {
        return false
      }

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase()
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [catalog, selectedCategory, search])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-[900px] w-full p-0 flex flex-col h-full bg-background">
        {/* CABEÇALHO DO CATALOG SHEET (900px) */}
        <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">Catálogo de Integrações FrotaOne</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Explore o Marketplace interno e conecte novos serviços externos ao ERP.
              </SheetDescription>
            </div>
          </div>

          {/* CAMPO DE BUSCA E FILTROS */}
          <div className="pt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar integração por nome, categoria ou função..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9 bg-background"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </SheetHeader>

        {/* LISTA DO CATÁLOGO (GRID 2 COLUNAS) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {filteredItems.length} Módulos Encontrados
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed rounded-2xl space-y-2">
              <Search className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold">Nenhuma integração encontrada</p>
              <p className="text-xs text-muted-foreground">Tente alterar os termos da busca ou mudar a categoria selecionada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const IconComp = ICON_MAP[item.iconName] || Share2
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-card border rounded-2xl space-y-3 flex flex-col justify-between hover:border-blue-500/50 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            <IconComp className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-foreground">{item.name}</div>
                            <span className="text-[10px] font-semibold text-muted-foreground">{item.category} • {item.version}</span>
                          </div>
                        </div>

                        {item.installed ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                            Instalada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">
                            Disponível
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.supportedFeatures.slice(0, 3).map((feat, idx) => (
                          <span key={idx} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Latência Média ~{item.latencyMs}ms
                      </span>

                      {item.installed ? (
                        <Button size="sm" variant="secondary" disabled className="h-8 text-xs gap-1">
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Instalada
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onInstall(item)}
                          className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                          <Plus className="h-3.5 w-3.5" /> Instalar Integração
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
