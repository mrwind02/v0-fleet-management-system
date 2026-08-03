"use client"

import * as React from "react"
import { AlertTriangle, Trash2, HelpCircle, ShieldAlert, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ConfirmVariant = "danger" | "warning" | "info" | "success"

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
  isLoading?: boolean
}

const ICON_MAP = {
  danger: { icon: Trash2, color: "text-red-600 bg-red-500/10 border-red-500/20", btnClass: "bg-red-600 hover:bg-red-700 text-white" },
  warning: { icon: AlertTriangle, color: "text-amber-600 bg-amber-500/10 border-amber-500/20", btnClass: "bg-amber-600 hover:bg-amber-700 text-white" },
  info: { icon: HelpCircle, color: "text-blue-600 bg-blue-500/10 border-blue-500/20", btnClass: "bg-blue-600 hover:bg-blue-700 text-white" },
  success: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white" }
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null

  const config = ICON_MAP[variant] || ICON_MAP.danger
  const IconComponent = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP COM DESFOCAGEM BACKDROP-BLUR E ANIMAÇÃO FADE */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* DIÁLOGO CENTRALIZADO E ANIMADO ZOOM-IN */}
      <div className="relative bg-card border border-border shadow-2xl rounded-2xl p-6 max-w-md w-full space-y-5 z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 transition-colors rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border shrink-0 ${config.color}`}>
            <IconComponent className="h-6 w-6" />
          </div>

          <div className="space-y-1.5 pt-0.5">
            <h3 className="text-base font-bold text-foreground leading-snug">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>

        {/* RODAPÉ DE AÇÕES */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 text-xs font-semibold"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            disabled={isLoading}
            className={`h-9 px-4 text-xs font-semibold shadow-xs ${config.btnClass}`}
          >
            {isLoading ? "Processando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
