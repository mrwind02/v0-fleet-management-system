"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  MapPin, MessageSquare, Database, FileCheck, Cpu, Sparkles, Flame, Mail,
  Share2, Activity, Truck, DollarSign, Settings, RefreshCw, AlertCircle,
  MoreHorizontal, Power, Trash2, Eye, CheckCircle2, AlertTriangle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IntegrationItem } from "@/types/integrations"
import { IntegrationStatus } from "./IntegrationStatus"
import { IntegrationHealthBadge } from "./IntegrationHealthBadge"

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

interface IntegrationCardProps {
  item: IntegrationItem
  onTest?: (item: IntegrationItem) => void
  onToggleStatus?: (item: IntegrationItem) => void
  onRemove?: (item: IntegrationItem) => void
}

/**
 * Verifica se a integração está de fato configurada (tem pelo menos uma
 * credencial preenchida — ex: apiKey, accessToken, certFile, projectUrl).
 */
function isIntegrationConfigured(item: IntegrationItem): boolean {
  if (!item.configFields || item.configFields.length === 0) return false
  const credentialKeys = ["apiKey", "accessToken", "certFile", "projectUrl", "serviceKey", "webhookVerifyToken"]
  return item.configFields.some(
    (f) => credentialKeys.includes(f.key) && f.value && f.value.trim().length > 0
  )
}

/**
 * Determina o status real da integração com base nas credenciais salvas.
 * - Se não tiver credenciais: pending (Configuração Pendente)
 * - Se tiver credenciais e status for connected: connected
 * - Caso contrário: usa o status original
 */
function resolvedStatus(item: IntegrationItem): IntegrationItem["status"] {
  if (!isIntegrationConfigured(item)) return "pending"
  return item.status
}

export function IntegrationCard({ item, onTest, onToggleStatus, onRemove }: IntegrationCardProps) {
  const router = useRouter()
  const IconComponent = ICON_MAP[item.iconName] || Share2
  const configured = isIntegrationConfigured(item)
  const status = resolvedStatus(item)

  return (
    <div
      className="p-4 bg-card border rounded-2xl space-y-3.5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between cursor-pointer"
      onClick={() => router.push(`/settings/integrations/${item.slug}`)}
    >
      {/* HEADER DO CARD */}
      <div>
        <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2.5 rounded-xl border shrink-0 ${configured ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-sm text-foreground truncate">{item.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">
                  {item.version}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">{item.category}</span>
            </div>
          </div>

          <IntegrationStatus status={status} />
        </div>

        {/* DESCRIÇÃO */}
        <p className="text-xs text-muted-foreground line-clamp-2 mt-2.5">
          {item.description}
        </p>
      </div>

      {/* PAINEL DE SAÚDE DA CONEXÃO & MÉTRICAS */}
      <div className="p-2.5 rounded-xl bg-muted/30 border space-y-2">
        <IntegrationHealthBadge uptimePct={item.uptimePct} latencyMs={item.latencyMs} />

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
          <span>Última Sinc: <strong className="text-foreground">{item.lastSync}</strong></span>
          <span className="font-mono text-[10px]">{item.calls24h} requisições (24h)</span>
        </div>

        {item.lastError && (
          <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-semibold pt-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{item.lastError}</span>
          </div>
        )}
      </div>

      {/* BOTÕES E AÇÕES */}
      <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            onClick={() => router.push(`/settings/integrations/${item.slug}?tab=configuracao`)}
            className={`h-8 text-xs gap-1 font-semibold px-3 ${
              configured
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {configured
              ? <><CheckCircle2 className="h-3.5 w-3.5" /> Configurado</>
              : <><Settings className="h-3.5 w-3.5" /> Configurar</>
            }
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onTest?.(item)}
            className="h-8 text-xs gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5 text-blue-600" /> Testar
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/settings/integrations/${item.slug}?tab=logs`)}
            className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            Logs
          </Button>
        </div>

        {/* MENU 3 PONTOS (DROPDOWN) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => router.push(`/settings/integrations/${item.slug}`)} className="text-xs gap-2 cursor-pointer">
              <Eye className="h-3.5 w-3.5 text-blue-600" /> Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus?.(item)} className="text-xs gap-2 cursor-pointer">
              <Power className="h-3.5 w-3.5 text-amber-600" /> {item.enabled ? "Desativar" : "Ativar"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRemove?.(item)} className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="h-3.5 w-3.5 text-destructive" /> Desinstalar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
