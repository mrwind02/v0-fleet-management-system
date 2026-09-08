"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search, Calculator, Calendar, CreditCard, Settings, User, Truck, Wrench,
  Activity, AlertOctagon, BarChart3, Car, DollarSign, FileText, Home, Plus, Users,
  Loader2, MapPin, MessageSquare, Database, FileCheck, Cpu, Sparkles, Flame,
  Mail, Shield, Building2, Lock, HardDrive, ClipboardList, Plug, Network,
  RefreshCw, Package, Fuel, Globe, ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { vehicleService, driverService } from "@/services/api"

// ─── ÍNDICE COMPLETO DE CONFIGURAÇÕES ─────────────────────────────────────────
const SETTINGS_INDEX = [
  // Empresa
  { label: "Dados da Empresa", description: "Razão social, CNPJ, endereço, logotipo", module: "company", icon: Building2, color: "text-blue-600", badge: "Empresa", keywords: "empresa razão social cnpj endereço logotipo dados cadastro filial" },
  { label: "Filiais & Unidades", description: "Cadastro e gestão de filiais e unidades da empresa", module: "company", icon: Building2, color: "text-blue-600", badge: "Empresa", keywords: "filiais unidades franquias regionais escritórios" },
  // Usuários
  { label: "Usuários & Acessos", description: "Gerenciar contas de usuários, perfis e permissões", module: "users", icon: Users, color: "text-emerald-600", badge: "Usuários", keywords: "usuários contas perfis permissões acesso login senha administrador operador" },
  { label: "Permissões por Perfil", description: "Configurar o que cada perfil pode visualizar ou editar", module: "users", icon: Shield, color: "text-emerald-600", badge: "Usuários", keywords: "permissões roles perfil acesso visualizar editar admin" },
  // Parâmetros
  { label: "Parâmetros de Frota", description: "Limites de velocidade, km/l padrão, alertas de quilometragem", module: "fleet-params", icon: Truck, color: "text-orange-600", badge: "Parâmetros", keywords: "frota velocidade quilometragem km/l alertas consumo parâmetros limite" },
  { label: "Parâmetros Financeiros", description: "Centros de custo, moeda, limites de despesas", module: "finance-params", icon: DollarSign, color: "text-purple-600", badge: "Parâmetros", keywords: "financeiro custos centro custo moeda limite despesa orçamento" },
  { label: "Regras de Documentos", description: "Alertas de vencimento de CNH, CRLV, seguros e licenças", module: "documents", icon: FileText, color: "text-amber-600", badge: "Documentos", keywords: "documentos cnh crlv seguro licença vencimento alerta expiração" },
  { label: "Regras de Manutenção", description: "Intervalos de revisão, troca de óleo e metas de OS", module: "maintenance-rules", icon: Wrench, color: "text-rose-600", badge: "Manutenção", keywords: "manutenção revisão óleo filtro pneu preventiva intervalo km" },
  { label: "Fornecedores & Prestadores", description: "Regras de cadastro e aprovação de fornecedores", module: "supplier-rules", icon: Package, color: "text-teal-600", badge: "Fornecedores", keywords: "fornecedores prestadores postos oficinas aprovação cadastro" },
  // Integrações
  { label: "Central de Integrações", description: "Google Maps, WhatsApp, SEFAZ, OpenAI, Supabase", module: "integrations", icon: Plug, color: "text-indigo-600", badge: "Integrações", keywords: "integrações api google maps whatsapp sefaz openai supabase gemini firebase conectar instalar módulo" },
  { label: "Google Maps", description: "Geolocalização, rotas, distâncias e autocomplete", module: "integrations", slug: "google-maps", icon: MapPin, color: "text-red-600", badge: "Integração", keywords: "google maps geolocalização rotas distância geocoding places api key" },
  { label: "WhatsApp Business (Meta)", description: "Notificações via WhatsApp para motoristas e gestores", module: "integrations", slug: "whatsapp-meta", icon: MessageSquare, color: "text-green-600", badge: "Integração", keywords: "whatsapp meta business notificações mensagens alertas motoristas token" },
  { label: "Supabase — Banco de Dados", description: "Conexão com banco de dados principal do ERP", module: "integrations", slug: "supabase", icon: Database, color: "text-blue-600", badge: "Integração", keywords: "supabase banco dados database postgresql conexão url key" },
  { label: "Distribuição DF-e (SEFAZ)", description: "Recepção automática de NF-e, NFC-e, CT-e e MDF-e", module: "integrations", slug: "distribuicao-dfe", icon: FileCheck, color: "text-amber-600", badge: "Integração", keywords: "sefaz nfe nfce cte mdfe distribuição dfe certificado digital a1 pfx pkcs12 cnpj receita federal fiscal xml" },
  { label: "OpenAI GPT-4", description: "IA para análise de notas, classificação de despesas", module: "integrations", slug: "openai", icon: Cpu, color: "text-violet-600", badge: "Integração", keywords: "openai gpt inteligência artificial ia análise despesas classificação api" },
  { label: "Google Gemini AI", description: "OCR de recibos, visão computacional e relatórios", module: "integrations", slug: "google-gemini", icon: Sparkles, color: "text-pink-600", badge: "Integração", keywords: "gemini google ai ocr recibo visão computacional relatório imagem" },
  { label: "Firebase", description: "Push notifications para motoristas e autenticação", module: "integrations", slug: "firebase", icon: Flame, color: "text-orange-600", badge: "Integração", keywords: "firebase push notifications motoristas autenticação mobile" },
  { label: "SendGrid (E-mail)", description: "Envio de e-mails transacionais e relatórios", module: "integrations", slug: "sendgrid", icon: Mail, color: "text-blue-600", badge: "Integração", keywords: "sendgrid email e-mail transacional relatório smtp" },
  // Importação XML / Fiscal
  { label: "Importação XML Fiscal", description: "Upload de NF-e e NFC-e, classificação automática por NCM", module: "nfe", icon: FileCheck, color: "text-amber-600", badge: "Fiscal", keywords: "importação xml fiscal nfe nfce nota fiscal upload ncm classificação despesa abastecimento manutenção xml zip" },
  { label: "Busca Manual SEFAZ", description: "Consulta manual ao WebService NFeDistribuicaoDFe", module: "nfe", icon: RefreshCw, color: "text-blue-600", badge: "Fiscal", keywords: "busca manual sefaz sync sincronização nfe distribuição nsu certificado" },
  // Segurança
  { label: "Segurança & Sessões", description: "2FA, políticas de senha e sessões ativas", module: "security", icon: Lock, color: "text-rose-600", badge: "Segurança", keywords: "segurança 2fa dois fatores senha política sessão login dispositivo autenticação" },
  // Backup
  { label: "Backup & Restauração", description: "Backup manual e histórico de snapshots do banco", module: "backup", icon: HardDrive, color: "text-slate-600", badge: "Backup", keywords: "backup restauração banco dados snapshot exportar histórico" },
  // Auditoria
  { label: "Auditoria & Logs do Sistema", description: "Trilha de auditoria completa de todas as operações", module: "audit", icon: ClipboardList, color: "text-indigo-600", badge: "Auditoria", keywords: "auditoria logs trilha operações histórico rastreio usuários alterações" },
]

// ─── ÍNDICE DE INTEGRAÇÕES (Link Direto p/ Detail Page) ──────────────────────
const INTEGRATION_LINKS = [
  { slug: "google-maps", label: "Configurar Google Maps", keywords: "google maps api key geocoding" },
  { slug: "whatsapp-meta", label: "Configurar WhatsApp Business", keywords: "whatsapp token phone id" },
  { slug: "distribuicao-dfe", label: "Configurar Certificado Digital A1 SEFAZ", keywords: "certificado a1 pfx sefaz cnpj senha" },
  { slug: "openai", label: "Configurar OpenAI GPT-4", keywords: "openai api key gpt modelo" },
  { slug: "google-gemini", label: "Configurar Google Gemini AI", keywords: "gemini api key gcp modelo" },
  { slug: "firebase", label: "Configurar Firebase", keywords: "firebase push fcm project" },
  { slug: "supabase", label: "Configurar Supabase", keywords: "supabase url service key banco" },
]

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [vehicles, setVehicles] = React.useState<any[]>([])
  const [drivers, setDrivers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (open) {
      setSearch("")
      setLoading(true)
      Promise.all([
        vehicleService.getAll().catch(() => ({ data: { data: [] } })),
        driverService.getAll().catch(() => ({ data: { data: [] } }))
      ]).then(([vRes, dRes]) => {
        setVehicles(vRes.data?.data || vRes.data || [])
        setDrivers(dRes.data?.data || dRes.data || [])
      }).finally(() => setLoading(false))
    }
  }, [open])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  // Filtra o índice de configurações com base no termo de busca
  const lowerSearch = search.toLowerCase()
  const matchedSettings = React.useMemo(() => {
    if (!lowerSearch || lowerSearch.length < 2) return []
    return SETTINGS_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerSearch) ||
        item.description.toLowerCase().includes(lowerSearch) ||
        item.keywords.toLowerCase().includes(lowerSearch)
    )
  }, [lowerSearch])

  const matchedIntegrationLinks = React.useMemo(() => {
    if (!lowerSearch || lowerSearch.length < 2) return []
    return INTEGRATION_LINKS.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerSearch) ||
        item.keywords.toLowerCase().includes(lowerSearch)
    )
  }, [lowerSearch])

  return (
    <div className="w-full sm:w-auto">
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Busca Global"
        aria-keyshortcuts="Control+K"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none pr-10 sm:pr-14 md:w-64 lg:w-80 overflow-hidden"
      >
        <Search className="mr-2 h-3.5 w-3.5 shrink-0" />
        <span className="hidden lg:inline-flex truncate">Buscar módulos, integrações...</span>
        <span className="inline-flex lg:hidden truncate">Buscar...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex shrink-0" aria-hidden="true">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
        <CommandInput
          placeholder="Buscar: veículo, motorista, configuração, integração..."
          value={search}
          onValueChange={setSearch}
          onClear={() => setSearch("")}
        />
        <CommandList className="h-[460px] max-h-[460px] p-2">
          {loading && (
            <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
              Carregando frota e módulos...
            </div>
          )}

          {!loading && search.length >= 2 && matchedSettings.length === 0 && matchedIntegrationLinks.length === 0 && vehicles.length === 0 && drivers.length === 0 && (
            <CommandEmpty className="py-8 text-sm text-muted-foreground">
              Nenhum resultado encontrado para &quot;{search}&quot;.
            </CommandEmpty>
          )}

          {/* ─── CONFIGURAÇÕES & INTEGRAÇÕES (Busca Dinâmica no Índice) ─── */}
          {matchedSettings.length > 0 && (
            <>
              <CommandGroup heading="Configurações & Integrações">
                {matchedSettings.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.label + item.module}
                      value={`${item.label} ${item.keywords}`}
                      onSelect={() => runCommand(() => {
                        // Se tiver slug (integração específica), vai direto para a detail page
                        if ((item as any).slug) {
                          router.push(`/settings/integrations/${(item as any).slug}?tab=configuracao`)
                        } else {
                          router.push(`/settings?module=${item.module}`)
                        }
                      })}
                      className="cursor-pointer rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      <div className={`p-1.5 rounded-md bg-muted mr-2 shrink-0 ${item.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-semibold text-sm text-foreground">{item.label}</span>
                        <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded border">{item.badge}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandSeparator className="my-2" />
            </>
          )}

          {/* ─── LINK DIRETO PARA CONFIGURAR INTEGRAÇÃO ─── */}
          {matchedIntegrationLinks.length > 0 && (
            <>
              <CommandGroup heading="Configurar Integração">
                {matchedIntegrationLinks.map((item) => (
                  <CommandItem
                    key={item.slug}
                    value={`${item.label} ${item.keywords}`}
                    onSelect={() => runCommand(() => router.push(`/settings/integrations/${item.slug}?tab=configuracao`))}
                    className="cursor-pointer rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-blue-500/10 mr-2 shrink-0 text-blue-600">
                      <Settings className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-sm text-foreground">{item.label}</span>
                      <span className="text-xs text-muted-foreground font-mono">/settings/integrations/{item.slug}</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0">Configurar</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator className="my-2" />
            </>
          )}

          {/* ─── VEÍCULOS (Busca Dinâmica) ─── */}
          {search.length > 0 && vehicles.length > 0 && (
            <>
              <CommandGroup heading="Veículos Encontrados">
                {vehicles.slice(0, 5).map((v) => (
                  <CommandItem
                    key={v.id}
                    value={`Veículo ${v.plate} ${v.brand} ${v.model} ${v.year} ${v.chassisNumber || ''}`}
                    onSelect={() => runCommand(() => router.push(`/vehicles/${v.id}`))}
                    className="cursor-pointer rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mr-2 shrink-0">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-sm text-foreground">{v.plate}</span>
                      <span className="text-xs text-muted-foreground">{v.brand} {v.model} ({v.year})</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border">Veículo</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator className="my-2" />
            </>
          )}

          {/* ─── MOTORISTAS (Busca Dinâmica) ─── */}
          {search.length > 0 && drivers.length > 0 && (
            <>
              <CommandGroup heading="Motoristas Encontrados">
                {drivers.slice(0, 5).map((d) => (
                  <CommandItem
                    key={d.id}
                    value={`Motorista ${d.name} ${d.cnh} ${d.cpf || ''}`}
                    onSelect={() => runCommand(() => router.push(`/drivers/${d.id}`))}
                    className="cursor-pointer rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mr-2 shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-sm text-foreground">{d.name}</span>
                      <span className="text-xs text-muted-foreground">CNH: {d.cnh} {d.cpf ? `• CPF: ${d.cpf}` : ''}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border">Motorista</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator className="my-2" />
            </>
          )}

          {/* ─── AÇÕES RÁPIDAS (sempre visíveis quando sem busca) ─── */}
          {search.length === 0 && (
            <>
              <CommandGroup heading="Ações Rápidas">
                <CommandItem value="Ação: Novo Veículo Cadastrar Frota" onSelect={() => runCommand(() => router.push('/vehicles/new'))} className="cursor-pointer rounded-lg">
                  <Plus className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="font-medium">Novo Veículo</span>
                </CommandItem>
                <CommandItem value="Ação: Nova Ordem de Serviço OS Manutenção" onSelect={() => runCommand(() => router.push('/maintenance/os'))} className="cursor-pointer rounded-lg">
                  <Wrench className="mr-2 h-4 w-4 text-orange-600" />
                  <span className="font-medium">Nova Ordem de Serviço</span>
                </CommandItem>
                <CommandItem value="Ação: Cadastrar Motorista Novo Condutor" onSelect={() => runCommand(() => router.push('/drivers/new'))} className="cursor-pointer rounded-lg">
                  <User className="mr-2 h-4 w-4 text-emerald-600" />
                  <span className="font-medium">Cadastrar Motorista</span>
                </CommandItem>
                <CommandItem value="Ação: Lançar Abastecimento Combustível" onSelect={() => runCommand(() => router.push('/fuel'))} className="cursor-pointer rounded-lg">
                  <Fuel className="mr-2 h-4 w-4 text-purple-600" />
                  <span className="font-medium">Lançar Abastecimento</span>
                </CommandItem>
                <CommandItem value="Ação: Lançar Despesa Operacional" onSelect={() => runCommand(() => router.push('/finance/expenses'))} className="cursor-pointer rounded-lg">
                  <CreditCard className="mr-2 h-4 w-4 text-rose-600" />
                  <span className="font-medium">Lançar Despesa</span>
                </CommandItem>
                <CommandItem value="Importar XML Fiscal NF-e" onSelect={() => runCommand(() => router.push('/settings?module=nfe'))} className="cursor-pointer rounded-lg">
                  <FileCheck className="mr-2 h-4 w-4 text-amber-600" />
                  <span className="font-medium">Importar XML Fiscal (NF-e)</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator className="my-2" />
            </>
          )}

          {/* ─── NAVEGAÇÃO PRINCIPAL (sempre visível) ─── */}
          {search.length === 0 && (
            <>
              <CommandGroup heading="Navegação">
                <CommandItem value="Dashboard Início Visão Geral" onSelect={() => runCommand(() => router.push('/dashboard'))} className="cursor-pointer rounded-lg">
                  <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Dashboard</span>
                </CommandItem>
                <CommandItem value="Frota Veículos Caminhões" onSelect={() => runCommand(() => router.push('/vehicles'))} className="cursor-pointer rounded-lg">
                  <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Frota de Veículos</span>
                </CommandItem>
                <CommandItem value="Motoristas Condutores" onSelect={() => runCommand(() => router.push('/drivers'))} className="cursor-pointer rounded-lg">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Motoristas</span>
                </CommandItem>
                <CommandItem value="Configurações Sistema Empresa Integrações" onSelect={() => runCommand(() => router.push('/settings'))} className="cursor-pointer rounded-lg">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Configurações</span>
                </CommandItem>
                <CommandItem value="Integrações APIs Google Maps WhatsApp SEFAZ" onSelect={() => runCommand(() => router.push('/settings?module=integrations'))} className="cursor-pointer rounded-lg">
                  <Plug className="mr-2 h-4 w-4 text-indigo-600" />
                  <span>Central de Integrações</span>
                </CommandItem>
                <CommandItem value="Relatórios BI Indicadores KPI" onSelect={() => runCommand(() => router.push('/reports'))} className="cursor-pointer rounded-lg">
                  <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Central de Relatórios</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/20 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">↑↓</kbd> para navegar</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">↵</kbd> para selecionar</span>
          </div>
          <span><kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">ESC</kbd> para fechar</span>
        </div>
      </CommandDialog>
    </div>
  )
}
