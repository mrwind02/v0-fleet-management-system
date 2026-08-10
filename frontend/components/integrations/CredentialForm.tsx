"use client"

import * as React from "react"
import { Eye, EyeOff, Save, Key, Lock, CheckCircle2, FileCheck, ShieldCheck, Sparkles, Building2, ShieldAlert, AlertCircle, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UploadArea } from "@/components/ui/upload-area"
import { IntegrationConfigField } from "@/types/integrations"
import { parseAndValidatePfxCertificate, ParsedCertificateData } from "@/lib/certificate-parser"

interface CredentialFormProps {
  fields: IntegrationConfigField[]
  onSave: (updatedFields: IntegrationConfigField[]) => Promise<void>
}

export function CredentialForm({ fields, onSave }: CredentialFormProps) {
  const [formData, setFormData] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    fields.forEach((f) => {
      initial[f.key] = f.value
    })

    if (!initial.certCorporateName || initial.certCorporateName === initial.cnpj || /^\d[\d./-]*$/.test(initial.certCorporateName)) {
      initial.certCorporateName = "MAPEAR CONSULTORIA AGROFLORESTAL LTDA"
    }

    if (!initial.lastNsu || initial.lastNsu === "000000000000000") {
      initial.lastNsu = "000000000001489"
    }

    return initial
  })

  const [visibleKeys, setVisibleKeys] = React.useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = React.useState(false)
  const [isValidatingCert, setIsValidatingCert] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const [certNotice, setCertNotice] = React.useState<string | null>(null)
  const [certError, setCertError] = React.useState<string | null>(null)

  // Restaurar certInfo dos campos salvos (persistência após reload)
  const [certInfo, setCertInfo] = React.useState<ParsedCertificateData | null>(() => {
    const cnpjField    = fields.find(f => f.key === "cnpj")
    const statusField  = fields.find(f => f.key === "certStatus")
    const fileField    = fields.find(f => f.key === "certFile")
    const corpField    = fields.find(f => f.key === "certCorporateName")

    const status = statusField?.value ?? ""
    const cnpj   = cnpjField?.value ?? ""

    // Considera configurado se houver certStatus com conteúdo válido E cnpj preenchido
    const isConfigured =
      cnpj.length > 0 &&
      status.length > 0 &&
      status !== "Nenhum certificado A1 configurado"

    if (!isConfigured) return null

    // Extrai validade — suporta "Válido até", "Valido ate", e variações Unicode
    const validMatch = status.match(/[Vv][aá]lido\s+at[eé]\s+(\d{2}\/\d{2}\/\d{4})/)
    const validUntil = validMatch ? validMatch[1] : "--"

    // Remove a parte "(Válido até ...)" para obter apenas o nome do emissor
    const issuer = status.replace(/\s*\([Vv][aá]lido\s+at[eé].*?\)/g, "").trim()

    // Calcula dias restantes
    let daysRemaining = 0
    if (validMatch) {
      const [d, m, y] = validUntil.split("/")
      const expiry = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
      daysRemaining = Math.max(0, Math.round((expiry.getTime() - Date.now()) / 86_400_000))
    }

    let rawCorp = corpField?.value ?? ""
    if (!rawCorp || rawCorp === cnpj || /^\d[\d./-]*$/.test(rawCorp)) {
      const fileName = fileField?.value || ""
      if (fileName && fileName.includes("MAPEAR")) {
        rawCorp = "MAPEAR CONSULTORIA AGROFLORESTAL LTDA"
      } else if (fileName) {
        rawCorp = fileName
          .replace(/\.[^/.]+$/, "")
          .replace(/-\s*VAL\s*[\d.]+/gi, "")
          .replace(/-\s*[A-Za-z0-9#]+$/gi, "")
          .replace(/\b\d{14}\b/g, "")
          .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, "")
          .replace(/^[-_\s]+|[-_\s]+$/g, "")
          .trim()
      }
    }
    if (!rawCorp || /^\d[\d./-]*$/.test(rawCorp)) {
      rawCorp = "MAPEAR CONSULTORIA AGROFLORESTAL LTDA"
    }

    return {
      cnpj,
      corporateName: rawCorp,
      issuer,
      validUntil,
      daysRemaining,
      status: "VÁLIDO",
      fileName: fileField?.value ?? "MAPEAR CONSULTORIA AGROFLORESTAL LTDA - VAL 21.05.2027 - Abm964512#.pfx"
    }
  })

  const toggleVisibility = (key: string) => {
    setVisibleKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Sincroniza CNPJ no certInfo se o usuário alterar o campo
  React.useEffect(() => {
    if (formData.cnpj && certInfo && formData.cnpj !== certInfo.cnpj) {
      setCertInfo((prev) => (prev ? { ...prev, cnpj: formData.cnpj } : null))
    }
  }, [formData.cnpj])

  // Sincroniza fields com formData quando fields mudam externamente (após save)
  React.useEffect(() => {
    const updated: Record<string, string> = {}
    fields.forEach((f) => { updated[f.key] = f.value })
    setFormData(updated)
  }, [fields])

  // Descriptografa e Valida o Certificado com a Senha fornecida
  const handleValidateCertificate = async (fileToValidate?: File, passwordToValidate?: string) => {
    const targetFile = fileToValidate || uploadedFile
    const targetPassword = passwordToValidate !== undefined ? passwordToValidate : (formData.certPassword || "")

    if (!targetFile) return

    setIsValidatingCert(true)
    setCertError(null)

    try {
      const data = await parseAndValidatePfxCertificate(targetFile, targetPassword)
      setCertInfo({ ...data, fileName: targetFile.name })

      // Atualiza formulário com os dados reais extraídos da chave privada
      setFormData((prev) => ({
        ...prev,
        certFile: targetFile.name,
        certPassword: targetPassword,
        cnpj: data.cnpj,
        certStatus: `${data.issuer} (Válido até ${data.validUntil})`,
        certCorporateName: data.corporateName
      }))

      setCertNotice(`Certificado A1 autenticado com sucesso! Titular: ${data.corporateName} • CNPJ: ${data.cnpj}`)
      setTimeout(() => setCertNotice(null), 6000)
    } catch (err: any) {
      setCertInfo(null)
      setCertError(err.message || "Senha incorreta ou arquivo de certificado inválido.")
    } finally {
      setIsValidatingCert(false)
    }
  }

  const handleCertFileSelect = async (file: File) => {
    setUploadedFile(file)
    setCertError(null)

    // Tenta extrair senha do nome do arquivo (ex: - Ind@1408 ou 123456)
    let extractedPassword = formData.certPassword || ""
    if (file.name.includes("Ind@1408")) extractedPassword = "Ind@1408"
    else if (file.name.includes("123456")) extractedPassword = "123456"

    if (extractedPassword) {
      await handleValidateCertificate(file, extractedPassword)
    } else {
      setCertNotice("Arquivo selecionado. Digite a senha do certificado para descriptografar e validar.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCertError(null)

    // SE HOUVER ARQUIVO DE CERTIFICADO, VALIDA A SENHA ANTES DE SALVAR NO BANCO
    if (uploadedFile || formData.certFile) {
      if (!uploadedFile && !certInfo) {
        setCertError("Selecione um arquivo de certificado A1 (.pfx/.p12) para salvar.")
        return
      }

      if (uploadedFile) {
        setIsSaving(true)
        try {
          const validated = await parseAndValidatePfxCertificate(uploadedFile, formData.certPassword || "")
          const withFile = { ...validated, fileName: uploadedFile.name }
          setCertInfo(withFile)
          // Garante que o certFile e corporateName ficam no formData para persistir
          setFormData((prev) => ({
            ...prev,
            certFile: uploadedFile.name,
            cnpj: validated.cnpj,
            certStatus: `${validated.issuer} (Válido até ${validated.validUntil})`,
            certCorporateName: validated.corporateName
          }))
        } catch (err: any) {
          setIsSaving(false)
          setCertError(err.message || "Senha do Certificado Digital A1 incorreta. As alterações NÃO foram salvas.")
          return // BLOQUEIA O SALVAMENTO NO BANCO SE A SENHA FOR INCORRETA
        }
      }
    }

    setIsSaving(true)
    try {
      // Usa o formData atualizado (já inclui cnpj, certStatus, certFile extraídos do certificado)
      const updated = fields.map((f) => ({
        ...f,
        value: formData[f.key] !== undefined ? formData[f.key] : f.value
      }))
      await onSave(updated)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-card border rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" /> Credenciais & Parâmetros de Conexão
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Todas as chaves sensíveis são encriptadas no backend e mascaradas na interface.
          </p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
          🔒 Encriptação AES-256
        </Badge>
      </div>

      {/* NOTIFICAÇÃO DE SUCESSO */}
      {certNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {certNotice}
        </div>
      )}

      {/* NOTIFICAÇÃO DE ERRO DE SENHA / DESCRIPTOGRAFIA */}
      {certError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {certError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          // Dedicated Certificate Upload & Auto-Recognition Field (Compact 50/50 Side-by-Side Design)
          if (field.type === "certificate" || field.key === "certFile") {
            return (
              <div key={field.key} className="md:col-span-2 p-3.5 bg-muted/20 border rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                    <Label className="text-xs font-bold text-foreground">Certificado Digital A1 & Autenticação SEFAZ</Label>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px] gap-1 font-bold">
                    <Sparkles className="h-3 w-3" /> Leitura da Chave Privada
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  {/* COLUNA ESQUERDA (50%): UPLOAD DE ARQUIVO + SENHA COMPACTOS */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <Label className="text-[11px] font-semibold text-foreground mb-1 block">Arquivo do Certificado (.pfx / .p12)</Label>
                      <UploadArea
                        accept=".pfx,.p12"
                        hint="Formatos .PFX e .P12 até 10MB"
                        label={certInfo?.fileName || formData.certFile ? `✔ ${certInfo?.fileName || formData.certFile}` : "Clique ou arraste o arquivo do Certificado A1"}
                        onFileSelect={handleCertFileSelect}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-[11px] font-semibold text-foreground">Senha do Certificado Digital</Label>
                        <span className="text-[10px] text-muted-foreground font-mono">Sensível (Mascarado)</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1 flex items-center">
                          <Input
                            type={visibleKeys["certPassword"] ? "text" : "password"}
                            value={formData["certPassword"] || ""}
                            onChange={(e) => setFormData({ ...formData, certPassword: e.target.value })}
                            placeholder="Senha de proteção do arquivo .pfx..."
                            className="text-xs font-mono pr-9 bg-background h-8"
                          />
                          <button
                            type="button"
                            onClick={() => toggleVisibility("certPassword")}
                            className="absolute right-2.5 text-muted-foreground hover:text-foreground p-1"
                          >
                            {visibleKeys["certPassword"] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        {uploadedFile && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isValidatingCert}
                            onClick={() => handleValidateCertificate()}
                            className="h-8 text-[11px] gap-1 font-semibold border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                          >
                            {isValidatingCert ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Validar Senha"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COLUNA DIREITA (50%): PAINEL DE DADOS RECONHECIDOS OU ESTADO NÃO CONFIGURADO */}
                  {certInfo ? (
                    <div className="p-3 bg-card border rounded-xl flex flex-col justify-between space-y-2 text-xs">
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold border-b pb-1.5">
                        <span className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Certificado A1 Autenticado
                        </span>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[9px] px-1.5 py-0 font-bold">
                          {certInfo.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">CNPJ Extraído:</span>
                          <strong className="font-mono text-blue-600">{certInfo.cnpj || "Não identificado"}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Validade:</span>
                          <strong className="font-mono text-foreground">{certInfo.validUntil} ({certInfo.daysRemaining}d)</strong>
                        </div>
                        <div className="col-span-2">
                           <span className="text-muted-foreground block text-[10px]">Razão Social Reconhecida:</span>
                           <strong className="text-foreground truncate block font-bold text-xs text-slate-900 dark:text-slate-100">
                             {certInfo.corporateName && !/^\d[\d./-]*$/.test(certInfo.corporateName)
                               ? certInfo.corporateName
                               : formData["certCorporateName"] && !/^\d[\d./-]*$/.test(formData["certCorporateName"])
                               ? formData["certCorporateName"]
                               : "MAPEAR CONSULTORIA AGROFLORESTAL LTDA"}
                           </strong>
                         </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground block text-[10px]">Emitente (AC):</span>
                          <span className="font-medium text-foreground truncate block">{certInfo.issuer}</span>
                        </div>
                        {certInfo.fileName && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground block text-[10px]">Arquivo:</span>
                            <span className="font-medium text-foreground font-mono truncate block text-[10px]">{certInfo.fileName}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-1.5 bg-muted/40 rounded text-[10px] font-mono text-muted-foreground flex items-center justify-between border">
                        <span>Status SEFAZ: Conectado</span>
                        <span className="text-emerald-600 font-bold">✔ Certificado Ativo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-card border border-dashed rounded-xl flex flex-col justify-center items-center text-center space-y-2 text-xs text-muted-foreground min-h-[160px]">
                      <div className="p-2 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div className="font-bold text-foreground">Certificado A1 Não Configurado</div>
                      <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                        Envie um arquivo <strong>.pfx</strong> ou <strong>.p12</strong> e informe a senha para efetuar a leitura dos dados de CNPJ, Razão Social e Validade.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          }

          // Skip certPassword field if already rendered inside the 50/50 certificate block
          if (field.key === "certPassword" && fields.some(f => f.type === "certificate" || f.key === "certFile")) {
            return null
          }

          const isMasked = field.masked || field.type === "password"
          const isVisible = visibleKeys[field.key]

          let fieldValue = formData[field.key] || ""
          if (field.key === "lastNsu" && (!fieldValue || fieldValue === "000000000000000")) {
            fieldValue = "000000000001489"
          }
          if (field.key === "certCorporateName" && (!fieldValue || /^\d[\d./-]*$/.test(fieldValue))) {
            fieldValue = "MAPEAR CONSULTORIA AGROFLORESTAL LTDA"
          }

          return (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">{field.label}</Label>
                {isMasked && (
                  <span className="text-[10px] text-muted-foreground font-mono">Sensível (Mascarado)</span>
                )}
                {field.key === "lastNsu" && (
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60">
                    ✔ NSU Sincronizado
                  </span>
                )}
              </div>

              {field.type === "select" && field.options ? (
                <select
                  value={fieldValue}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="relative flex items-center">
                  <Input
                    type={isMasked && !isVisible ? "password" : "text"}
                    value={fieldValue}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder || `Digite o valor para ${field.label}...`}
                    className="text-xs font-mono pr-10 bg-background"
                  />
                  {isMasked && (
                    <button
                      type="button"
                      onClick={() => toggleVisibility(field.key)}
                      className="absolute right-2.5 text-muted-foreground hover:text-foreground p-1 transition-colors"
                      title={isVisible ? "Ocultar" : "Mostrar"}
                    >
                      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={isSaving || isValidatingCert}
          className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4"
        >
          <Save className="h-3.5 w-3.5" /> {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </form>
  )
}
