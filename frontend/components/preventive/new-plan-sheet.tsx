"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { UploadArea } from "@/components/ui/upload-area"
import { Plus, Trash2, Wrench, Shield, Clock, FileText, CheckCircle2, Search, ChevronDown } from "lucide-react"

import { vehicleService } from "@/services/api"

import { PreventivePlanItem } from "@/types/preventive"

interface NewPlanSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: Record<string, any>) => void
  editData?: PreventivePlanItem | null
}

export function NewPlanSheet({ isOpen, onClose, onSubmit, editData }: NewPlanSheetProps) {
  const [vehicles, setVehicles] = React.useState<any[]>([])

  const [form, setForm] = React.useState({
    id: "",
    code: "",
    name: "",
    category: "Motor & Lubrificação",
    description: "",
    isActive: true,
    applicationType: "specific_vehicle",
    vehicleModel: "",
    unit: "Matriz",
    triggerType: "km",
    intervalKm: "10000",
    intervalDays: "180",
    toleranceKm: "500",
    toleranceDays: "15",
    autoGenerateOs: true,
    daysAhead: "15",
    osPriority: "Alta",
    defaultWorkshop: "Oficina Padrão",
    defaultResponsible: "Gestor de Manutenção",
    notes: ""
  })

  const [plannedServices, setPlannedServices] = React.useState<string[]>([
    "Substituição de óleo motor 15W40",
    "Troca do elemento filtrante de óleo",
    "Troca do filtro de combustível"
  ])

  // Populate form when editData is passed
  React.useEffect(() => {
    if (editData) {
      setForm({
        id: editData.id || "",
        code: editData.code || "",
        name: editData.name || "",
        category: editData.category || "Motor & Lubrificação",
        description: editData.description || "",
        isActive: editData.status === "Ativo",
        applicationType: "specific_vehicle",
        vehicleModel: `${editData.vehicleModel || ''} (${editData.plate || ''})`.trim(),
        unit: editData.unit || "Matriz",
        triggerType: editData.triggerType || "km",
        intervalKm: String(editData.intervalKm || 10000),
        intervalDays: String(editData.intervalDays || 180),
        toleranceKm: String(editData.toleranceKm || 500),
        toleranceDays: String(editData.toleranceDays || 15),
        autoGenerateOs: editData.autoGenerateOs ?? true,
        daysAhead: "15",
        osPriority: editData.osPriority || "Alta",
        defaultWorkshop: editData.defaultWorkshop || "Oficina Padrão",
        defaultResponsible: editData.defaultResponsible || "Gestor de Manutenção",
        notes: editData.notes || ""
      })
      if (editData.plannedServices && editData.plannedServices.length > 0) {
        setPlannedServices(editData.plannedServices)
      }
      setVehicleSearch(`${editData.vehicleModel || ''} (${editData.plate || ''})`.trim())
    } else {
      setForm({
        id: "",
        code: `PLN-${Math.floor(100 + Math.random() * 900)}`,
        name: "",
        category: "Motor & Lubrificação",
        description: "",
        isActive: true,
        applicationType: "specific_vehicle",
        vehicleModel: "",
        unit: "Matriz",
        triggerType: "km",
        intervalKm: "10000",
        intervalDays: "180",
        toleranceKm: "500",
        toleranceDays: "15",
        autoGenerateOs: true,
        daysAhead: "15",
        osPriority: "Alta",
        defaultWorkshop: "Oficina Padrão",
        defaultResponsible: "Gestor de Manutenção",
        notes: ""
      })
    }
  }, [editData, isOpen])

  React.useEffect(() => {
    vehicleService.getAll().then(res => {
      const vList = res.data?.data || []
      const mapped = vList.map((v: any) => ({
        id: v.id,
        label: `${v.brand || ''} ${v.model || ''} (${v.plate})`.trim(),
        model: `${v.brand || ''} ${v.model || ''}`.trim(),
        plate: v.plate,
        unit: v.unit || "Matriz"
      }))
      setVehicles(mapped)
      if (mapped.length > 0 && !editData) {
        setVehicleSearch(mapped[0].label)
        setForm(prev => ({ ...prev, vehicleModel: mapped[0].label, unit: mapped[0].unit }))
      }
    }).catch(console.error)
  }, [editData])

  const [vehicleSearch, setVehicleSearch] = React.useState("")
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = React.useState(false)

  const filteredVehicles = React.useMemo(() => {
    if (!vehicleSearch) return vehicles
    const q = vehicleSearch.toLowerCase()
    return vehicles.filter(
      (v) =>
        v.label.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.unit.toLowerCase().includes(q)
    )
  }, [vehicleSearch, vehicles])

  const [newServiceItem, setNewServiceItem] = React.useState("")

  const handleAddServiceItem = () => {
    if (newServiceItem.trim()) {
      setPlannedServices([...plannedServices, newServiceItem.trim()])
      setNewServiceItem("")
    }
  }

  const handleRemoveServiceItem = (idx: number) => {
    setPlannedServices(plannedServices.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      plannedServices
    })
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[820px] w-full overflow-y-auto custom-scrollbar p-6 space-y-6">
        <SheetHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                {editData ? "Editar Plano Preventivo" : "Novo Plano Preventivo"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Configure regras de planejamento, parâmetros de disparo e automação de Ordens de Serviço.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">1</span>
              Informações do Plano
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <Label className="text-xs">Código do Plano *</Label>
                <Input
                  required
                  placeholder="Ex: PLN-101 ou PREV-OIL-01"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="text-xs mt-1 font-mono font-bold"
                />
              </div>

              <div>
                <Label className="text-xs">Nome do Plano *</Label>
                <Input
                  required
                  placeholder="Ex: Troca de Óleo & Filtros (10.000 KM)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Categoria de Manutenção</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="Motor & Lubrificação">Motor & Lubrificação</option>
                  <option value="Sistema de Freios">Sistema de Freios</option>
                  <option value="Pneus & Geometria">Pneus & Geometria</option>
                  <option value="Suspensão & Chassi">Suspensão & Chassi</option>
                  <option value="Sistema Elétrico & Baterias">Sistema Elétrico & Baterias</option>
                  <option value="Cabine & Conforto">Cabine & Conforto</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Descrição do Plano</Label>
              <Textarea
                placeholder="Descreva o objetivo e os detalhes do planejamento preventivo..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="text-xs mt-1 min-h-[60px]"
              />
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer pt-1">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(c) => setForm({ ...form, isActive: !!c })}
              />
              <span className="font-semibold">Manter este plano ativo imediatamente após criação</span>
            </label>
          </div>

          {/* SEÇÃO 2: APLICAÇÃO EM FROTA */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">2</span>
              Aplicação & Escopo do Plano
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <Label className="text-xs">Tipo de Aplicação</Label>
                <select
                  value={form.applicationType}
                  onChange={(e) => setForm({ ...form, applicationType: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="specific_vehicle">Veículo Específico</option>
                  <option value="fleet_group">Grupo de Veículos / Frota</option>
                  <option value="category">Toda a Categoria</option>
                  <option value="model">Por Modelo Específico</option>
                </select>
              </div>

              {form.applicationType === "specific_vehicle" ? (
                <div className="relative">
                  <Label className="text-xs font-bold">Veículo Selecionado (Busca na Frota) *</Label>
                  <div className="relative mt-1">
                    <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Digite para buscar por modelo, placa ou unidade..."
                      value={vehicleSearch}
                      onChange={(e) => {
                        setVehicleSearch(e.target.value)
                        setForm({ ...form, vehicleModel: e.target.value })
                        setIsVehicleDropdownOpen(true)
                      }}
                      onFocus={() => setIsVehicleDropdownOpen(true)}
                      className="text-xs pl-9 pr-8 bg-background"
                    />
                    <ChevronDown className="h-4 w-4 absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Dropdown Lista de Veículos Cadastrados */}
                  {isVehicleDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border/80 rounded-xl shadow-2xl z-50 max-h-52 overflow-y-auto custom-scrollbar p-1">
                      {filteredVehicles.length > 0 ? (
                        filteredVehicles.map((v) => (
                          <div
                            key={v.id}
                            onClick={() => {
                              setForm({ ...form, vehicleModel: v.label, unit: v.unit })
                              setVehicleSearch(v.label)
                              setIsVehicleDropdownOpen(false)
                            }}
                            className="p-2.5 hover:bg-primary/10 hover:text-primary rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors border-b border-border/30 last:border-0"
                          >
                            <div>
                              <div className="font-bold text-foreground">{v.label}</div>
                              <div className="text-[10px] text-muted-foreground">Unidade: {v.unit}</div>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono font-bold bg-muted/40">
                              {v.plate}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          Nenhum veículo encontrado no cadastro
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Label className="text-xs font-bold">Grupo / Modelo / Categoria Selecionada</Label>
                  <Input
                    value={form.vehicleModel}
                    onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                    placeholder="Ex: Cavalos Mecânicos 6x4"
                    className="text-xs mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SEÇÃO 3: CRITÉRIOS DE DISPARO */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">3</span>
              Critérios de Disparo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <Label className="text-xs">Critério Principal</Label>
                <select
                  value={form.triggerType}
                  onChange={(e) => setForm({ ...form, triggerType: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="km">Por Quilometragem (KM)</option>
                  <option value="time">Por Tempo (Dias)</option>
                  <option value="mixed_or">Misto (KM OU Tempo - O que vencer primeiro)</option>
                  <option value="mixed_and">Misto (KM E Tempo - Quando ambos forem atingidos)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Intervalo em KM</Label>
                <Input
                  type="number"
                  placeholder="Ex: 10000"
                  value={form.intervalKm}
                  onChange={(e) => setForm({ ...form, intervalKm: e.target.value })}
                  className="text-xs mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <Label className="text-xs">Intervalo em Dias</Label>
                <Input
                  type="number"
                  placeholder="Ex: 180"
                  value={form.intervalDays}
                  onChange={(e) => setForm({ ...form, intervalDays: e.target.value })}
                  className="text-xs mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs">Margem de Tolerância (KM)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 500"
                  value={form.toleranceKm}
                  onChange={(e) => setForm({ ...form, toleranceKm: e.target.value })}
                  className="text-xs mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs">Margem de Tolerância (Dias)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 15"
                  value={form.toleranceDays}
                  onChange={(e) => setForm({ ...form, toleranceDays: e.target.value })}
                  className="text-xs mt-1 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: EXECUÇÃO & AUTOMAÇÃO */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">4</span>
              Execução & Automação de Ordem de Serviço
            </h3>

            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={form.autoGenerateOs}
                onCheckedChange={(c) => setForm({ ...form, autoGenerateOs: !!c })}
              />
              <span className="font-bold text-primary">Gerar Ordem de Serviço (OS) automaticamente ao atingir o vencimento</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <Label className="text-xs">Antecedência para Alerta (Dias)</Label>
                <Input
                  type="number"
                  value={form.daysAhead}
                  onChange={(e) => setForm({ ...form, daysAhead: e.target.value })}
                  className="text-xs mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs">Prioridade da OS Gerada</Label>
                <select
                  value={form.osPriority}
                  onChange={(e) => setForm({ ...form, osPriority: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Oficina Padrão (Opcional)</Label>
                <Input
                  value={form.defaultWorkshop}
                  onChange={(e) => setForm({ ...form, defaultWorkshop: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 5: ITENS PREVISTOS */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">5</span>
              Lista de Serviços Previstos (Copiados para a OS)
            </h3>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Digite um serviço ou inspeção e clique em Adicionar..."
                value={newServiceItem}
                onChange={(e) => setNewServiceItem(e.target.value)}
                className="text-xs flex-1"
              />
              <Button type="button" size="sm" onClick={handleAddServiceItem} className="text-xs gap-1">
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>

            <div className="space-y-1.5 pt-1">
              {plannedServices.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs border">
                  <span className="font-semibold text-foreground">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveServiceItem(idx)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SEÇÃO 6: DOCUMENTOS */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">6</span>
              Documentos & Anexos
            </h3>
            <UploadArea accept=".pdf,.doc,.docx,.png,.jpg" hint="Manuais, procedimentos POP ou checklists em PDF/Imagem até 10MB" />
          </div>

          {/* SEÇÃO 7: OBSERVAÇÕES */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">7</span>
              Observações Adicionais
            </h3>
            <Textarea
              placeholder="Digite orientações técnicas adicionais para o mecânico ou gestor..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="text-xs min-h-[60px]"
            />
          </div>

          <SheetFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9">
              Cancelar
            </Button>
            <Button type="submit" className="text-xs h-9 bg-primary text-primary-foreground font-semibold">
              Salvar Plano Preventivo
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
