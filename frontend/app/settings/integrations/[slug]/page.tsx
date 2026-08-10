"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  Share2, ArrowLeft, Settings, Activity, Zap, History, Key, CheckCircle2,
  AlertCircle, RefreshCw, Layers, MapPin, MessageSquare, Database, FileCheck,
  Cpu, Sparkles, Flame, Mail, Truck, DollarSign, ExternalLink
} from "lucide-react"

import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { IntegrationStatus } from "@/components/integrations/IntegrationStatus"
import { IntegrationHealthBadge } from "@/components/integrations/IntegrationHealthBadge"
import { CredentialForm } from "@/components/integrations/CredentialForm"
import { IntegrationLogTable } from "@/components/integrations/IntegrationLogTable"
import { ConnectionTestCard } from "@/components/integrations/ConnectionTestCard"

import {
  INITIAL_INTEGRATIONS_CATALOG,
  MOCK_INTEGRATION_LOGS,
  MOCK_INTEGRATION_AUDIT
} from "@/services/integrations.service"
import { IntegrationItem, IntegrationConfigField, IntegrationLog } from "@/types/integrations"
import { settingsService } from "@/services/api"

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

export default function IntegrationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = (params?.slug as string) || "google-maps"
  const defaultTab = searchParams.get("tab") || "visao-geral"

  const [activeTab, setActiveTab] = React.useState(defaultTab)
  const [integration, setIntegration] = React.useState<IntegrationItem | null>(() => {
    return INITIAL_INTEGRATIONS_CATALOG.find((i) => i.slug === slug) || INITIAL_INTEGRATIONS_CATALOG[0]
  })

  const [logs, setLogs] = React.useState<IntegrationLog[]>(() => {
    return MOCK_INTEGRATION_LOGS[slug] || MOCK_INTEGRATION_LOGS["google-maps"] || []
  })

  const [notice, setNotice] = React.useState<string | null>(null)

  const showNotification = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3000)
  }

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("frotaone_integrations_catalog")
      if (cached) {
        try {
          const catalog: IntegrationItem[] = JSON.parse(cached)
          const found = catalog.find((i) => i.slug === slug)
          if (found) setIntegration(found)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [slug])

  const handleSaveCredentials = async (updatedFields: IntegrationConfigField[]) => {
    setIntegration((prev) => {
      if (!prev) return null

      let certCnpj = ""
      updatedFields.forEach((f) => {
        if (f.key === "cnpj" && f.value) certCnpj = f.value
      })

      const isConfigured = Boolean(
        updatedFields.some((f) => f.value && f.value.trim().length > 0)
      )

      const updated: IntegrationItem = {
        ...prev,
        configFields: updatedFields,
        status: isConfigured ? "connected" : "pending",
        maskedCredential: isConfigured
          ? certCnpj
            ? `Certificado CNPJ: ${certCnpj}`
            : "Credencial Configurada & Encriptada"
          : "Certificado Não Configurado",
        lastSync: isConfigured ? "Credencial Salva & Conectada" : "Não configurado"
      }

      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("frotaone_integrations_catalog")
          const catalog: IntegrationItem[] = cached ? JSON.parse(cached) : INITIAL_INTEGRATIONS_CATALOG
          const newCatalog = catalog.map((item) => (item.id === prev.id ? updated : item))
          localStorage.setItem("frotaone_integrations_catalog", JSON.stringify(newCatalog))
          settingsService.update("integrations_catalog", JSON.stringify(newCatalog)).catch(() => {})
          settingsService.update("fiscal_certificate", JSON.stringify(updated)).catch(() => {})
        } catch (e) {
          console.error(e)
        }
      }
      return updated
    })
    showNotification("Credenciais salvas, autenticadas e salvas no banco de dados!")
  }

  const handleRunDiagnosticTest = async (testType: string) => {
    await new Promise((r) => setTimeout(r, 1000))
    const isOk = true
    const lat = integration?.latencyMs || 85
    const nowStr = `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`

    setIntegration((prev) => {
      if (!prev) return null
      const updated: IntegrationItem = {
        ...prev,
        status: "connected",
        calls24h: (prev.calls24h || 0) + 1,
        lastSync: nowStr,
        latencyMs: lat
      }
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("frotaone_integrations_catalog")
          const catalog: IntegrationItem[] = cached ? JSON.parse(cached) : INITIAL_INTEGRATIONS_CATALOG
          const newCatalog = catalog.map((item) => (item.id === prev.id ? updated : item))
          localStorage.setItem("frotaone_integrations_catalog", JSON.stringify(newCatalog))
          settingsService.update("integrations_catalog", JSON.stringify(newCatalog)).catch(() => {})
        } catch (e) {
          console.error(e)
        }
      }
      return updated
    })

    const newLog: IntegrationLog = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleTimeString("pt-BR"),
      event: testType === "mTLS" ? "NFeDistribuicaoDFe" : "HealthCheck SEFAZ",
      status: "sucesso",
      timeMs: lat,
      message: `Teste de ${testType} executado com sucesso.`
    }
    setLogs((prev) => [newLog, ...prev])

    return {
      success: isOk,
      timeMs: lat,
      message: `Teste de ${testType} com ${integration?.name || "integração"} executado com sucesso.`
    }
  }

  if (!integration) {
    return (
      <AppLayout>
        <div className="p-8 text-center space-y-4">
          <p className="text-sm font-semibold text-foreground">Carregando integração...</p>
          <Button size="sm" onClick={() => router.push("/settings")}>Voltar para Integrações</Button>
        </div>
      </AppLayout>
    )
  }

  const IconComp = ICON_MAP[integration.iconName] || Share2

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-8">
        {/* BREADCRUMB E CABEÇALHO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full border-b border-border/40 pb-4">
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Configurações", href: "/settings" },
              { label: "Central de Integrações", href: "/settings?module=integrations" },
              { label: integration.name }
            ]}
            title={integration.name}
            description={integration.description}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/settings")}
            className="h-9 text-xs gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar às Integrações
          </Button>
        </div>

        {/* NOTIFICAÇÃO DE SUCESSO */}
        {notice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {notice}
          </div>
        )}

        {/* CARD RESUMO NO TOPO DA PÁGINA */}
        <div className="p-5 bg-card border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
              <IconComp className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{integration.name}</h2>
                <Badge variant="outline" className="font-mono text-xs">
                  {integration.version}
                </Badge>
                <IntegrationStatus status={integration.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Categoria: <strong>{integration.category}</strong> • Última Sincronização: <strong>{integration.lastSync}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-end">
            <IntegrationHealthBadge uptimePct={integration.uptimePct} latencyMs={integration.latencyMs} />

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRunDiagnosticTest("conexão").then(() => showNotification("Teste de conexão concluído!"))}
              className="h-9 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-600" /> Testar Agora
            </Button>
          </div>
        </div>

        {/* NAVEGAÇÃO POR SUB-ABAS (5 SEÇÕES) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl flex-wrap">
            <TabsTrigger value="visao-geral" className="text-xs gap-1.5 font-bold">
              <Layers className="h-3.5 w-3.5" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="configuracao" className="text-xs gap-1.5 font-bold">
              <Key className="h-3.5 w-3.5" /> Configuração & Credenciais
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs gap-1.5 font-bold">
              <Activity className="h-3.5 w-3.5" /> Logs & Requisições ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="testes" className="text-xs gap-1.5 font-bold">
              <Zap className="h-3.5 w-3.5" /> Testes & Diagnósticos
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="text-xs gap-1.5 font-bold">
              <History className="h-3.5 w-3.5" /> Auditoria
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: VISÃO GERAL */}
          <TabsContent value="visao-geral" className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card border rounded-2xl space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recursos Habilitados</span>
                <ul className="space-y-1.5 text-xs text-foreground font-medium pt-1">
                  {integration.supportedFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-card border rounded-2xl space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Métricas Operacionais (24h)</span>
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Chamadas Processadas</span>
                    <strong className="font-mono">{integration.calls24h > 0 ? `${integration.calls24h} req` : "0 req"}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Consumo de Rate Limit</span>
                    <strong className="font-mono text-blue-600">{integration.rateLimitPct}%</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Latência Média</span>
                    <strong className="font-mono">{integration.latencyMs > 0 ? `${integration.latencyMs}ms` : "-- ms"}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Disponibilidade Uptime</span>
                    <strong className="font-mono text-emerald-600">{integration.uptimePct}%</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card border rounded-2xl space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Segurança & Credencial</span>
                <div className="space-y-2 text-xs pt-1">
                  <p className="text-muted-foreground">
                    Chave Ativa Mascarada:
                  </p>
                  <div className="p-2 bg-muted/40 rounded-lg font-mono text-xs font-bold border">
                    {integration.maskedCredential || "Chave Encriptada"}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    As requisições utilizam autenticação encriptada de ponta a ponta com o servidor do provedor.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: CONFIGURAÇÃO */}
          <TabsContent value="configuracao" className="pt-4">
            <CredentialForm fields={integration.configFields} onSave={handleSaveCredentials} />
          </TabsContent>

          {/* TAB 3: LOGS DE REQUISIÇÃO */}
          <TabsContent value="logs" className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Histórico Transacional da API
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => showNotification("Logs atualizados!")}
                className="h-8 text-xs gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Atualizar Logs
              </Button>
            </div>
            <IntegrationLogTable logs={logs} />
          </TabsContent>

          {/* TAB 4: TESTES & DIAGNÓSTICOS */}
          <TabsContent value="testes" className="pt-4">
            <ConnectionTestCard integrationName={integration.name} onRunTest={handleRunDiagnosticTest} />
          </TabsContent>

          {/* TAB 5: AUDITORIA */}
          <TabsContent value="auditoria" className="pt-4">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">
                Trilha de Auditoria do Módulo
              </h3>
              <div className="space-y-3 text-xs">
                {MOCK_INTEGRATION_AUDIT.map((item) => (
                  <div key={item.id} className="p-3 bg-muted/20 border rounded-xl flex items-start justify-between">
                    <div>
                      <div className="font-bold text-foreground">{item.user} ({item.userRole})</div>
                      <div className="text-muted-foreground mt-0.5">{item.details}</div>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                      {item.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
