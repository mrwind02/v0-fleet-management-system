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
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { XmlImportItem } from "@/types/settings"
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Fuel,
  Package,
  Wrench,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  ArrowRight,
  XCircle
} from "lucide-react"

interface FiscalConfirmSheetProps {
  isOpen: boolean
  onClose: () => void
  item: XmlImportItem | null
  onConfirmLaunch: (item: XmlImportItem, targetModule: string) => void
  onReject: (itemId: string) => void
}

export function FiscalConfirmSheet({
  isOpen,
  onClose,
  item,
  onConfirmLaunch,
  onReject
}: FiscalConfirmSheetProps) {
  const [selectedTargetModule, setSelectedTargetModule] = React.useState<string>("")
  const [isSupplierCreated, setIsSupplierCreated] = React.useState(false)

  React.useEffect(() => {
    if (item) {
      setSelectedTargetModule(item.suggestedModule)
      setIsSupplierCreated(false)
    }
  }, [item])

  if (!item) return null

  const formattedValue = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.totalValue)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col h-full p-0 gap-0">
        {/* HEADER */}
        <SheetHeader className="p-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Conferência & Lançamento Fiscal
          </div>
          <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>{item.docType} Nº {item.number}</span>
            <Badge variant="outline" className="text-xs font-mono bg-blue-500/10 text-blue-600 border-blue-500/20">
              {item.parsedCategory.toUpperCase()}
            </Badge>
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Valide a classificação inteligente e os itens antes de confirmar a gravação no ERP FrotaOne.
          </SheetDescription>
        </SheetHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SUPPLIER & HEADER INFO BOX */}
          <div className="p-3.5 bg-card border border-border/70 rounded-xl space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Fornecedor Emitente</span>
                <h4 className="text-sm font-bold text-foreground">{item.supplierName}</h4>
                <span className="text-xs font-mono text-muted-foreground">CNPJ: {item.supplierCnpj}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Valor Total NF</span>
                <div className="text-base font-extrabold text-foreground">{formattedValue}</div>
              </div>
            </div>

            {/* SUPPLIER AUTO-REGISTER SUGGESTION */}
            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>Status Cadastral:</span>
                {isSupplierCreated ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Cadastrado
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Não Encontrado na Base
                  </span>
                )}
              </div>

              {!isSupplierCreated && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSupplierCreated(true)}
                  className="h-7 text-xs gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  <UserPlus className="h-3 w-3" /> Cadastrar Fornecedor
                </Button>
              )}
            </div>
          </div>

          {/* SMART CLASSIFICATION SUGGESTION BOX */}
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Sugestão de Lançamento no ERP FrotaOne
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O motor fiscal identificou itens de <strong className="text-foreground">{item.parsedCategory}</strong>. Escolha o módulo de destino final para confirmação:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { module: "Abastecimentos", icon: <Fuel className="h-3.5 w-3.5 text-amber-500" /> },
                { module: "Estoque", icon: <Package className="h-3.5 w-3.5 text-blue-500" /> },
                { module: "Manutenção (OS)", icon: <Wrench className="h-3.5 w-3.5 text-purple-500" /> },
                { module: "Financeiro", icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> }
              ].map((opt) => (
                <button
                  key={opt.module}
                  type="button"
                  onClick={() => setSelectedTargetModule(opt.module)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                    selectedTargetModule === opt.module
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {opt.icon}
                  <span className="truncate">{opt.module}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ITEMS BREAKDOWN TABLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Itens Extraídos do XML</span>
              <span className="text-muted-foreground">{item.items.length} item(ns)</span>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground">
                    <th className="p-2">Cód.</th>
                    <th className="p-2">Descrição</th>
                    <th className="p-2">CFOP</th>
                    <th className="p-2 text-right">Qtd</th>
                    <th className="p-2 text-right">Unitário</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {item.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="p-2 font-mono text-[11px] text-muted-foreground">{it.code}</td>
                      <td className="p-2 font-medium text-foreground">{it.description}</td>
                      <td className="p-2 font-mono text-[11px]">{it.cfop}</td>
                      <td className="p-2 text-right font-mono">{it.quantity}</td>
                      <td className="p-2 text-right font-mono">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(it.unitPrice)}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-foreground">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(it.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <SheetFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(item.id)}
            className="text-xs h-9 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <XCircle className="h-3.5 w-3.5" /> Rejeitar
          </Button>

          <div className="flex items-center gap-2">
            <SheetClose asChild>
              <Button variant="outline" size="sm" className="text-xs h-9">
                Cancelar
              </Button>
            </SheetClose>

            <Button
              size="sm"
              onClick={() => onConfirmLaunch(item, selectedTargetModule)}
              className="text-xs h-9 gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Lançar em {selectedTargetModule}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
