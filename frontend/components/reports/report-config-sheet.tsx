"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FilterBuilder } from "@/components/ui/filter-builder"
import {
  ReportConfig,
  ReportCategory,
  ReportType,
  VisualizationMode,
  ExportFormat,
  GroupByField,
  SchedulePeriod,
  ScheduleDestination
} from "@/types/reports"
import {
  Settings,
  Filter,
  Columns,
  ArrowUpDown,
  Layers,
  Calculator,
  Layout,
  Download,
  Calendar,
  Share2,
  Play,
  Save,
  CheckCircle2
} from "lucide-react"

interface ReportConfigSheetProps {
  isOpen: boolean
  onClose: () => void
  report: ReportConfig | null
  onSaveAndExecute: (report: ReportConfig) => void
  onSaveConfig: (report: ReportConfig) => void
}

export function ReportConfigSheet({
  isOpen,
  onClose,
  report: initialReport,
  onSaveAndExecute,
  onSaveConfig
}: ReportConfigSheetProps) {
  const [report, setReport] = React.useState<ReportConfig | null>(initialReport)
  const [activeTab, setActiveTab] = React.useState("geral")

  React.useEffect(() => {
    setReport(initialReport)
  }, [initialReport])

  if (!report) return null

  const updateField = (field: keyof ReportConfig, value: any) => {
    setReport((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const toggleColumn = (key: string) => {
    setReport((prev) => {
      if (!prev) return prev
      const updated = prev.columns.map((col) =>
        col.key === key ? { ...col, selected: !col.selected } : col
      )
      return { ...prev, columns: updated }
    })
  }

  const updateTotals = (field: keyof ReportConfig["totals"], checked: boolean) => {
    setReport((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        totals: { ...prev.totals, [field]: checked }
      }
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col h-full p-0 gap-0">
        {/* HEADER */}
        <SheetHeader className="p-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Settings className="h-3.5 w-3.5 text-primary" />
            Configuração de Relatório
          </div>
          <SheetTitle className="text-lg font-bold text-foreground">
            {report.id.startsWith("rep-new") ? "Criar Novo Relatório" : `Personalizar: ${report.name}`}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Ajuste os parâmetros de filtros, colunas, agrupamento, totalização, visualização e agendamentos.
          </SheetDescription>
        </SheetHeader>

        {/* TABS & FORM BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="geral" className="text-xs gap-1 py-1">
                <Settings className="h-3 w-3" /> Geral
              </TabsTrigger>
              <TabsTrigger value="filtros" className="text-xs gap-1 py-1">
                <Filter className="h-3 w-3" /> Filtros
              </TabsTrigger>
              <TabsTrigger value="colunas" className="text-xs gap-1 py-1">
                <Columns className="h-3 w-3" /> Colunas
              </TabsTrigger>
              <TabsTrigger value="exibicao" className="text-xs gap-1 py-1">
                <Layout className="h-3 w-3" /> Exibição
              </TabsTrigger>
              <TabsTrigger value="agendamento" className="text-xs gap-1 py-1">
                <Calendar className="h-3 w-3" /> Agendar
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: GERAL */}
            <TabsContent value="geral" className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Categoria
                  </Label>
                  <select
                    value={report.category}
                    onChange={(e) => updateField("category", e.target.value as ReportCategory)}
                    className="w-full px-3 py-1.5 text-xs border border-border bg-background rounded-lg"
                  >
                    <option value="frota">Frota</option>
                    <option value="motoristas">Motoristas</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="documentacao">Documentação</option>
                    <option value="fornecedores">Fornecedores</option>
                    <option value="checklists">Checklists</option>
                    <option value="executivo">Dashboard Executivo</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Tipo do Relatório
                  </Label>
                  <select
                    value={report.type}
                    onChange={(e) => updateField("type", e.target.value as ReportType)}
                    className="w-full px-3 py-1.5 text-xs border border-border bg-background rounded-lg"
                  >
                    <option value="operacional">Operacional</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="gerencial">Gerencial</option>
                    <option value="executivo">Executivo</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Nome do Relatório *
                </Label>
                <Input
                  value={report.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="text-xs"
                  placeholder="Ex: Situação Geral da Frota 2026"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Descrição
                </Label>
                <Textarea
                  value={report.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="text-xs h-20"
                  placeholder="Descreva o objetivo e utilidade deste relatório para a gestão..."
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <Checkbox
                    checked={report.isFavorite}
                    onCheckedChange={(c) => updateField("isFavorite", !!c)}
                  />
                  <span>Adicionar aos Favoritos</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <Checkbox
                    checked={report.isShared}
                    onCheckedChange={(c) => updateField("isShared", !!c)}
                  />
                  <span>Compartilhar com a equipe</span>
                </label>
              </div>
            </TabsContent>

            {/* TAB 2: FILTROS DINÂMICOS */}
            <TabsContent value="filtros" className="pt-3">
              <FilterBuilder
                category={report.category}
                filters={report.filters}
                onChange={(f) => updateField("filters", f)}
              />
            </TabsContent>

            {/* TAB 3: COLUNAS */}
            <TabsContent value="colunas" className="space-y-4 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Selecione as Colunas Exibidas
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({report.columns.filter((c) => c.selected).length} selecionadas)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-muted/20 p-3 rounded-xl border border-border/50 max-h-60 overflow-y-auto">
                {report.columns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/40 cursor-pointer"
                  >
                    <Checkbox
                      checked={col.selected}
                      onCheckedChange={() => toggleColumn(col.key)}
                    />
                    <span className="font-medium text-foreground">{col.label}</span>
                  </label>
                ))}
              </div>
            </TabsContent>

            {/* TAB 4: EXIBIÇÃO, AGRUPAMENTO & TOTALIZAÇÃO */}
            <TabsContent value="exibicao" className="space-y-4 pt-3">
              <div>
                <Label className="text-xs font-bold text-foreground mb-1 block">
                  Modo de Visualização
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "tabela", label: "Tabela", icon: "📊" },
                    { id: "grafico", label: "Gráfico", icon: "📈" },
                    { id: "tabela_grafico", label: "Tabela + Gráfico", icon: "📑" },
                    { id: "cards", label: "Cards", icon: "🎴" },
                    { id: "dashboard", label: "Dashboard", icon: "🖥️" }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateField("visualization", mode.id as VisualizationMode)}
                      className={`p-2 text-xs rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                        report.visualization === mode.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      <span>{mode.icon}</span>
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-xs font-bold text-foreground mb-1 block">
                    Agrupar Dados Por
                  </Label>
                  <select
                    value={report.groupBy}
                    onChange={(e) => updateField("groupBy", e.target.value as GroupByField)}
                    className="w-full px-3 py-1.5 text-xs border border-border bg-background rounded-lg"
                  >
                    <option value="none">Nenhum Agrupamento</option>
                    <option value="veiculo">Veículo</option>
                    <option value="motorista">Motorista</option>
                    <option value="fornecedor">Fornecedor</option>
                    <option value="categoria">Categoria</option>
                    <option value="unidade">Unidade de Negócio</option>
                    <option value="status">Status</option>
                    <option value="mes">Mês</option>
                    <option value="ano">Ano</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-foreground mb-1 block">
                    Ordenação Padrão
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={report.sort.field}
                      onChange={(e) =>
                        updateField("sort", { ...report.sort, field: e.target.value })
                      }
                      className="w-full px-2 py-1.5 text-xs border border-border bg-background rounded-lg"
                    >
                      {report.columns.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        updateField("sort", {
                          ...report.sort,
                          direction: report.sort.direction === "asc" ? "desc" : "asc"
                        })
                      }
                      className="px-2.5 py-1 text-xs border border-border rounded-lg bg-card hover:bg-muted font-mono font-bold"
                    >
                      {report.sort.direction.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>

              {/* Totalizações */}
              <div className="pt-2">
                <Label className="text-xs font-bold text-foreground mb-1.5 block">
                  Totalização e Métricas de Rodapé
                </Label>
                <div className="grid grid-cols-3 gap-2 bg-muted/20 p-3 rounded-xl border border-border/50">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={report.totals.total}
                      onCheckedChange={(c) => updateTotals("total", !!c)}
                    />
                    <span>Mostrar Total Geral</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={report.totals.subtotal}
                      onCheckedChange={(c) => updateTotals("subtotal", !!c)}
                    />
                    <span>Mostrar Subtotais</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={report.totals.avg}
                      onCheckedChange={(c) => updateTotals("avg", !!c)}
                    />
                    <span>Calcular Média</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={report.totals.max}
                      onCheckedChange={(c) => updateTotals("max", !!c)}
                    />
                    <span>Maior Valor</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={report.totals.min}
                      onCheckedChange={(c) => updateTotals("min", !!c)}
                    />
                    <span>Menor Valor</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={report.totals.count}
                      onCheckedChange={(c) => updateTotals("count", !!c)}
                    />
                    <span>Contagem de Itens</span>
                  </label>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: AGENDAMENTO E EXPORTAÇÃO */}
            <TabsContent value="agendamento" className="space-y-4 pt-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground">
                    Executar Automaticamente (Agendamento)
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Envio periódico deste relatório via E-mail ou download automatizado.
                  </div>
                </div>
                <Checkbox
                  checked={report.schedule.enabled}
                  onCheckedChange={(c) =>
                    updateField("schedule", { ...report.schedule, enabled: !!c })
                  }
                />
              </div>

              {report.schedule.enabled && (
                <div className="space-y-3 p-3 bg-card border rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Periodicidade
                      </Label>
                      <select
                        value={report.schedule.periodicity}
                        onChange={(e) =>
                          updateField("schedule", {
                            ...report.schedule,
                            periodicity: e.target.value as SchedulePeriod
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs border border-border bg-background rounded-lg"
                      >
                        <option value="diaria">Diária</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensal">Mensal</option>
                        <option value="anual">Anual</option>
                        <option value="personalizada">Personalizada</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Canal de Destino
                      </Label>
                      <select
                        value={report.schedule.destination}
                        onChange={(e) =>
                          updateField("schedule", {
                            ...report.schedule,
                            destination: e.target.value as ScheduleDestination
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs border border-border bg-background rounded-lg"
                      >
                        <option value="email">E-mail</option>
                        <option value="download">Download Direto</option>
                        <option value="gdrive">Google Drive (Em Breve)</option>
                        <option value="onedrive">OneDrive (Em Breve)</option>
                        <option value="api">API Webhook (Em Breve)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Formato da Exportação
                    </Label>
                    <select
                      value={report.exportFormat}
                      onChange={(e) => updateField("exportFormat", e.target.value as ExportFormat)}
                      className="w-full px-3 py-1.5 text-xs border border-border bg-background rounded-lg"
                    >
                      <option value="pdf">PDF (Documento Executivo)</option>
                      <option value="xlsx">Excel (.xlsx)</option>
                      <option value="csv">CSV (Texto Separado por Vírgula)</option>
                      <option value="print">Impressão Direta</option>
                    </select>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* FOOTER ACTIONS */}
        <SheetFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-2">
          <SheetClose asChild>
            <Button variant="outline" size="sm" className="text-xs h-9">
              Cancelar
            </Button>
          </SheetClose>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-9 gap-1.5 text-foreground"
            onClick={() => onSaveConfig(report)}
          >
            <Save className="h-3.5 w-3.5" />
            Salvar Configuração
          </Button>

          <Button
            size="sm"
            className="text-xs h-9 gap-1.5 bg-primary text-primary-foreground font-semibold"
            onClick={() => onSaveAndExecute(report)}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Gerar & Executar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
