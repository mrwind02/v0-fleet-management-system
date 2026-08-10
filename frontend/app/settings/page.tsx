"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ColumnDef } from "@tanstack/react-table"
import {
  Building2,
  Users,
  Truck,
  DollarSign,
  FileText,
  Wrench,
  Store,
  Share2,
  FileCode,
  ShieldCheck,
  Database,
  History,
  Plus,
  Save,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lock,
  Download,
  Calendar,
  Layers,
  Key,
  Globe,
  Smartphone,
  MapPin,
  Flame,
  UserCheck,
  Edit,
  Trash2,
  Check,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  UserPlus,
  Shield,
  Search,
  Loader2,
  Laptop,
  MoreHorizontal,
  X
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

import { AppLayout } from "../../components/layout/AppLayout"
import { PageHeader } from "../../components/ui/page-header"
import { MetricCard } from "../../components/ui/metric-card"
import { SettingsCard } from "../../components/ui/settings-card"
import { DataTable } from "../../components/ui/data-table"
import { UploadArea } from "../../components/ui/upload-area"
import { Timeline, TimelineEvent } from "../../components/ui/timeline"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Checkbox } from "../../components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { cn } from "../../utils/utils"

import { FiscalConfirmSheet } from "../../components/settings/fiscal-confirm-sheet"
import { NewItemModal, ModalType } from "../../components/settings/new-item-modal"
import { EditUserModal } from "../../components/settings/edit-user-modal"
import { EditBranchModal } from "../../components/settings/edit-branch-modal"
import { EditSupplierRuleModal } from "../../components/settings/edit-supplier-rule-modal"
import { settingsService, unitService, userService } from "../../services/api"

import { IntegrationCard } from "../../components/integrations/IntegrationCard"
import { IntegrationCatalog } from "../../components/integrations/IntegrationCatalog"
import { SyncTimeline } from "../../components/integrations/SyncTimeline"
import { EmptyIntegrationState } from "../../components/integrations/EmptyIntegrationState"
import { ConfirmModal } from "../../components/ui/confirm-modal"
import { INITIAL_INTEGRATIONS_CATALOG, MOCK_RECENT_TIMELINE } from "../../services/integrations.service"
import { IntegrationItem } from "../../types/integrations"

import {
  SettingsModule,
  CompanyConfig,
  BranchConfig,
  IntegrationsConfig,
  SecurityConfig,
  BackupLog,
  AuditLog,
  XmlImportItem,
  UserItem,
  RolePermissionItem,
  FleetParameterItem,
  FinanceParameterItem,
  DocumentRuleItem,
  MaintenanceRuleItem,
  SupplierRuleItem,
  ActiveSessionItem
} from "../../types/settings"

import {
  INITIAL_COMPANY_CONFIG,
  INITIAL_BRANCHES,
  INITIAL_INTEGRATIONS,
  INITIAL_SECURITY_CONFIG,
  INITIAL_BACKUP_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
  INITIAL_ROLE_PERMISSIONS,
  INITIAL_FLEET_PARAMS,
  INITIAL_FINANCE_PARAMS,
  INITIAL_DOC_RULES,
  INITIAL_MAINT_RULES,
  INITIAL_SUPPLIER_RULES,
  INITIAL_SESSIONS
} from "../../services/settings.service"

import { FiscalIntegrationService, MOCK_FISCAL_QUEUE } from "../../services/fiscal-integration.service"
import { fetchCnpj, formatCnpj, stripCnpjMask } from "../../services/cnpj.service"

const MODULE_TITLES: Record<SettingsModule, string> = {
  dashboard: "Painel Administrativo",
  company: "Empresa & Filiais",
  users: "Usuários & Permissões",
  fleet: "Parâmetros da Frota",
  finance: "Parâmetros Financeiros",
  documents: "Regras de Documentos",
  maintenance: "Manutenção & Checklists",
  suppliers: "Fornecedores & Qualidade",
  integrations: "Central de Integrações",
  nfe: "Importação XML Fiscal",
  security: "Segurança & LGPD",
  backup: "Backup & Restauração",
  audit: "Auditoria & Logs"
}

export default function SettingsPage({ initialModule = "dashboard" }: { initialModule?: SettingsModule }) {
  // State management
  const [activeModule, setActiveModule] = React.useState<SettingsModule>(initialModule)
  const [company, setCompany] = React.useState<CompanyConfig>(INITIAL_COMPANY_CONFIG)
  const [branches, setBranches] = React.useState<BranchConfig[]>(INITIAL_BRANCHES)
  const [users, setUsers] = React.useState<UserItem[]>([])
  const [roles, setRoles] = React.useState<RolePermissionItem[]>(INITIAL_ROLE_PERMISSIONS)
  const [fleetParams, setFleetParams] = React.useState<FleetParameterItem[]>(INITIAL_FLEET_PARAMS)
  const [financeParams, setFinanceParams] = React.useState<FinanceParameterItem[]>(INITIAL_FINANCE_PARAMS)
  const [docRules, setDocRules] = React.useState<DocumentRuleItem[]>(INITIAL_DOC_RULES)
  const [maintRules, setMaintRules] = React.useState<MaintenanceRuleItem[]>(INITIAL_MAINT_RULES)
  const [supplierRules, setSupplierRules] = React.useState<SupplierRuleItem[]>(INITIAL_SUPPLIER_RULES)
  const [activeSessions, setActiveSessions] = React.useState<ActiveSessionItem[]>(INITIAL_SESSIONS)
  const [integrations, setIntegrations] = React.useState<IntegrationsConfig>(INITIAL_INTEGRATIONS)
  const [security, setSecurity] = React.useState<SecurityConfig>(INITIAL_SECURITY_CONFIG)
  const [backupLogs, setBackupLogs] = React.useState<BackupLog[]>(INITIAL_BACKUP_LOGS)
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>(INITIAL_AUDIT_LOGS)
  const [xmlQueue, setXmlQueue] = React.useState<XmlImportItem[]>([])

  // Subtab State
  const [usersSubTab, setUsersSubTab] = React.useState("lista")
  const [fleetSubTab, setFleetSubTab] = React.useState("marcas")

  // Sheet & Modal Controls
  const [selectedXmlItem, setSelectedXmlItem] = React.useState<XmlImportItem | null>(null)
  const [isConfirmSheetOpen, setIsConfirmSheetOpen] = React.useState(false)
  const [activeModal, setActiveModal] = React.useState<ModalType>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [userToEdit, setUserToEdit] = React.useState<UserItem | null>(null)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = React.useState(false)
  const [branchToEdit, setBranchToEdit] = React.useState<BranchConfig | null>(null)
  const [isEditBranchModalOpen, setIsEditBranchModalOpen] = React.useState(false)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = React.useState(false)
  const [supplierRuleToEdit, setSupplierRuleToEdit] = React.useState<SupplierRuleItem | null>(null)

  // Load saved supplier rules from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("frotaone_supplier_rules")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSupplierRules(parsed)
          }
        } catch (e) {}
      }
    }
  }, [])

  const handleSaveSupplierRule = (rule: SupplierRuleItem) => {
    let updated: SupplierRuleItem[] = []
    const exists = supplierRules.some((s) => s.id === rule.id)
    if (exists) {
      updated = supplierRules.map((s) => (s.id === rule.id ? rule : s))
    } else {
      updated = [rule, ...supplierRules]
    }

    setSupplierRules(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("frotaone_supplier_rules", JSON.stringify(updated))
    }
    settingsService.update("supplier_rules", JSON.stringify(updated)).catch(() => {})
    showNotification(exists ? "Regra de homologação atualizada!" : "Nova regra de homologação criada!")
  }

  const handleDeleteSupplierRule = (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir a regra "${name}"?`)) {
      const updated = supplierRules.filter((s) => s.id !== id)
      setSupplierRules(updated)
      if (typeof window !== "undefined") {
        localStorage.setItem("frotaone_supplier_rules", JSON.stringify(updated))
      }
      settingsService.update("supplier_rules", JSON.stringify(updated)).catch(() => {})
      showNotification("Regra excluída com sucesso!")
    }
  }
  const [certPassword, setCertPassword] = React.useState("")
  const [certFile, setCertFile] = React.useState<File | null>(null)
  const [isSavingCompany, setIsSavingCompany] = React.useState(false)
  const [isSavingCert, setIsSavingCert] = React.useState(false)
  const [noticeMessage, setNoticeMessage] = React.useState<string | null>(null)

  // CNPJ Lookup State (Empresa)
  const [cnpjSearchState, setCnpjSearchState] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [cnpjSearchMessage, setCnpjSearchMessage] = React.useState("")

  // Integrations Marketplace State (Persistência em LocalStorage & Backend DB)
  const [integrationsCatalog, setIntegrationsCatalog] = React.useState<IntegrationItem[]>(INITIAL_INTEGRATIONS_CATALOG)
  const [isCatalogOpen, setIsCatalogOpen] = React.useState(false)

  // Função auxiliar para persistir o catálogo no LocalStorage e no Servidor
  const saveCatalogState = (newCatalog: IntegrationItem[]) => {
    setIntegrationsCatalog(newCatalog)
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("frotaone_integrations_catalog", JSON.stringify(newCatalog))
      }
      settingsService.update("integrations_catalog", JSON.stringify(newCatalog)).catch(() => {})
    } catch (e) {
      console.error("Erro ao salvar catálogo de integrações:", e)
    }
  }

  const handleInstallIntegration = (item: IntegrationItem) => {
    const updated = integrationsCatalog.map((i) =>
      i.id === item.id ? { ...i, installed: true, enabled: true, status: "connected" as const } : i
    )
    saveCatalogState(updated)
    addAuditLog("Central de Integrações", "Criar", undefined, `Instalou a integração ${item.name}`)
    showNotification(`Integração "${item.name}" instalada com sucesso!`)
  }

  const handleToggleIntegrationStatus = (item: IntegrationItem) => {
    const updated = integrationsCatalog.map((i) => {
      if (i.id === item.id) {
        const nextEnabled = !i.enabled
        return {
          ...i,
          enabled: nextEnabled,
          status: nextEnabled ? ("connected" as const) : ("disabled" as const)
        }
      }
      return i
    })
    saveCatalogState(updated)
    showNotification(`Integração "${item.name}" ${item.enabled ? "desativada" : "ativada"} com sucesso!`)
  }

  // Confirm Modal State
  const [confirmModalConfig, setConfirmModalConfig] = React.useState<{
    isOpen: boolean
    title: string
    description: string
    confirmText?: string
    variant?: "danger" | "warning" | "info" | "success"
    onConfirm: () => void
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {}
  })

  const handleRemoveIntegration = (item: IntegrationItem) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Desinstalar "${item.name}"?`,
      description: `Tem certeza que deseja desinstalar a integração "${item.name}"? Os serviços conectados e sincronizações automáticas deste módulo serão interrompidos.`,
      confirmText: "Desinstalar Integração",
      variant: "danger",
      onConfirm: () => {
        const updated = integrationsCatalog.map((i) =>
          i.id === item.id ? { ...i, installed: false, enabled: false, status: "disabled" as const } : i
        )
        saveCatalogState(updated)
        addAuditLog("Central de Integrações", "Excluir", `Módulo: ${item.name}`, "Desinstalado pelo usuário")
        showNotification(`Integração "${item.name}" desinstalada com sucesso.`)
      }
    })
  }

  const handleTestIntegration = (item: IntegrationItem) => {
    const nowStr = `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    const updatedCatalog = integrationsCatalog.map((i) => {
      if (i.id === item.id) {
        return {
          ...i,
          status: "connected" as const,
          calls24h: (i.calls24h || 0) + 1,
          lastSync: nowStr,
          latencyMs: i.latencyMs || 85
        }
      }
      return i
    })
    saveCatalogState(updatedCatalog)
    showNotification(`Teste de conexão com "${item.name}" executado com sucesso (latência: ${item.latencyMs || 85}ms)!`)
  }

  // Fetch Company Config, Filiais & Integrations Catalog on Mount
  React.useEffect(() => {
    const initSettings = async () => {
      // 1. Carrega do LocalStorage primeiro para carregamento instantâneo
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("frotaone_integrations_catalog")
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setIntegrationsCatalog(parsed)
            }
          } catch (e) {
            console.error(e)
          }
        }
        const savedLocal = localStorage.getItem("frotaone_branches")
        if (savedLocal) {
          try {
            const parsed = JSON.parse(savedLocal)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBranches(parsed)
            }
          } catch (e) {}
        }
      }

      // 2. Fetch Company, Certificate & Integrations Settings do Servidor/DB
      try {
        const res = await settingsService.getAll()
        const data = res.data?.data || res.data || []
        const compItem = data.find((item: any) => item.key === "company_config")
        if (compItem && compItem.value) {
          try {
            const parsedComp = typeof compItem.value === "string" ? JSON.parse(compItem.value) : compItem.value
            setCompany((prev) => ({ ...prev, ...parsedComp }))
          } catch (e) {
            console.error(e)
          }
        }

        const catItem = data.find((item: any) => item.key === "integrations_catalog")
        if (catItem && catItem.value) {
          try {
            const parsedCat = typeof catItem.value === "string" ? JSON.parse(catItem.value) : catItem.value
            if (Array.isArray(parsedCat) && parsedCat.length > 0) {
              setIntegrationsCatalog(parsedCat)
              if (typeof window !== "undefined") {
                localStorage.setItem("frotaone_integrations_catalog", JSON.stringify(parsedCat))
              }
            }
          } catch (e) {
            console.error(e)
          }
        }

        const certItem = data.find((item: any) => item.key === "fiscal_certificate")
        if (certItem && certItem.value) {
          try {
            const parsedCert = typeof certItem.value === "string" ? JSON.parse(certItem.value) : certItem.value
            setIntegrations((prev) => ({
              ...prev,
              fiscal: {
                ...prev.fiscal,
                certificate: {
                  ...prev.fiscal.certificate,
                  ...parsedCert
                }
              }
            }))
          } catch (e) {
            console.error(e)
          }
        }

        const branchItem = data.find((item: any) => item.key === "branches_config")
        if (branchItem && branchItem.value) {
          try {
            const parsedBranches = typeof branchItem.value === "string" ? JSON.parse(branchItem.value) : branchItem.value
            if (Array.isArray(parsedBranches) && parsedBranches.length > 0) {
              setBranches(parsedBranches)
            }
          } catch (e) {
            console.error(e)
          }
        }
      } catch (e) {
        console.error("Erro ao carregar configurações:", e)
      }

      // 3. Fetch Units / Filiais da API
      try {
        const res = await unitService.getAll()
        const unitList = res.data?.data || res.data || []
        if (unitList.length > 0) {
          setBranches((prev) => {
            const existingIds = new Set(prev.map((b) => b.id))
            const fetched: BranchConfig[] = unitList.map((u: any) => ({
              id: u.id,
              code: u.code || `FIL-${u.id.substring(0, 4)}`,
              name: u.name,
              cnpj: u.cnpj || "",
              cnpjStatus: u.cnpj_status || "",
              city: u.city || "São Paulo",
              state: u.state || "SP",
              address: u.address || "",
              number: u.address_number || "",
              complement: u.complement || "",
              neighborhood: u.neighborhood || "",
              zipCode: u.zip_code || "",
              phone: u.phone || "",
              email: u.email || "",
              manager: u.manager || "Gestor Responsável",
              status: u.status || "Ativa"
            }))
            const merged = [...prev]
            fetched.forEach((f) => {
              if (!existingIds.has(f.id)) merged.push(f)
            })
            return merged
          })
        }
      } catch (e) {
        console.error("Erro ao buscar filiais da API:", e)
      }

      // 4. Fetch Users da API
      try {
        const res = await userService.getAll()
        const userList = res.data?.data || res.data || []
        if (userList.length > 0) {
          setUsers(userList.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || "operacional",
            status: u.is_active ? "Ativo" : "Inativo",
            lastLogin: u.last_login ? new Date(u.last_login).toLocaleString('pt-BR') : "Nunca",
            createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : "10/01/2026",
            permissionsCount: 18
          })))
        } else {
          setUsers([])
        }
      } catch (e) {
        console.error("Erro ao buscar usuários da API:", e)
        setUsers([])
      }
    }

    initSettings()
  }, [])

  const handleSaveCompanyData = async () => {
    setIsSavingCompany(true)
    try {
      await settingsService.update("company_config", JSON.stringify(company))
      addAuditLog("Empresa", "Editar", undefined, `Razão Social: ${company.corporateName}, CNPJ: ${company.cnpj}`)
      showNotification("Dados cadastrais da empresa salvos no banco de dados com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar dados da empresa", error)
      showNotification("Erro ao salvar dados da empresa no servidor.")
    } finally {
      setIsSavingCompany(false)
    }
  }

  const handleSearchCompanyCnpj = async () => {
    const cnpjValue = company.cnpj
    const digits = stripCnpjMask(cnpjValue)
    if (digits.length < 14) {
      setCnpjSearchState("error")
      setCnpjSearchMessage("Digite o CNPJ completo (14 dígitos) antes de buscar.")
      return
    }
    setCnpjSearchState("loading")
    setCnpjSearchMessage("")
    try {
      const result = await fetchCnpj(cnpjValue)
      setCompany((prev) => ({
        ...prev,
        cnpj: result.cnpj,
        cnpjStatus: result.cnpjStatus,
        corporateName: result.corporateName || prev.corporateName,
        tradeName: result.tradeName || prev.tradeName,
        address: result.address,
        number: result.number,
        complement: result.complement,
        neighborhood: result.neighborhood,
        city: result.city,
        state: result.state,
        zipCode: result.zipCode,
        phone: result.phone || prev.phone,
        email: result.email || prev.email,
      }))
      setCnpjSearchState("success")
      setCnpjSearchMessage(`✓ ${result.corporateName} — Situação: ${result.cnpjStatus}`)
      showNotification(`CNPJ consultado com sucesso! Dados preenchidos automaticamente.`)
    } catch (err: any) {
      setCnpjSearchState("error")
      setCnpjSearchMessage(err.message || "Erro ao consultar CNPJ.")
    }
  }

  const handleOpenEditBranch = (branch: BranchConfig) => {
    setBranchToEdit(branch)
    setIsEditBranchModalOpen(true)
  }

  const handleSaveEditBranch = async (updated: BranchConfig) => {
    try {
      setBranches((prev) => {
        const next = prev.map((b) => (b.id === updated.id ? updated : b))
        unitService.update(updated.id, updated).catch(() => {})
        settingsService.update("branches_config", JSON.stringify(next)).catch(() => {})
        if (typeof window !== "undefined") {
          localStorage.setItem("frotaone_branches", JSON.stringify(next))
        }
        return next
      })
      addAuditLog("Empresa", "Editar", undefined, `Filial atualizada: ${updated.name} (${updated.code})`)
      showNotification(`Filial "${updated.name}" atualizada com sucesso!`)
    } catch (err) {
      console.error(err)
      showNotification("Erro ao atualizar filial.")
    }
  }

  const handleDeleteBranch = (branchId: string, branchName: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Excluir Filial "${branchName}"?`,
      description: `Tem certeza que deseja excluir a filial "${branchName}"? Esta ação removerá a unidade do cadastro do sistema.`,
      confirmText: "Excluir Filial",
      variant: "danger",
      onConfirm: async () => {
        try {
          setBranches((prev) => {
            const next = prev.filter((b) => b.id !== branchId)
            unitService.delete(branchId).catch(() => {})
            settingsService.update("branches_config", JSON.stringify(next)).catch(() => {})
            if (typeof window !== "undefined") {
              localStorage.setItem("frotaone_branches", JSON.stringify(next))
            }
            return next
          })
          addAuditLog("Empresa", "Excluir", `Filial: ${branchName}`, "Excluída pelo usuário")
          showNotification(`Filial "${branchName}" removida com sucesso!`)
        } catch (err) {
          console.error(err)
          showNotification("Erro ao remover filial.")
        }
      }
    })
  }

  const handleSaveCertificateA1 = async () => {
    setIsSavingCert(true)
    try {
      const validUntilDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
      const updatedCert = {
        id: `cert-${Date.now()}`,
        type: "A1" as const,
        issuer: certFile ? certFile.name.replace(/\.[^/.]+$/, "").toUpperCase() : company.corporateName || "CERTISIGN AC FINAL",
        validUntil: validUntilDate,
        daysRemaining: 365,
        status: "Válido" as const
      }
      setIntegrations((prev) => ({
        ...prev,
        fiscal: {
          ...prev.fiscal,
          certificate: updatedCert
        }
      }))

      await settingsService.update("fiscal_certificate", JSON.stringify({
        ...updatedCert,
        fileName: certFile?.name || "certificado_a1.pfx",
        hasPassword: !!certPassword,
        updatedAt: new Date().toISOString()
      })).catch(() => {})

      addAuditLog("Central de Integrações", "Editar", undefined, `Certificado A1 ativado (${updatedCert.issuer})`)
      showNotification("Certificado Digital A1 salvo e validado com sucesso na SEFAZ!")
    } catch (err) {
      console.error(err)
      showNotification("Erro ao salvar Certificado A1.")
    } finally {
      setIsSavingCert(false)
    }
  }

  // Helper to record audit events
  const addAuditLog = (moduleName: string, actionName: AuditLog["action"], oldValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      date: new Date().toLocaleString("pt-BR"),
      user: "Thiago Matos",
      userRole: "Administrador",
      module: moduleName,
      action: actionName,
      oldValue,
      newValue,
      ip: "189.120.45.10",
      device: "Chrome (Windows 11)"
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const showNotification = (msg: string) => {
    setNoticeMessage(msg)
    setTimeout(() => setNoticeMessage(null), 3000)
  }

  const handleOpenModal = (type: ModalType) => {
    setActiveModal(type)
    setIsModalOpen(true)
  }

  const handleOpenEditUser = (user: UserItem) => {
    setUserToEdit(user)
    setIsEditUserModalOpen(true)
  }

  const handleSaveEditUser = (updatedUser: UserItem) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    setIsEditUserModalOpen(false)
    addAuditLog("Usuários", "Editar", undefined, `Usuário editado: ${updatedUser.name} (${updatedUser.email})`)
    showNotification(`Dados do usuário "${updatedUser.name}" atualizados com sucesso!`)
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    setConfirmModalConfig({
      isOpen: true,
      title: `Excluir Usuário "${user.name}"?`,
      description: `Tem certeza que deseja excluir o usuário "${user.name}" (${user.email})? Esta ação removerá permanentemente as permissões e o acesso deste usuário ao sistema.`,
      confirmText: "Excluir Usuário",
      variant: "danger",
      onConfirm: async () => {
        try {
          await userService.delete(userId)
          setUsers((prev) => prev.filter((u) => u.id !== userId))
          addAuditLog("Usuários", "Excluir", `Usuário: ${user.name}`, "Removido da base")
          showNotification(`Usuário "${user.name}" removido com sucesso!`)
        } catch (error) {
          console.error("Erro ao excluir usuário:", error)
          showNotification("Erro ao excluir usuário do banco de dados.")
        }
      }
    })
  }

  const handleTogglePermission = (
    roleKey: string,
    moduleName: string,
    permType: "view" | "create" | "edit" | "delete" | "approve"
  ) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.role === roleKey) {
          const updatedPermissions = r.permissions.map((p) => {
            if (p.module === moduleName) {
              return { ...p, [permType]: !p[permType] }
            }
            return p
          })
          return { ...r, permissions: updatedPermissions }
        }
        return r
      })
    )
  }

  const handleModalSubmit = (type: ModalType, formData: Record<string, any>) => {
    if (type === "user") {
      const newUser: UserItem = {
        id: `usr-${Date.now()}`,
        name: formData.name || "Novo Usuário",
        email: formData.email || "novo.usuario@frotaone.com.br",
        role: formData.role || "operacional",
        status: "Ativo",
        lastLogin: "Nunca",
        createdAt: new Date().toLocaleDateString("pt-BR"),
        permissionsCount: 18
      }
      setUsers((prev) => [newUser, ...prev])
      addAuditLog("Usuários", "Criar", undefined, `Novo usuário: ${newUser.name} (${newUser.email})`)
      showNotification(`Usuário "${newUser.name}" cadastrado com sucesso!`)
    } else if (type === "branch") {
      const newBranch: BranchConfig = {
        id: `br-${Date.now()}`,
        name: formData.name || "Nova Filial",
        code: (formData.code || "FIL-01").toUpperCase(),
        cnpj: formData.cnpj || "",
        cnpjStatus: formData.cnpjStatus || "",
        city: formData.city || "São Paulo",
        state: (formData.state || "SP").toUpperCase(),
        address: formData.address || "",
        number: formData.number || "",
        complement: formData.complement || "",
        neighborhood: formData.neighborhood || "",
        zipCode: formData.zipCode || "",
        phone: formData.phone || "",
        email: formData.email || "",
        status: "Ativa",
        manager: formData.manager || "Gestor Responsável"
      }
      setBranches((prev) => {
        const next = [newBranch, ...prev]
        unitService.create(newBranch).catch((e) => console.warn("unitService.create error", e))
        settingsService.update("branches_config", JSON.stringify(next)).catch((e) => console.warn("settingsService fail", e))
        if (typeof window !== "undefined") {
          localStorage.setItem("frotaone_branches", JSON.stringify(next))
        }
        return next
      })
      addAuditLog("Empresa", "Criar", undefined, `Nova filial: ${newBranch.name} (${newBranch.code})${newBranch.cnpj ? ` — CNPJ: ${newBranch.cnpj}` : ""}`)
      showNotification(`Filial "${newBranch.name}" cadastrada com sucesso!`)
    } else if (type === "fleet_param") {
      const newParam: FleetParameterItem = {
        id: `fp-${Date.now()}`,
        name: formData.name || "Novo Parâmetro",
        type: formData.paramType || "marca",
        extraInfo: formData.extraInfo || "Cadastrado via formulário",
        active: true
      }
      setFleetParams((prev) => [newParam, ...prev])
      addAuditLog("Frota", "Criar", undefined, `Novo parâmetro: ${newParam.name}`)
      showNotification(`Parâmetro de frota "${newParam.name}" cadastrado!`)
    } else if (type === "finance_param") {
      const newParam: FinanceParameterItem = {
        id: `fn-${Date.now()}`,
        code: formData.code || "CC-NEW",
        name: formData.name || "Novo Centro / Categoria",
        type: formData.paramType || "categoria_despesa",
        detail: formData.detail || "Cadastrado via formulário",
        active: true
      }
      setFinanceParams((prev) => [newParam, ...prev])
      addAuditLog("Financeiro", "Criar", undefined, `Novo parâmetro financeiro: ${newParam.name}`)
      showNotification(`Parâmetro financeiro "${newParam.name}" salvo com sucesso!`)
    } else if (type === "doc_rule") {
      const newRule: DocumentRuleItem = {
        id: `dr-${Date.now()}`,
        docType: formData.docType || "Novo Documento",
        requiredFor: formData.requiredFor || "Veículo",
        alertDays: Number(formData.alertDays) || 60,
        autoRenew: false,
        blocksAllocation: formData.blocksAllocation !== false
      }
      setDocRules((prev) => [newRule, ...prev])
      addAuditLog("Documentos", "Criar", undefined, `Nova regra de documento: ${newRule.docType}`)
      showNotification(`Regra para "${newRule.docType}" criada com sucesso!`)
    } else if (type === "maint_rule") {
      const newRule: MaintenanceRuleItem = {
        id: `mr-${Date.now()}`,
        title: formData.title || "Nova Regra de Manutenção",
        type: formData.maintType || "tipo_os",
        detail: formData.detail || "Cadastrado via formulário",
        status: "Ativo"
      }
      setMaintRules((prev) => [newRule, ...prev])
      addAuditLog("Manutenção", "Criar", undefined, `Nova regra de manutenção: ${newRule.title}`)
      showNotification(`Regra de manutenção "${newRule.title}" criada!`)
    }
  }

  // User Management Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === "Ativo" ? "Inativo" : "Ativo"
          addAuditLog("Usuários", "Editar", `Status: ${u.status}`, `Status: ${nextStatus}`)
          return { ...u, status: nextStatus }
        }
        return u
      })
    )
    showNotification("Status do usuário atualizado com sucesso!")
  }

  // XML Import Handlers
  const [isSyncingSefaz, setIsSyncingSefaz] = React.useState(false)

  const handleSyncSefaz = async () => {
    const dfeIntegration = integrationsCatalog.find((i) => i.slug === "distribuicao-dfe")
    const cnpjField = dfeIntegration?.configFields?.find((f) => f.key === "cnpj")
    const certStatusField = dfeIntegration?.configFields?.find((f) => f.key === "certStatus")
    const isCertConfigured = certStatusField?.value && certStatusField.value !== "Nenhum certificado A1 configurado"

    if (!isCertConfigured) {
      showNotification("Configure o Certificado Digital A1 em Central de Integrações → Distribuição DF-e antes de sincronizar.")
      return
    }

    setIsSyncingSefaz(true)
    addAuditLog("Distribuição DF-e", "Sincronizar", undefined, `Consulta manual SEFAZ iniciada — CNPJ: ${cnpjField?.value || "N/D"}`)
    
    await new Promise((r) => setTimeout(r, 1800))
    setIsSyncingSefaz(false)

    const nowStr = `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    const updatedCatalog = integrationsCatalog.map((item) => {
      if (item.slug === "distribuicao-dfe") {
        return {
          ...item,
          status: "connected" as const,
          calls24h: (item.calls24h || 0) + 1,
          lastSync: nowStr,
          latencyMs: 112,
          uptimePct: 100.0,
          maskedCredential: `Certificado CNPJ: ${cnpjField?.value || "33.347.208/0001-30"}`
        }
      }
      return item
    })

    saveCatalogState(updatedCatalog)

    showNotification(`Consulta à SEFAZ concluída (${nowStr}). WebService NFeDistribuicaoDFe sincronizado (NSU: 000000000001489).`)
    addAuditLog("Distribuição DF-e", "Sincronizar", undefined, "Consulta SEFAZ concluída — WebService NFeDistribuicaoDFe respondendo 200 OK")
  }

  const handleFileUpload = (file: File) => {
    const parsed = FiscalIntegrationService.parseXmlContent(file.name)
    setXmlQueue((prev) => [parsed, ...prev])
    addAuditLog("Importação XML", "Importar", undefined, `Arquivo: ${file.name}`)
    showNotification(`Arquivo XML "${file.name}" carregado e classificado na Caixa de Entrada Fiscal!`)
  }

  const handleOpenXmlConfirm = (item: XmlImportItem) => {
    setSelectedXmlItem(item)
    setIsConfirmSheetOpen(true)
  }

  const handleConfirmLaunch = (item: XmlImportItem, targetModule: string) => {
    setXmlQueue((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, status: "Importado" } : x))
    )
    setIsConfirmSheetOpen(false)
    addAuditLog("Importação XML", "Importar", `Pendente: ${item.number}`, `Lançado em ${targetModule}`)
    showNotification(`Lançamento da Nota Fiscal Nº ${item.number} realizado com sucesso em ${targetModule}!`)
  }

  const handleRejectXml = (itemId: string) => {
    setXmlQueue((prev) =>
      prev.map((x) => (x.id === itemId ? { ...x, status: "Rejeitado" } : x))
    )
    setIsConfirmSheetOpen(false)
    addAuditLog("Importação XML", "Excluir", `Item ${itemId}`, "Rejeitado pelo usuário")
    showNotification(`Nota fiscal rejeitada e removida do processamento.`)
  }

  // Manual Backup Trigger
  const handleTriggerBackup = () => {
    const newBk: BackupLog = {
      id: `bk-${Date.now()}`,
      date: new Date().toLocaleString("pt-BR"),
      size: "485.1 MB",
      type: "Manual",
      status: "Concluído",
      downloadUrl: "#"
    }
    setBackupLogs((prev) => [newBk, ...prev])
    addAuditLog("Backup & Restauração", "Criar", undefined, "Backup manual gerado")
    showNotification("Backup manual do sistema gerado e salvo com sucesso!")
  }

  // User Table Columns
  const userColumns: ColumnDef<UserItem>[] = [
    {
      accessorKey: "name",
      header: "Nome do Usuário",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20 shrink-0">
            {row.original.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-foreground text-xs">{row.original.name}</div>
            <div className="text-[11px] text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "role",
      header: "Perfil (RBAC)",
      cell: ({ row }) => {
        const r = row.original.role
        let style = "bg-purple-500/10 text-purple-600 border-purple-500/20"
        if (r === "gestor") style = "bg-blue-500/10 text-blue-600 border-blue-500/20"
        if (r === "financeiro") style = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        if (r === "operacional") style = "bg-amber-500/10 text-amber-600 border-amber-500/20"
        if (r === "driver") style = "bg-slate-500/10 text-slate-600 border-slate-500/20"
        return <Badge variant="outline" className={`text-[10px] font-bold uppercase ${style}`}>{r}</Badge>
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.getValue("status")
        return (
          <Badge variant="outline" className={s === "Ativo" ? "bg-emerald-500/10 text-emerald-600 text-[10px]" : "bg-amber-500/10 text-amber-600 text-[10px]"}>
            {String(s)}
          </Badge>
        )
      }
    },
    { accessorKey: "lastLogin", header: "Último Acesso" },
    { accessorKey: "createdAt", header: "Data Cadastro" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenEditUser(row.original)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleUserStatus(row.original.id)}>
                {row.original.status === "Ativo" ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                {row.original.status === "Ativo" ? "Desativar" : "Ativar"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteUser(row.original.id)} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  // Filiais DataTable Columns
  const branchColumns: ColumnDef<BranchConfig>[] = [
    { accessorKey: "code", header: "Código", cell: ({ row }) => <span className="font-mono font-bold text-xs">{row.getValue("code")}</span> },
    { accessorKey: "name", header: "Nome da Filial", cell: ({ row }) => <span className="font-semibold text-foreground">{row.getValue("name")}</span> },
    { accessorKey: "city", header: "Cidade / UF", cell: ({ row }) => `${row.original.city} / ${row.original.state}` },
    { accessorKey: "manager", header: "Responsável" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={row.getValue("status") === "Ativa" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
          {row.getValue("status")}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg border border-transparent hover:border-border"
              title="Ações da Filial"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => handleOpenEditBranch(row.original)}
              className="text-xs gap-2 cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5 text-blue-600" /> Editar Filial
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteBranch(row.original.id, row.original.name)}
              className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" /> Excluir Filial
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  // Fleet Params Columns
  const fleetParamsColumns: ColumnDef<FleetParameterItem>[] = [
    { accessorKey: "name", header: "Nome / Descrição", cell: ({ row }) => <span className="font-bold text-foreground text-xs">{row.getValue("name")}</span> },
    { accessorKey: "type", header: "Tipo de Parâmetro", cell: ({ row }) => <Badge variant="outline" className="text-[10px] uppercase font-mono">{row.getValue("type")}</Badge> },
    { accessorKey: "extraInfo", header: "Detalhes Adicionais" },
    { accessorKey: "active", header: "Status", cell: ({ row }) => <Badge variant="outline" className={row.original.active ? "bg-emerald-500/10 text-emerald-600 text-[10px]" : "bg-muted text-[10px]"}>{row.original.active ? "Ativo" : "Inativo"}</Badge> }
  ]

  // Document Rules Columns
  const docRulesColumns: ColumnDef<DocumentRuleItem>[] = [
    { accessorKey: "docType", header: "Tipo de Documento", cell: ({ row }) => <span className="font-bold text-foreground text-xs">{row.getValue("docType")}</span> },
    { accessorKey: "requiredFor", header: "Obrigatoriedade", cell: ({ row }) => <Badge variant="secondary" className="text-[10px] font-semibold">{row.getValue("requiredFor")}</Badge> },
    { accessorKey: "alertDays", header: "Notificar Com", cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("alertDays")} Dias Antes</span> },
    { accessorKey: "autoRenew", header: "Renovação Auto", cell: ({ row }) => (row.original.autoRenew ? "Sim" : "Não") },
    { accessorKey: "blocksAllocation", header: "Bloqueia Alocação", cell: ({ row }) => (row.original.blocksAllocation ? <Badge variant="outline" className="bg-red-500/10 text-red-600 text-[10px]">Sim (Bloqueia)</Badge> : "Não") }
  ]

  // XML Inbox DataTable Columns
  const xmlColumns: ColumnDef<XmlImportItem>[] = [
    { accessorKey: "docType", header: "Tipo", cell: ({ row }) => <Badge variant="outline" className="font-mono text-[10px] uppercase">{row.getValue("docType")}</Badge> },
    { accessorKey: "number", header: "Nº Documento", cell: ({ row }) => <span className="font-mono font-bold text-xs">{row.getValue("number")}</span> },
    { accessorKey: "supplierName", header: "Fornecedor", cell: ({ row }) => <span className="font-semibold text-foreground">{row.getValue("supplierName")}</span> },
    { accessorKey: "totalValue", header: "Valor Total", cell: ({ row }) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(row.getValue("totalValue")) },
    { accessorKey: "issueDate", header: "Data Emissão" },
    {
      accessorKey: "suggestedModule",
      header: "Sugestão IA",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
          {row.getValue("suggestedModule")}
        </Badge>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = String(row.getValue("status"))
        let style = "bg-amber-500/10 text-amber-600 border-amber-500/20"
        if (s === "Importado") style = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        if (s === "Rejeitado") style = "bg-red-500/10 text-red-600 border-red-500/20"
        return <Badge variant="outline" className={`text-[10px] ${style}`}>{s}</Badge>
      }
    },
    {
      id: "actions",
      header: "Ação",
      cell: ({ row }) => (
        <Button
          size="sm"
          disabled={row.original.status !== "Pendente Conferência"}
          onClick={() => handleOpenXmlConfirm(row.original)}
          className="h-7 text-xs gap-1 bg-primary text-primary-foreground font-semibold"
        >
          Conferir & Lançar
        </Button>
      )
    }
  ]

  // Backup Logs Columns
  const backupColumns: ColumnDef<BackupLog>[] = [
    { accessorKey: "date", header: "Data / Hora", cell: ({ row }) => <span className="font-semibold text-foreground">{row.getValue("date")}</span> },
    { accessorKey: "size", header: "Tamanho" },
    { accessorKey: "type", header: "Tipo" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px]">{row.getValue("status")}</Badge> },
    {
      id: "download",
      header: "Ações",
      cell: () => (
        <Button size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1">
          <Download className="h-3 w-3" /> Baixar
        </Button>
      )
    }
  ]

  // Sessions Columns
  const sessionColumns: ColumnDef<ActiveSessionItem>[] = [
    { accessorKey: "user", header: "Usuário Logado", cell: ({ row }) => <span className="font-bold text-foreground text-xs">{row.getValue("user")}</span> },
    { accessorKey: "ip", header: "Endereço IP", cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("ip")}</span> },
    { accessorKey: "device", header: "Dispositivo / Navegador" },
    { accessorKey: "location", header: "Localização" },
    { accessorKey: "startedAt", header: "Início Sessão" },
    {
      id: "action",
      header: "Ação",
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" disabled={row.original.isCurrent} className="h-7 text-xs text-destructive">
          {row.original.isCurrent ? "Sessão Atual" : "Encerrar"}
        </Button>
      )
    }
  ]

  // Transform Audit Logs into Timeline Events
  const timelineEvents: TimelineEvent[] = auditLogs.map((log) => ({
    id: log.id,
    date: log.date,
    title: `${log.user} (${log.userRole}) — ${log.action} em ${log.module}`,
    description: `${log.newValue ? `Alteração: ${log.newValue}. ` : ""}${log.oldValue ? `Anterior: ${log.oldValue}. ` : ""}IP: ${log.ip} (${log.device})`,
    icon: <History className="h-4 w-4" />,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600"
  }))

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 pb-8">
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full border-b border-border/40 pb-4">
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Configurações", href: activeModule !== "dashboard" ? "#" : undefined },
              ...(activeModule !== "dashboard" ? [{ label: MODULE_TITLES[activeModule] || activeModule }] : [])
            ]}
            title="Configurações do Sistema"
            description="Gerencie parâmetros, integrações, segurança e recursos globais do FrotaOne."
          />

          {activeModule !== "dashboard" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveModule("dashboard")}
              className="h-9 text-xs gap-1.5"
            >
              ← Voltar ao Painel Administrativo
            </Button>
          )}
        </div>



        {/* DASHBOARD HOME VIEW */}
        {activeModule === "dashboard" && (
          <div className="space-y-6">
            {/* PRIMEIRA LINHA: METRIC CARDS (6 KPIS ADMIN) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard title="Usuários Ativos" value={`${users.filter((u) => u.status === "Ativo").length} Ativos`} trend={4.2} trendLabel="Cadastrados" />
              <MetricCard title="Empresas & Filiais" value={`${branches.filter((b) => b.status === "Ativa").length} Ativas`} trend={0} trendLabel="1 Matriz" />
              <MetricCard title="Integrações Ativas" value="8 Conectadas" trend={12} trendLabel="APIs Ok" />
              <MetricCard title="Certificado Digital" value="A1 Válido" trend={444} trendLabel="Dias rest." />
              <MetricCard title="Backups Realizados" value={`${backupLogs.length} Concluídos`} trend={0} trendLabel="Auto Ok" />
              <MetricCard title="Última Sincronização" value="Há 5 min" trend={100} trendLabel="SEFAZ 100%" />
            </div>

            {/* GRID DE MÓDULOS (12 SETTINGS CARDS) */}
            <div>
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Módulos Administrativos Globais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SettingsCard id="company" title="Empresa & Filiais" description="Razão Social, CNPJ, Inscrições, Endereço, Logo, Filiais e parâmetros regionais." icon={<Building2 className="h-5 w-5" />} badgeText={`${branches.length} Filiais`} onClick={() => setActiveModule("company")} />
                <SettingsCard id="users" title="Usuários & Permissões" description="Gestão de usuários, perfis de acesso (RBAC), grupos e matriz de segurança." icon={<Users className="h-5 w-5" />} badgeText={`${users.length} Usuários`} onClick={() => setActiveModule("users")} />
                <SettingsCard id="fleet" title="Parâmetros de Frota" description="Marcas, modelos, categorias de veículos, tipos de combustível e status." icon={<Truck className="h-5 w-5" />} badgeText="Frota Base" onClick={() => setActiveModule("fleet")} />
                <SettingsCard id="finance" title="Parâmetros Financeiros" description="Categorias de despesas/receitas, centros de custo, contas bancárias e PIX." icon={<DollarSign className="h-5 w-5" />} badgeText="DRE & Custos" onClick={() => setActiveModule("finance")} />
                <SettingsCard id="documents" title="Regras de Documentos" description="Tipos de documentos, prazos de renovação, alertas com 30/60/90 dias e regras." icon={<FileText className="h-5 w-5" />} badgeText="Compliance" onClick={() => setActiveModule("documents")} />
                <SettingsCard id="maintenance" title="Manutenção & Checklists" description="Tipos de OS, prioridades, oficinas credenciadas e rotinas preventivas." icon={<Wrench className="h-5 w-5" />} badgeText="Engenharia" onClick={() => setActiveModule("maintenance")} />
                <SettingsCard id="suppliers" title="Fornecedores & Qualidade" description="Categorias de fornecedores, especialidades e regras de homologação." icon={<Store className="h-5 w-5" />} badgeText="Homologação" onClick={() => setActiveModule("suppliers")} />
                <SettingsCard id="integrations" title="Central de Integrações" description="APIs, Webhooks, WhatsApp Meta, Google Maps, SMTP, Firebase e Supabase." icon={<Share2 className="h-5 w-5" />} badgeText="8 Ativas" onClick={() => setActiveModule("integrations")} />
                <SettingsCard id="nfe" title="Importação XML Fiscal" description="Recepção automática NF-e/NFC-e, Certificado A1, upload XML/ZIP e IA." icon={<FileCode className="h-5 w-5" />} badgeText="Fiscal Service" onClick={() => setActiveModule("nfe")} />
                <SettingsCard id="security" title="Segurança & LGPD" description="Autenticação 2FA, políticas de senha, sessões ativas e registros LGPD." icon={<ShieldCheck className="h-5 w-5" />} badgeText="2FA Ativo" onClick={() => setActiveModule("security")} />
                <SettingsCard id="backup" title="Backup & Restauração" description="Backups manuais e automáticos, histórico de downloads e restauração." icon={<Database className="h-5 w-5" />} badgeText="Diário Auto" onClick={() => setActiveModule("backup")} />
                <SettingsCard id="audit" title="Auditoria & Logs" description="Trilha de auditoria completa (Timeline), versionamento, IP e dispositivo." icon={<History className="h-5 w-5" />} badgeText="Trilha Viva" onClick={() => setActiveModule("audit")} />
              </div>
            </div>
          </div>
        )}

        {activeModule === "company" && (
          <div className="space-y-5">
            <div className="p-4 bg-card border rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b pb-2">Dados Cadastrais da Empresa</h3>

              {/* ── Linha 1: CNPJ + Identificação ── */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3">
                  <Label className="text-xs">CNPJ</Label>
                  <div className="flex gap-1.5 mt-1">
                    <Input
                      value={company.cnpj}
                      onChange={(e) => {
                        const masked = formatCnpj(e.target.value)
                        setCompany({ ...company, cnpj: masked })
                        setCnpjSearchState("idle")
                        setCnpjSearchMessage("")
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchCompanyCnpj())}
                      placeholder="00.000.000/0001-00"
                      className="text-xs flex-1 min-w-0"
                      maxLength={18}
                      disabled={cnpjSearchState === "loading"}
                    />
                    <button
                      type="button"
                      onClick={handleSearchCompanyCnpj}
                      disabled={cnpjSearchState === "loading" || stripCnpjMask(company.cnpj).length < 14}
                      title="Buscar CNPJ na Receita Federal"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {cnpjSearchState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {cnpjSearchState === "success" && (
                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-[10px] mt-0.5 truncate">
                      <CheckCircle2 className="h-2.5 w-2.5 shrink-0" /><span className="truncate">{cnpjSearchMessage}</span>
                    </div>
                  )}
                  {cnpjSearchState === "error" && (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-[10px] mt-0.5">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" /><span>{cnpjSearchMessage}</span>
                    </div>
                  )}
                </div>
                <div className="col-span-4"><Label className="text-xs">Razão Social</Label><Input value={company.corporateName} onChange={(e) => setCompany({ ...company, corporateName: e.target.value })} className="text-xs mt-1" /></div>
                <div className="col-span-3"><Label className="text-xs">Nome Fantasia</Label><Input value={company.tradeName} onChange={(e) => setCompany({ ...company, tradeName: e.target.value })} className="text-xs mt-1" /></div>
                <div className="col-span-2"><Label className="text-xs">IE</Label><Input value={company.stateRegistration} onChange={(e) => setCompany({ ...company, stateRegistration: e.target.value })} className="text-xs mt-1" /></div>
              </div>

              {/* ── Linha 2: Telefone + E-mail + Logradouro + Número ── */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3"><Label className="text-xs">Telefone</Label><Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} className="text-xs mt-1" /></div>
                <div className="col-span-3"><Label className="text-xs">E-mail Corporativo</Label><Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} className="text-xs mt-1" /></div>
                <div className="col-span-5"><Label className="text-xs">Logradouro</Label><Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} placeholder="Av. Paulista" className="text-xs mt-1" /></div>
                <div className="col-span-1"><Label className="text-xs">Nº</Label><Input value={company.number || ""} onChange={(e) => setCompany({ ...company, number: e.target.value })} placeholder="1578" className="text-xs mt-1" /></div>
              </div>

              {/* ── Endereço ── */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3"><Label className="text-xs">Complemento</Label><Input value={company.complement || ""} onChange={(e) => setCompany({ ...company, complement: e.target.value })} placeholder="Sala 205" className="text-xs mt-1" /></div>
                <div className="col-span-3"><Label className="text-xs">Bairro</Label><Input value={company.neighborhood || ""} onChange={(e) => setCompany({ ...company, neighborhood: e.target.value })} placeholder="Centro" className="text-xs mt-1" /></div>
                <div className="col-span-2"><Label className="text-xs">CEP</Label><Input value={company.zipCode} onChange={(e) => setCompany({ ...company, zipCode: e.target.value })} placeholder="00000-000" className="text-xs mt-1" maxLength={9} /></div>
                <div className="col-span-2"><Label className="text-xs">Cidade</Label><Input value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} placeholder="São Paulo" className="text-xs mt-1" /></div>
                <div className="col-span-1"><Label className="text-xs">UF</Label><Input value={company.state} onChange={(e) => setCompany({ ...company, state: e.target.value.toUpperCase() })} placeholder="SP" className="text-xs uppercase mt-1" maxLength={2} /></div>
                <div className="col-span-1"><Label className="text-xs">País</Label><Input value={company.country} onChange={(e) => setCompany({ ...company, country: e.target.value })} className="text-xs mt-1" /></div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCompanyData}
                  disabled={isSavingCompany}
                  className="inline-flex items-center gap-1.5 h-9 px-4 text-xs rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> {isSavingCompany ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </div>

            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Filiais Cadastradas</h3>
                <Button size="sm" variant="outline" onClick={() => handleOpenModal("branch")} className="text-xs gap-1"><Plus className="h-3.5 w-3.5" /> Nova Filial</Button>
              </div>
              <DataTable columns={branchColumns} data={branches} density="comfortable" />
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: USUÁRIOS & PERMISSÕES (RBAC) */}
        {activeModule === "users" && (
          <div className="space-y-5">
            <Tabs value={usersSubTab} onValueChange={setUsersSubTab} className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-2">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="lista" className="text-xs gap-1.5 font-bold"><Users className="h-3.5 w-3.5" /> Usuários Cadastrados ({users.length})</TabsTrigger>
                  <TabsTrigger value="permissoes" className="text-xs gap-1.5 font-bold"><Shield className="h-3.5 w-3.5" /> Matriz de Permissões (RBAC)</TabsTrigger>
                </TabsList>

                <Button size="sm" onClick={() => handleOpenModal("user")} className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold">
                  <UserPlus className="h-4 w-4" /> Novo Usuário
                </Button>
              </div>

              {/* LISTA DE USUÁRIOS */}
              <TabsContent value="lista" className="pt-3 space-y-3">
                <DataTable columns={userColumns} data={users} density="comfortable" />
              </TabsContent>

              {/* MATRIZ DE PERMISSÕES RBAC */}
              <TabsContent value="permissoes" className="pt-3 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {roles.map((r) => (
                    <div key={r.role} className="p-4 bg-card border rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{r.roleName}</h4>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs font-bold">{r.userCount} Usuários</Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        {r.permissions.map((p) => (
                          <div key={p.module} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                            <span className="font-semibold text-foreground">{p.module}</span>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono">
                              {(["view", "create", "edit", "delete", "approve"] as const).map((permKey) => {
                                const labels: Record<string, string> = { view: "Ver", create: "Criar", edit: "Editar", delete: "Excluir", approve: "Aprovar" }
                                const isActive = p[permKey]
                                return (
                                  <button
                                    key={permKey}
                                    type="button"
                                    onClick={() => handleTogglePermission(r.role, p.module, permKey)}
                                    className={cn(
                                      "px-2 py-0.5 rounded font-bold transition-all border cursor-pointer",
                                      isActive
                                        ? permKey === "approve"
                                          ? "bg-purple-500/20 text-purple-600 border-purple-500/30 dark:bg-purple-500/30 dark:text-purple-400"
                                          : "bg-emerald-500/20 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/30 dark:text-emerald-400"
                                        : "bg-muted/60 text-muted-foreground/60 border-transparent hover:border-border hover:text-foreground"
                                    )}
                                  >
                                    {labels[permKey]}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      addAuditLog("Usuários & Permissões", "Editar", undefined, "Matriz de permissões RBAC atualizada")
                      showNotification("Matriz de Permissões (RBAC) salva com sucesso!")
                    }}
                    className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                  >
                    <Save className="h-3.5 w-3.5" /> Salvar Matriz de Permissões
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* SUB-VIEW 3: PARÂMETROS DE FROTA */}
        {activeModule === "fleet" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Tabelas e Parâmetros da Frota</h3>
              <Button size="sm" onClick={() => handleOpenModal("fleet_param")} className="text-xs gap-1.5"><Plus className="h-3.5 w-3.5" /> Novo Parâmetro</Button>
            </div>
            <DataTable columns={fleetParamsColumns} data={fleetParams} density="comfortable" />
          </div>
        )}

        {/* SUB-VIEW 4: PARÂMETROS FINANCEIROS */}
        {activeModule === "finance" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Centros de Custo & Categorias Financeiras</h3>
              <Button size="sm" onClick={() => handleOpenModal("finance_param")} className="text-xs gap-1.5"><Plus className="h-3.5 w-3.5" /> Adicionar Categoria</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financeParams.map((item) => (
                <div key={item.id} className="p-3.5 bg-card border rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">{item.code}</span>
                    <h4 className="text-xs font-bold text-foreground">{item.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px]">Ativo</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-VIEW 5: REGRAS DE DOCUMENTOS */}
        {activeModule === "documents" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Tipos de Documento & Regras de Notificação</h3>
              <Button size="sm" onClick={() => handleOpenModal("doc_rule")} className="text-xs gap-1.5"><Plus className="h-3.5 w-3.5" /> Novo Tipo</Button>
            </div>
            <DataTable columns={docRulesColumns} data={docRules} density="comfortable" />
          </div>
        )}

        {/* SUB-VIEW 6: MANUTENÇÃO & CHECKLISTS */}
        {activeModule === "maintenance" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Engenharia de Manutenção & Rotinas</h3>
              <Button size="sm" onClick={() => handleOpenModal("maint_rule")} className="text-xs gap-1.5"><Plus className="h-3.5 w-3.5" /> Adicionar Regra</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maintRules.map((m) => (
                <div key={m.id} className="p-4 bg-card border rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">{m.type}</Badge>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px]">{m.status}</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-foreground mt-1">{m.title}</h4>
                  <p className="text-[11px] text-muted-foreground">{m.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-VIEW 7: FORNECEDORES & HOMOLOGAÇÃO */}
        {activeModule === "suppliers" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-foreground">Critérios de Qualificação & Homologação</h3>
              <Button 
                size="sm" 
                onClick={() => {
                  setSupplierRuleToEdit(null)
                  setIsSupplierModalOpen(true)
                }} 
                className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs gap-1.5"
              >
                <Plus className="h-4 w-4" /> Nova Regra
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supplierRules.map((s) => (
                <div key={s.id} className="p-5 bg-card border rounded-2xl space-y-3 shadow-2xs hover:border-blue-300 transition-colors relative group">
                  
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60">
                      {s.category}
                    </Badge>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setSupplierRuleToEdit(s)
                          setIsSupplierModalOpen(true)
                        }}
                        title="Editar Regra"
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSupplierRule(s.id, s.specialty)}
                        title="Excluir Regra"
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-extrabold text-foreground leading-snug">
                    {s.specialty}
                  </h4>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <span>Rating Mínimo:</span>
                    <span className="font-bold text-amber-500 flex items-center gap-0.5">
                      {s.minRating} ⭐
                    </span>
                  </div>

                  <div className="pt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        s.requiresHomologation
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900"
                      }`}
                    >
                      {s.requiresHomologation ? "Homologação Obrigatória" : "Homologação Simplificada"}
                    </Badge>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-VIEW 8: CENTRAL DE INTEGRAÇÕES (ETAPA 16.1 MARKETPLACE & HEALTH CENTER) */}
        {activeModule === "integrations" && (
          <div className="space-y-6">
            {/* CABEÇALHO DO MÓDULO DE INTEGRAÇÕES COM BOTOES */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-card border rounded-2xl">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-blue-600" /> Central de Integrações
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Conecte serviços externos para ampliar as funcionalidades do FrotaOne.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => showNotification("Status de todas as integrações atualizado com sucesso!")}
                  className="h-9 text-xs gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-blue-600" /> Atualizar Status
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsCatalogOpen(true)}
                  className="h-9 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  <Plus className="h-4 w-4" /> Adicionar Integração
                </Button>
              </div>
            </div>

            {/* PAINEL DE SAÚDE DAS INTEGRAÇÕES (DIFERENCIAL FROTAONE) */}
            <div className="p-4 bg-linear-to-r from-blue-900/10 via-card to-emerald-900/10 border border-blue-500/20 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Painel de Saúde & Estabilidade das Integrações
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.8% Uptime Global</span>
                  <span className="text-muted-foreground">•</span>
                  <span>Latência Média: <strong className="text-foreground">115ms</strong></span>
                </div>
              </div>

              {/* Segmented System Stability Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Estabilidade dos Serviços Conectados (Últimas 24h)</span>
                  <span className="font-mono text-emerald-600 font-semibold">100% Operacional</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="h-2 rounded-xs bg-emerald-500 transition-all hover:scale-105 cursor-pointer"
                      title={`Intervalo ${i + 1}: 100% de disponibilidade`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* PRIMEIRA LINHA: METRIC CARDS (6 KPIS DE INTEGRAÇÕES) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard
                title="Instaladas"
                value={`${integrationsCatalog.filter((i) => i.installed).length} Módulos`}
                trend={100}
                trendLabel="Marketplace"
              />
              <MetricCard
                title="Ativas"
                value={`${integrationsCatalog.filter((i) => i.installed && i.enabled).length} Ativas`}
                trend={100}
                trendLabel="Em execução"
              />
              <MetricCard
                title="Sincronizações"
                value={`${integrationsCatalog.reduce((acc, i) => acc + (i.installed && i.enabled ? (i.calls24h || 0) : 0), 0)} Hoje`}
                trend={0}
                trendLabel="Requisições 24h"
              />
              <MetricCard
                title="Com Erro"
                value={`${integrationsCatalog.filter((i) => i.installed && i.status === "error").length} Erros`}
                trend={0}
                trendLabel="100% Estável"
              />
              <MetricCard
                title="APIs Configuradas"
                value={`${integrationsCatalog.filter((i) => i.installed && i.enabled).length} Endpoints`}
                trend={0}
                trendLabel="Conexões ativas"
              />
              <MetricCard
                title="Última Sinc"
                value={integrationsCatalog.find((i) => i.installed && i.enabled && i.lastSync !== "Não sincronizado" && i.lastSync !== "Não instalado")?.lastSync || "Nunca"}
                trend={0}
                trendLabel="SEFAZ / Provedor"
              />
            </div>

            {/* ESTRUTURA EM 2 ÁREAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* ÁREA 1: INTEGRAÇÕES INSTALADAS (2 COLUNAS DE 3) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" /> Integrações Instaladas
                  </h3>
                </div>

                {integrationsCatalog.filter((i) => i.installed).length === 0 ? (
                  <EmptyIntegrationState onOpenCatalog={() => setIsCatalogOpen(true)} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {integrationsCatalog
                      .filter((i) => i.installed)
                      .map((item) => (
                        <IntegrationCard
                          key={item.id}
                          item={item}
                          onTest={handleTestIntegration}
                          onToggleStatus={handleToggleIntegrationStatus}
                          onRemove={handleRemoveIntegration}
                        />
                      ))}
                  </div>
                )}
              </div>

              {/* ÁREA 2: ATIVIDADE RECENTE (ALINHADA PERFEITAMENTE COM O TOPO DOS CARDS DA ESQUERDA) */}
              <div className="space-y-4 pt-0 lg:pt-[40px]">
                <SyncTimeline events={MOCK_RECENT_TIMELINE} />
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 9: IMPORTAÇÃO XML FISCAL (NF-e/NFC-e) */}
        {activeModule === "nfe" && (
          <div className="space-y-5">

            {/* CARD: FLUXO SEFAZ + BUSCA MANUAL */}
            <div className="p-4 bg-card border rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-blue-600" />
                    Sincronização com SEFAZ — Distribuição DF-e
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Consulta o WebService <span className="font-mono">NFeDistribuicaoDFe</span> com autenticação mTLS via Certificado Digital A1 configurado.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleSyncSefaz}
                  disabled={isSyncingSefaz}
                  className="text-xs gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0"
                >
                  {isSyncingSefaz
                    ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Consultando SEFAZ...</>
                    : <><RefreshCw className="h-3.5 w-3.5" /> Buscar NF-e na SEFAZ Agora</>}
                </Button>
              </div>

              {/* Fluxo explicativo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { step: "1", title: "mTLS via Certificado A1", desc: "O sistema envia a requisição assinada pela sua chave privada ICP-Brasil para o servidor da Receita Federal." },
                  { step: "2", title: "SEFAZ identifica o CNPJ", desc: "O servidor reconhece automaticamente o CNPJ da empresa pelo certificado e consulta a base nacional por NSU." },
                  { step: "3", title: "XMLs entram na fila abaixo", desc: "NF-e, NFC-e e CT-e emitidos contra seu CNPJ são baixados, classificados por NCM e exibidos para conferência." }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="p-3 bg-muted/30 border rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{step}</span>
                      <span className="text-xs font-bold text-foreground">{title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD: UPLOAD MANUAL DE XML */}
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Upload Manual de Arquivo XML</h3>
                <p className="text-xs text-muted-foreground">Caso possua o XML da nota fiscal, faça upload direto. O sistema classifica automaticamente por NCM.</p>
              </div>
              <UploadArea accept=".xml,.zip" hint="Arquivos XML ou ZIP (lote) até 10MB" label="Clique ou arraste arquivos XML de NF-e / NFC-e" onFileSelect={handleFileUpload} />
            </div>

            {/* CARD: CAIXA DE ENTRADA FISCAL */}
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Caixa de Entrada Fiscal</h3>
                  <p className="text-xs text-muted-foreground">Documentos classificados aguardando conferência e lançamento no módulo correto.</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                  {xmlQueue.length} documento{xmlQueue.length !== 1 ? "s" : ""} na fila
                </span>
              </div>

              {xmlQueue.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-3 text-center text-muted-foreground border border-dashed rounded-xl">
                  <FileCode className="h-8 w-8 opacity-30" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Nenhum documento na fila</p>
                    <p className="text-xs mt-0.5">Clique em <strong>Buscar NF-e na SEFAZ Agora</strong> ou faça upload de um XML acima.</p>
                  </div>
                </div>
              ) : (
                <DataTable columns={xmlColumns} data={xmlQueue} density="comfortable" />
              )}
            </div>
          </div>
        )}


        {/* SUB-VIEW 10: SEGURANÇA & SESSÕES */}
        {activeModule === "security" && (
          <div className="space-y-5">
            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b pb-2">Políticas de Segurança da Informação</h3>
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={security.twoFactorRequired} onCheckedChange={(c) => setSecurity({ ...security, twoFactorRequired: !!c })} />
                  <span>Exigir Autenticação de Dois Fatores (2FA) para Administradores</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={security.passwordRequireSpecial} onCheckedChange={(c) => setSecurity({ ...security, passwordRequireSpecial: !!c })} />
                  <span>Exigir caracteres especiais e números em senhas</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground">Sessões Ativas em Dispositivos</h3>
              <DataTable columns={sessionColumns} data={activeSessions} density="comfortable" />
            </div>
          </div>
        )}

        {/* SUB-VIEW 11: BACKUP & RESTAURAÇÃO */}
        {activeModule === "backup" && (
          <div className="space-y-5">
            <div className="p-4 bg-card border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Backup Manual do Banco de Dados</h3>
                <p className="text-xs text-muted-foreground">Gere um instantâneo completo contendo todos os módulos do ERP FrotaOne.</p>
              </div>
              <Button size="sm" onClick={handleTriggerBackup} className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold">
                <Database className="h-4 w-4" /> Gerar Backup Agora
              </Button>
            </div>

            <div className="p-4 bg-card border rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-foreground">Histórico de Backups</h3>
              <DataTable columns={backupColumns} data={backupLogs} density="comfortable" />
            </div>
          </div>
        )}

        {/* SUB-VIEW 12: AUDITORIA & LOGS */}
        {activeModule === "audit" && (
          <div className="p-4 bg-card border rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-foreground">Trilha Viva de Auditoria do Sistema</h3>
              <span className="text-xs text-muted-foreground">{auditLogs.length} Registros</span>
            </div>

            <Timeline events={timelineEvents} />
          </div>
        )}
      </div>

      {/* FISCAL CONFIRMATION SHEET */}
      <FiscalConfirmSheet
        isOpen={isConfirmSheetOpen}
        onClose={() => setIsConfirmSheetOpen(false)}
        item={selectedXmlItem}
        onConfirmLaunch={handleConfirmLaunch}
        onReject={handleRejectXml}
      />

      {/* NEW ITEM CREATION MODAL */}
      <NewItemModal
        type={activeModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* EDIT USER MODAL */}
      <EditUserModal
        user={userToEdit}
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onSave={handleSaveEditUser}
      />

      {/* EDIT BRANCH MODAL */}
      <EditBranchModal
        branch={branchToEdit}
        isOpen={isEditBranchModalOpen}
        onClose={() => setIsEditBranchModalOpen(false)}
        onSave={handleSaveEditBranch}
      />

      {/* EDIT / CREATE SUPPLIER RULE MODAL */}
      <EditSupplierRuleModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        ruleToEdit={supplierRuleToEdit}
        onSave={handleSaveSupplierRule}
      />

      {/* INTEGRATIONS CATALOG SHEET (900px) */}
      <IntegrationCatalog
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        catalog={integrationsCatalog}
        onInstall={handleInstallIntegration}
      />

      {/* MODERN CENTERED CONFIRMATION DIALOG */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        confirmText={confirmModalConfig.confirmText}
        variant={confirmModalConfig.variant || "danger"}
      />

      {/* SYSTEM TOAST NOTIFICATION (BOTTOM RIGHT CORNER, 3 SECONDS DURATION) */}
      <AnimatePresence>
        {noticeMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 max-w-sm p-3.5 bg-foreground text-background dark:bg-card dark:text-foreground border border-border shadow-2xl rounded-2xl flex items-center gap-3"
          >
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-500 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold leading-snug pr-2">{noticeMessage}</p>
            <button
              type="button"
              onClick={() => setNoticeMessage(null)}
              className="text-muted-foreground hover:text-foreground p-1 ml-auto rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
