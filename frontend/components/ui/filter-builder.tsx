"use client"

import * as React from "react"
import { Filter, Calendar, DollarSign, Truck, User, Wrench, Building2, Store } from "lucide-react"

import { ReportCategory, ReportFilterConfig } from "@/types/reports"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface FilterBuilderProps {
  category: ReportCategory
  filters: ReportFilterConfig
  onChange: (filters: ReportFilterConfig) => void
}

export function FilterBuilder({ category, filters, onChange }: FilterBuilderProps) {
  const updateFilter = (key: keyof ReportFilterConfig, value: any) => {
    onChange({
      ...filters,
      [key]: value === "todos" || value === "" ? undefined : value
    })
  }

  return (
    <div className="space-y-4 bg-muted/20 p-3.5 rounded-xl border border-border/50">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Filter className="h-3.5 w-3.5 text-primary" />
          Filtros Dinâmicos do Relatório
        </div>
        <span className="text-[10px] text-muted-foreground italic">
          (Todos os filtros são opcionais)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* COMMON DATE RANGE FILTER */}
        <div>
          <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
            Data Início
          </Label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => updateFilter("startDate", e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
            Data Fim
          </Label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => updateFilter("endDate", e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* CATEGORY SPECIFIC FILTERS */}
        {(category === "frota" || category === "executivo") && (
          <>
            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Status do Veículo
              </Label>
              <select
                value={filters.status || "todos"}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
              >
                <option value="todos">Todos os status</option>
                <option value="Ativo">Ativo</option>
                <option value="Em Manutenção">Em Manutenção</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Unidade de Negócio
              </Label>
              <select
                value={filters.unitId || "todos"}
                onChange={(e) => updateFilter("unitId", e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
              >
                <option value="todos">Todas as Unidades</option>
                <option value="matriz-sp">Matriz - São Paulo</option>
                <option value="filial-rj">Filial - Rio de Janeiro</option>
                <option value="filial-mg">Filial - Minas Gerais</option>
                <option value="filial-pr">Filial - Paraná</option>
              </select>
            </div>
          </>
        )}

        {category === "manutencao" && (
          <>
            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Status da Ordens de Serviço
              </Label>
              <select
                value={filters.status || "todos"}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
              >
                <option value="todos">Todos os status</option>
                <option value="Aberto">Aberto</option>
                <option value="Em Execução">Em Execução</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Tipo de Manutenção
              </Label>
              <select
                value={filters.maintenanceType || "todos"}
                onChange={(e) => updateFilter("maintenanceType", e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
              >
                <option value="todos">Todos os tipos</option>
                <option value="Preventiva">Preventiva</option>
                <option value="Corretiva">Corretiva</option>
                <option value="Preditiva">Preditiva</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Oficina / Fornecedor
              </Label>
              <select
                value={filters.workshop || "todos"}
                onChange={(e) => updateFilter("workshop", e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
              >
                <option value="todos">Todas as Oficinas</option>
                <option value="Auto Truck SP">Auto Truck SP</option>
                <option value="Mecânica Diesel RJ">Mecânica Diesel RJ</option>
                <option value="Freios & Cia">Freios & Cia</option>
              </select>
            </div>
          </>
        )}

        {category === "financeiro" && (
          <>
            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Centro de Custo
              </Label>
              <select
                value={filters.costCenter || "todos"}
                onChange={(e) => updateFilter("costCenter", e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
              >
                <option value="todos">Todos os centros de custo</option>
                <option value="Operação SP">Operação SP</option>
                <option value="Operação RJ">Operação RJ</option>
                <option value="Logística Nacional">Logística Nacional</option>
                <option value="Administrativo">Administrativo</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Categoria de Despesa
              </Label>
              <select
                value={filters.expenseCategory || "todos"}
                onChange={(e) => updateFilter("expenseCategory", e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
              >
                <option value="todos">Todas as categorias</option>
                <option value="Combustível">Combustível</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Pedágios">Pedágios</option>
                <option value="Seguros & Taxas">Seguros & Taxas</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Valor Mínimo (R$)
              </Label>
              <Input
                type="number"
                placeholder="R$ 0,00"
                value={filters.minValue || ""}
                onChange={(e) => updateFilter("minValue", parseFloat(e.target.value) || undefined)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Valor Máximo (R$)
              </Label>
              <Input
                type="number"
                placeholder="R$ 100.000,00"
                value={filters.maxValue || ""}
                onChange={(e) => updateFilter("maxValue", parseFloat(e.target.value) || undefined)}
                className="h-8 text-xs"
              />
            </div>
          </>
        )}

        {category === "motoristas" && (
          <>
            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Categoria CNH
              </Label>
              <select
                value={filters.cnhCategory || "todos"}
                onChange={(e) => updateFilter("cnhCategory", e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
              >
                <option value="todos">Todas as categorias</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Status da CNH
              </Label>
              <select
                value={filters.cnhStatus || "todos"}
                onChange={(e) => updateFilter("cnhStatus", e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
              >
                <option value="todos">Todos os status</option>
                <option value="Regular">Regular</option>
                <option value="A Vencer">A Vencer (30 dias)</option>
                <option value="Vencido">Vencido</option>
              </select>
            </div>
          </>
        )}

        {category === "documentacao" && (
          <div>
            <Label className="text-[11px] font-medium text-muted-foreground mb-1 block">
              Tipo de Documento
            </Label>
            <select
              value={filters.docType || "todos"}
              onChange={(e) => updateFilter("docType", e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground"
            >
              <option value="todos">Todos os documentos</option>
              <option value="CRLV">CRLV</option>
              <option value="IPVA">IPVA</option>
              <option value="Seguro Frota">Seguro Frota</option>
              <option value="Cronotacógrafo">Aferição Cronotacógrafo</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
