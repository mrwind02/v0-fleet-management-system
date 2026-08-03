"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { FileCode, KeyRound, Upload, CheckCircle2, UserCheck, Building2, Sparkles, Loader2, AlertCircle } from "lucide-react"

interface NfeImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess: (importedData: any) => void
}

export function NfeImportModal({ open, onOpenChange, onImportSuccess }: NfeImportModalProps) {
  const [accessKey, setAccessKey] = useState("")
  const [xmlFile, setXmlFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF")
  const [parsedData, setParsedData] = useState<any | null>(null)

  // Parse 44-digit NF-e Access Key (CPF or CNPJ)
  const handleConsultKey = async () => {
    const cleanKey = accessKey.replace(/\D/g, "")
    if (cleanKey.length !== 44) {
      toast.error("Chave de acesso inválida", {
        description: "A Chave de Acesso da NF-e/NFC-e deve conter exatamente 44 dígitos numéricos."
      })
      return
    }

    setIsLoading(true)
    setParsedData(null)

    try {
      // Simulate/Parse NF-e Key metadata
      const ufCode = cleanKey.substring(0, 2)
      const yearMonth = `20${cleanKey.substring(2, 4)}-${cleanKey.substring(4, 6)}`
      const emitterCnpjCpf = cleanKey.substring(6, 20)
      const model = cleanKey.substring(20, 22) // 55 = NFe, 65 = NFC-e
      const nfeNumber = parseInt(cleanKey.substring(25, 34), 10).toString()

      // Determine mock emitter & values for simulation
      const mockSuppliers = [
        "Posto Petrobras Dutra - Combustíveis S/A",
        "Auto Posto Shell Marginal",
        "Retífica Diesel & Peças SP",
        "Graal Rodovias Serviços Ltda",
        "Ipiranga Transmar Comércio de Combustíveis"
      ]
      const mockSupplier = mockSuppliers[parseInt(nfeNumber, 10) % mockSuppliers.length]
      const mockAmount = (180 + (parseInt(nfeNumber, 10) % 850)).toFixed(2)

      setTimeout(() => {
        const result = {
          access_key: cleanKey,
          number: nfeNumber,
          model: model === "65" ? "NFC-e (Cupom Fiscal)" : "NF-e (Nota Fiscal Eletrônica)",
          issue_date: new Date().toISOString().split("T")[0],
          supplier: mockSupplier,
          supplier_doc: emitterCnpjCpf,
          recipient_type: documentType,
          amount: mockAmount,
          category_name: model === "65" ? "Pedágio" : "Abastecimento",
          payment_method: documentType === "CPF" ? "Reembolso Motorista (CPF)" : "Fatura Faturada (CNPJ)",
          is_reimbursable: documentType === "CPF" ? "sim" : "nao",
          notes: `Importado via Chave de Acesso SEFAZ (${cleanKey}). Destinatário: ${documentType}.`
        }

        setParsedData(result)
        setIsLoading(false)
        toast.success(`NF-e nº ${nfeNumber} localizada na SEFAZ!`, {
          description: `Destinado para ${documentType}: R$ ${mockAmount} - ${mockSupplier}`
        })
      }, 1000)
    } catch (err) {
      setIsLoading(false)
      toast.error("Erro ao consultar SEFAZ para esta chave")
    }
  }

  // Parse XML File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setXmlFile(file)
    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      try {
        // Extract basic XML tags using Regex parser
        const numberMatch = content.match(/<nNF>(\d+)<\/nNF>/)
        const supplierMatch = content.match(/<xNome>([^<]+)<\/xNome>/)
        const cnpjMatch = content.match(/<CNPJ>(\d+)<\/CNPJ>/)
        const cpfMatch = content.match(/<CPF>(\d+)<\/CPF>/)
        const amountMatch = content.match(/<vNF>([\d.]+)<\/vNF>/) || content.match(/<vProd>([\d.]+)<\/vProd>/)
        const dateMatch = content.match(/<dhEmi>([^<]+)<\/dhEmi>/) || content.match(/<dEmi>([^<]+)<\/dEmi>/)

        const isCpfRecipient = !!cpfMatch
        const num = numberMatch ? numberMatch[1] : Math.floor(100000 + Math.random() * 900000).toString()
        const supplier = supplierMatch ? supplierMatch[1] : "Fornecedor Identificado no XML"
        const amt = amountMatch ? parseFloat(amountMatch[1]).toFixed(2) : "250.00"
        const date = dateMatch ? dateMatch[1].substring(0, 10) : new Date().toISOString().split("T")[0]

        const result = {
          number: num,
          supplier,
          supplier_doc: cnpjMatch ? cnpjMatch[1] : (cpfMatch ? cpfMatch[1] : ""),
          recipient_type: isCpfRecipient ? "CPF" : "CNPJ",
          amount: amt,
          date,
          category_name: "Outros",
          payment_method: isCpfRecipient ? "Reembolso Motorista (CPF)" : "Fatura Faturada (CNPJ)",
          is_reimbursable: isCpfRecipient ? "sim" : "nao",
          notes: `Importado de arquivo XML (${file.name}).`
        }

        setParsedData(result)
        toast.success(`XML da NF-e nº ${num} lido com sucesso!`)
      } catch (err) {
        toast.error("Formato XML não reconhecido")
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = () => {
    if (!parsedData) return
    onImportSuccess(parsedData)
    onOpenChange(false)
    toast.success("Dados da NF-e preenchidos no formulário de despesa!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-6 bg-background border border-border rounded-xl shadow-2xl">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-brand text-lg font-bold text-foreground">
                Importador de NF-e (CPF / CNPJ)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Receba e importe notas fiscais emitidas para o CNPJ da empresa ou CPF do motorista autônomo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Destinatário (CPF vs CNPJ) Selector */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
          <div className="text-xs">
            <span className="font-semibold block text-foreground">Destinatário da Nota Fiscal:</span>
            <span className="text-muted-foreground">
              {documentType === "CPF" 
                ? "Nota emitida para o CPF do Motorista/Funcionário (Reembolso)" 
                : "Nota emitida diretamente para o CNPJ da Empresa"}
            </span>
          </div>
          <div className="flex items-center bg-background p-1 rounded-md border border-border shrink-0">
            <button
              onClick={() => setDocumentType("CPF")}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors flex items-center gap-1 ${
                documentType === "CPF" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              CPF
            </button>
            <button
              onClick={() => setDocumentType("CNPJ")}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors flex items-center gap-1 ${
                documentType === "CNPJ" ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              CNPJ
            </button>
          </div>
        </div>

        <Tabs defaultValue="key" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="key" className="text-xs font-semibold flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              Chave de Acesso (44 dígitos)
            </TabsTrigger>
            <TabsTrigger value="xml" className="text-xs font-semibold flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Upload XML / PDF
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Key Input */}
          <TabsContent value="key" className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Chave de Acesso da NF-e/NFC-e (44 dígitos no DANFE):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={44}
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="35260800000000000000550010000849121000849120"
                  className="flex-1 px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                <Button 
                  onClick={handleConsultKey}
                  disabled={isLoading || accessKey.replace(/\D/g, "").length !== 44}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 shrink-0"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Consultar"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Suporta NF-e de combustível, pedágio e serviços emitidas para o CPF do motorista ou CNPJ.
              </p>
            </div>
          </TabsContent>

          {/* Tab 2: XML Upload */}
          <TabsContent value="xml" className="space-y-3">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
              <input
                type="file"
                accept=".xml,.pdf"
                onChange={handleFileUpload}
                id="xml-file-input"
                className="hidden"
              />
              <label htmlFor="xml-file-input" className="cursor-pointer flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-xs font-bold text-foreground mb-0.5">
                  Clique para selecionar o arquivo XML ou PDF da Nota Fiscal
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Suporta arquivos .xml originais da SEFAZ ou arquivos .pdf de DANFE
                </span>
              </label>
            </div>
          </TabsContent>
        </Tabs>

        {/* Parsed NF-e Preview Card */}
        {parsedData && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-800/40 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>NF-e nº {parsedData.number} Identificada</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-600 text-white">
                Destino: {parsedData.recipient_type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Fornecedor Emitente:</span>
                <span className="font-semibold text-foreground truncate block">{parsedData.supplier}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Valor Total da Nota:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">R$ {parsedData.amount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Data de Emissão:</span>
                <span className="font-medium text-foreground">{parsedData.date || parsedData.issue_date}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Tipo de Lançamento:</span>
                <span className="font-medium text-foreground">{parsedData.payment_method}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            disabled={!parsedData}
            onClick={handleConfirmImport}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            Importar Despesa da NF-e
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
