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
import { Plus, Trash2, ClipboardCheck, Sparkles, AlertTriangle, ShieldCheck, FileText } from "lucide-react"

interface ChecklistBuilderSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: Record<string, any>) => void
}

interface GroupItem {
  id: string
  groupName: string
  items: { description: string; responseType: string; isRequired: boolean; triggerOs: boolean }[]
}

export function ChecklistBuilderSheet({ isOpen, onClose, onSubmit }: ChecklistBuilderSheetProps) {
  const [form, setForm] = React.useState({
    name: "",
    category: "Operacional",
    description: "",
    isActive: true,
    isRequired: true,
    applicationTarget: "heavy_trucks",
    rejectionAction: "auto_os",
    notifyManager: true,
    notes: ""
  })

  const [groups, setGroups] = React.useState<GroupItem[]>([
    {
      id: "grp-1",
      groupName: "Motor & Níveis",
      items: [
        { description: "Nível do óleo lubrificante do motor", responseType: "conforme", isRequired: true, triggerOs: true },
        { description: "Nível de fluido de arrefecimento", responseType: "conforme", isRequired: true, triggerOs: true }
      ]
    },
    {
      id: "grp-2",
      groupName: "Pneus & Rodas",
      items: [
        { description: "Pressão e profundidade de sulco dos pneus", responseType: "conforme", isRequired: true, triggerOs: false }
      ]
    }
  ])

  const [newGroupName, setNewGroupName] = React.useState("")
  const [newItemDescription, setNewItemDescription] = React.useState("")
  const [selectedGroupIdx, setSelectedGroupIdx] = React.useState(0)

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      setGroups([
        ...groups,
        { id: `grp-${Date.now()}`, groupName: newGroupName.trim(), items: [] }
      ])
      setNewGroupName("")
    }
  }

  const handleAddItemToGroup = () => {
    if (newItemDescription.trim() && groups[selectedGroupIdx]) {
      const updated = [...groups]
      updated[selectedGroupIdx].items.push({
        description: newItemDescription.trim(),
        responseType: "conforme",
        isRequired: true,
        triggerOs: true
      })
      setGroups(updated)
      setNewItemDescription("")
    }
  }

  const handleRemoveItem = (groupIdx: number, itemIdx: number) => {
    const updated = [...groups]
    updated[groupIdx].items.splice(itemIdx, 1)
    setGroups(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, groups })
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[820px] w-full overflow-y-auto custom-scrollbar p-6 space-y-6">
        <SheetHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Novo Modelo de Checklist
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Crie modelos de vistoria, defina grupos de itens e configure o Motor de Regras Automatizado.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEÇÃO 1: INFORMAÇÕES DO MODELO */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">1</span>
              Informações do Modelo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <Label className="text-xs">Nome do Modelo *</Label>
                <Input
                  required
                  placeholder="Ex: Inspeção Diária Pré-Viagem (Rodoviário)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Categoria</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="Operacional">Operacional Pré/Pós Viagem</option>
                  <option value="Segurança">Segurança & EPI</option>
                  <option value="Equipamentos">Equipamentos & Carroceria</option>
                  <option value="Qualidade">Auditoria de Qualidade</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Descrição do Modelo</Label>
              <Textarea
                placeholder="Descreva o propósito da inspeção e as instruções para o motorista..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="text-xs mt-1 min-h-[60px]"
              />
            </div>

            <div className="flex items-center gap-4 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: !!c })} />
                <span className="font-semibold">Modelo Ativo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.isRequired} onCheckedChange={(c) => setForm({ ...form, isRequired: !!c })} />
                <span className="font-semibold text-primary">Inspeção Obrigatória Pré-Viagem</span>
              </label>
            </div>
          </div>

          {/* SEÇÃO 2: APLICAÇÃO */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">2</span>
              Aplicação & Escopo
            </h3>

            <div className="text-xs">
              <Label className="text-xs">Frota / Categoria Alvo</Label>
              <select
                value={form.applicationTarget}
                onChange={(e) => setForm({ ...form, applicationTarget: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
              >
                <option value="heavy_trucks">Caminhões Pesados / Cavalos Mecânicos</option>
                <option value="light_trucks">Utilitários Leves / VUCs</option>
                <option value="trailers">Semirreboques & Baús Sider</option>
                <option value="all">Toda a Frota da Empresa</option>
              </select>
            </div>
          </div>

          {/* SEÇÃO 3: BUILDER DINÂMICO DE GRUPOS E ITENS */}
          <div className="space-y-4 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">3</span>
              Itens da Inspeção (Builder Dinâmico)
            </h3>

            {/* Add Group */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nome do Novo Grupo de Itens (Ex: Freios)..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="text-xs flex-1"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddGroup} className="text-xs gap-1">
                <Plus className="h-3.5 w-3.5" /> Criar Grupo
              </Button>
            </div>

            {/* Add Item to Selected Group */}
            <div className="p-3 rounded-xl bg-muted/20 border space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-[11px]">Grupo Destino</Label>
                  <select
                    value={selectedGroupIdx}
                    onChange={(e) => setSelectedGroupIdx(Number(e.target.value))}
                    className="w-full h-8 rounded border bg-background px-2 text-xs mt-1"
                  >
                    {groups.map((g, i) => (
                      <option key={g.id} value={i}>{g.groupName}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px]">Descrição do Item de Inspeção</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="Ex: Nível de fluido de freio pneumático..."
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      className="text-xs h-8 flex-1"
                    />
                    <Button type="button" size="sm" onClick={handleAddItemToGroup} className="h-8 text-xs gap-1">
                      <Plus className="h-3.5 w-3.5" /> Adicionar Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Render Groups and Items */}
            <div className="space-y-3">
              {groups.map((grp, gIdx) => (
                <div key={grp.id} className="p-3 border rounded-xl bg-muted/10 space-y-2">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-bold text-xs text-primary">{grp.groupName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{grp.items.length} Itens</span>
                  </div>

                  <div className="space-y-1.5">
                    {grp.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center justify-between p-2 rounded-lg bg-card border text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] font-mono">Conforme/Não Conforme</Badge>
                          <span className="font-semibold text-foreground">{item.description}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(gIdx, iIdx)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEÇÃO 4: AUTOMAÇÃO / MOTOR DE REGRAS (DIFERENCIAL FROTAONE) */}
          <div className="space-y-3 p-4 bg-card border border-blue-500/30 rounded-2xl bg-blue-500/5">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
              <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Motor de Regras de Checklist (Diferencial FrotaOne)
              </h3>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">Automação IA</Badge>
            </div>

            <div className="text-xs space-y-2 pt-1">
              <Label className="text-xs">Ação Padrão ao Detectar Reprovação de Item</Label>
              <select
                value={form.rejectionAction}
                onChange={(e) => setForm({ ...form, rejectionAction: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="auto_os">Gerar Ordem de Serviço (OS) Automaticamente</option>
                <option value="alert_only">Criar Alerta e Ocorrência sem OS</option>
                <option value="block_vehicle">Bloquear Veículo para Viagens e Gerar OS Urgente</option>
                <option value="approval_required">Solicitar Aprovação do Gestor da Unidade</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer pt-1">
              <Checkbox checked={form.notifyManager} onCheckedChange={(c) => setForm({ ...form, notifyManager: !!c })} />
              <span className="font-semibold text-foreground">Notificar gestor da unidade via App/E-mail ao reprovar itens críticos</span>
            </label>
          </div>

          {/* SEÇÃO 5: ANEXOS */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">5</span>
              Anexos & Manuais
            </h3>
            <UploadArea accept=".pdf,.png,.jpg" hint="Manuais técnicos ou instruções em PDF/Imagem até 10MB" />
          </div>

          {/* SEÇÃO 6: OBSERVAÇÕES */}
          <div className="space-y-3 p-4 bg-card border rounded-2xl">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] flex items-center justify-center font-bold">6</span>
              Observações
            </h3>
            <Textarea
              placeholder="Observações administrativas do modelo..."
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
              Salvar Modelo de Checklist
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
