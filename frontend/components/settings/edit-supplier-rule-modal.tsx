"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SupplierRuleItem } from "@/types/settings"
import { Star, Store } from "lucide-react"

interface EditSupplierRuleModalProps {
  isOpen: boolean
  onClose: () => void
  ruleToEdit: SupplierRuleItem | null
  onSave: (rule: SupplierRuleItem) => void
}

export function EditSupplierRuleModal({
  isOpen,
  onClose,
  ruleToEdit,
  onSave,
}: EditSupplierRuleModalProps) {
  const [category, setCategory] = React.useState("Postos de Combustível")
  const [specialty, setSpecialty] = React.useState("")
  const [minRating, setMinRating] = React.useState("4.0")
  const [requiresHomologation, setRequiresHomologation] = React.useState(true)

  React.useEffect(() => {
    if (ruleToEdit) {
      setCategory(ruleToEdit.category || "Postos de Combustível")
      setSpecialty(ruleToEdit.specialty || "")
      setMinRating(String(ruleToEdit.minRating || 4.0))
      setRequiresHomologation(ruleToEdit.requiresHomologation ?? true)
    } else {
      setCategory("Postos de Combustível")
      setSpecialty("")
      setMinRating("4.0")
      setRequiresHomologation(true)
    }
  }, [ruleToEdit, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!specialty.trim()) return

    const newRule: SupplierRuleItem = {
      id: ruleToEdit ? ruleToEdit.id : `sr-${Date.now()}`,
      category,
      specialty: specialty.trim(),
      minRating: Number(parseFloat(minRating).toFixed(1)),
      requiresHomologation,
    }

    onSave(newRule)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl bg-card border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Store className="w-5 h-5 text-blue-600" />
            {ruleToEdit ? "Editar Regra de Homologação" : "Nova Regra de Homologação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Categoria */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Categoria do Fornecedor</Label>
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="text-xs h-9"
            >
              <option value="Postos de Combustível">Postos de Combustível</option>
              <option value="Oficinas Mecânicas">Oficinas Mecânicas</option>
              <option value="Lojas de Pneus & Recapagem">Lojas de Pneus & Recapagem</option>
              <option value="Funilaria & Pintura">Funilaria & Pintura</option>
              <option value="Auto Elétrica & Baterias">Auto Elétrica & Baterias</option>
              <option value="Peças & Autopeças">Peças & Autopeças</option>
              <option value="Guincho & Socorro 24h">Guincho & Socorro 24h</option>
            </Select>
          </div>

          {/* Especialidade / Descrição */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Especialidade / Descrição da Regra</Label>
            <Input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Ex: Abastecimento Diesel S10 / Arla"
              className="text-xs h-9"
              required
            />
          </div>

          {/* Rating Mínimo Exigido */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Rating Mínimo Exigido</span>
              <span className="text-amber-500 font-bold flex items-center gap-1">
                {minRating} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </span>
            </Label>
            <Select 
              value={minRating} 
              onChange={(e) => setMinRating(e.target.value)} 
              className="text-xs h-9"
            >
              <option value="5.0">5.0 ⭐ (Excelente / Certificação Máxima)</option>
              <option value="4.5">4.5 ⭐ (Alto Padrão / Recomendado)</option>
              <option value="4.2">4.2 ⭐ (Qualidade Aprovada)</option>
              <option value="4.0">4.0 ⭐ (Aceitável)</option>
              <option value="3.5">3.5 ⭐ (Mínimo Básico)</option>
            </Select>
          </div>

          {/* Homologação Obrigatória vs Simplificada */}
          <div className="pt-2 flex items-center gap-2">
            <Checkbox
              id="homologation"
              checked={requiresHomologation}
              onCheckedChange={(c) => setRequiresHomologation(!!c)}
            />
            <label htmlFor="homologation" className="text-xs font-medium text-foreground cursor-pointer select-none">
              Exigir Homologação Obrigatória (Análise de documentos & certidões)
            </label>
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 text-xs">
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">
              {ruleToEdit ? "Salvar Alterações" : "Criar Regra"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
