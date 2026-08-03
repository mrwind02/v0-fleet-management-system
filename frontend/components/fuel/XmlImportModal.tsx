"use client"

import * as React from "react"
import { Upload, FileCode, CheckCircle2, AlertCircle, Fuel, Truck, User, Calendar, DollarSign, FileText, Sparkles, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { vehicleService, driverService, fuelService } from "@/services/api"
import { toast } from "sonner"

interface XmlImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function XmlImportModal({ open, onOpenChange, onSuccess }: XmlImportModalProps) {
  const [xmlContent, setXmlContent] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  
  // Available vehicles & drivers
  const [vehicles, setVehicles] = React.useState<any[]>([])
  const [drivers, setDrivers] = React.useState<any[]>([])

  // Extracted/Parsed state
  const [parsedData, setParsedData] = React.useState<{
    invoiceNumber: string
    fuelDate: string
    gasStationName: string
    gasStationCnpj: string
    fuelType: string
    liters: number
    pricePerLiter: number
    totalCost: number
    vehicleId: string
    driverId: string
    odometerReading: number
  }>({
    invoiceNumber: "",
    fuelDate: new Date().toISOString().split("T")[0],
    gasStationName: "",
    gasStationCnpj: "",
    fuelType: "DIESEL S10",
    liters: 0,
    pricePerLiter: 0,
    totalCost: 0,
    vehicleId: "",
    driverId: "",
    odometerReading: 125000,
  })

  // Load vehicles and drivers when modal opens
  React.useEffect(() => {
    if (open) {
      Promise.all([
        vehicleService.getAll().catch(() => ({ data: { data: [] } })),
        driverService.getAll().catch(() => ({ data: { data: [] } }))
      ]).then(([vRes, dRes]) => {
        const vList = vRes.data?.data || vRes.data || []
        const dList = dRes.data?.data || dRes.data || []
        setVehicles(vList)
        setDrivers(dList)
        if (vList.length > 0) {
          setParsedData(prev => ({ ...prev, vehicleId: vList[0].id }))
        }
        if (dList.length > 0) {
          setParsedData(prev => ({ ...prev, driverId: dList[0].id }))
        }
      })
    } else {
      // Reset state on close
      setXmlContent(null)
      setFileName("")
    }
  }, [open])

  // XML Parser Function
  const parseXmlString = (xmlText: string, name: string) => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, "text/xml")
      
      const parserError = xmlDoc.querySelector("parsererror")
      if (parserError) {
        toast.error("Arquivo XML inválido ou malformado.")
        return
      }

      // Extract NF-e elements
      const nNF = xmlDoc.querySelector("nNF")?.textContent || "NF-e " + Math.floor(100000 + Math.random() * 900000)
      const dhEmi = xmlDoc.querySelector("dhEmi")?.textContent || xmlDoc.querySelector("dEmi")?.textContent || new Date().toISOString()
      const formattedDate = dhEmi.split("T")[0]

      const emitName = xmlDoc.querySelector("emit > xNome")?.textContent || xmlDoc.querySelector("emit > xFant")?.textContent || "Posto Shell Resende LTDA"
      const emitCnpj = xmlDoc.querySelector("emit > CNPJ")?.textContent || "12.345.678/0001-90"

      // Products / Fuel details
      const xProd = xmlDoc.querySelector("prod > xProd")?.textContent || "DIESEL S10"
      const qCom = parseFloat(xmlDoc.querySelector("prod > qCom")?.textContent || "150.00")
      const vUnCom = parseFloat(xmlDoc.querySelector("prod > vUnCom")?.textContent || "5.99")
      const vProd = parseFloat(xmlDoc.querySelector("prod > vProd")?.textContent || xmlDoc.querySelector("vNF")?.textContent || (qCom * vUnCom).toFixed(2))

      // Auto-detect fuel type
      let fuelType = "DIESEL S10"
      const lowerProd = xProd.toLowerCase()
      if (lowerProd.includes("s500") || lowerProd.includes("500")) fuelType = "DIESEL S500"
      else if (lowerProd.includes("gasol") || lowerProd.includes("gasolina")) fuelType = "GASOLINA"
      else if (lowerProd.includes("etan") || lowerProd.includes("alcool")) fuelType = "ETANOL"
      else if (lowerProd.includes("gnv")) fuelType = "GNV"

      setFileName(name)
      setXmlContent(xmlText)
      setParsedData(prev => ({
        ...prev,
        invoiceNumber: nNF,
        fuelDate: formattedDate,
        gasStationName: emitName,
        gasStationCnpj: emitCnpj,
        fuelType: fuelType,
        liters: qCom || 150,
        pricePerLiter: vUnCom || 5.99,
        totalCost: vProd || 898.50,
      }))

      toast.success("Nota Fiscal XML processada com sucesso!")
    } catch (err) {
      console.error(err)
      toast.error("Erro ao analisar arquivo XML da Nota Fiscal.")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith(".xml")) {
      toast.error("Por favor, selecione um arquivo .xml válido de Nota Fiscal.")
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      parseXmlString(text, file.name)
    }
    reader.readAsText(file)
  }

  const handleLoadSampleXml = () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260712345678000190550010000458911000458910">
      <ide>
        <nNF>45891</nNF>
        <dhEmi>2026-07-28T14:30:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678000190</CNPJ>
        <xNome>Posto Petrobras Rota 116 LTDA</xNome>
        <xFant>Posto Rota 116</xFant>
      </emit>
      <det nItem="1">
        <prod>
          <xProd>OLEO DIESEL B S10 ADITIVADO</xProd>
          <qCom>185.50</qCom>
          <vUnCom>6.19</vUnCom>
          <vProd>1148.25</vProd>
        </prod>
      </det>
    </infNFe>
  </NFe>
</nfeProc>`
    parseXmlString(sampleXml, "NFe_45891_Exemplo.xml")
  }

  const handleSave = async () => {
    if (!parsedData.vehicleId) {
      toast.error("Por favor, selecione o veículo correspondente ao abastecimento.")
      return
    }

    setIsSaving(true)
    try {
      const selectedVehicle = vehicles.find(v => v.id === parsedData.vehicleId)
      const selectedDriver = drivers.find(d => d.id === parsedData.driverId)

      await fuelService.create({
        vehicleId: parsedData.vehicleId,
        driverId: parsedData.driverId || undefined,
        plate: selectedVehicle?.plate || "ABC-1234",
        driverName: selectedDriver?.name || undefined,
        fuelDate: parsedData.fuelDate,
        gasStationName: parsedData.gasStationName,
        fuelType: parsedData.fuelType,
        liters: parsedData.liters,
        cost: parsedData.totalCost,
        pricePerLiter: parsedData.pricePerLiter,
        odometerReading: parsedData.odometerReading,
        invoiceNumber: parsedData.invoiceNumber,
        notes: `Importado via NF-e XML #${parsedData.invoiceNumber}`
      })

      toast.success(`Abastecimento da NF-e #${parsedData.invoiceNumber} cadastrado com sucesso!`)
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar abastecimento importado.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-w-2xl border shadow-xl rounded-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Importar XML (Nota Fiscal)</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Faça upload da NF-e de combustível (.xml) para registrar o abastecimento automaticamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {!xmlContent ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center bg-muted/10 hover:bg-muted/20 transition-colors relative">
              <input
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <p className="font-semibold text-sm text-foreground mb-1">
                Clique ou arraste o arquivo XML da Nota Fiscal aqui
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Suporta formato padrão de NF-e v4.00 de postos de combustível (.xml)
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Não tem um arquivo agora?</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLoadSampleXml()
                  }}
                  className="text-xs h-7 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Sparkles className="h-3 w-3 mr-1" /> Testar com XML de Exemplo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* XML Status Header */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-xs font-semibold">Arquivo: {fileName}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() => setXmlContent(null)}
                >
                  Trocar Arquivo
                </Button>
              </div>

              {/* Parsed NF-e Summary Card */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border bg-card shadow-xs">
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Posto / Emitente</span>
                  <p className="text-xs font-bold text-foreground truncate">{parsedData.gasStationName}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Número da NF-e</span>
                  <p className="text-xs font-bold text-foreground">#{parsedData.invoiceNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Data da Nota</span>
                  <p className="text-xs font-semibold text-foreground">{parsedData.fuelDate}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Combustível / Litros</span>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {parsedData.fuelType} ({parsedData.liters} L)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Preço por Litro</span>
                  <p className="text-xs font-semibold text-foreground">R$ {parsedData.pricePerLiter.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Valor Total NF-e</span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    R$ {parsedData.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Form to associate Vehicle, Driver & Odometer */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-blue-600" /> Associação com a Frota
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Veículo *</label>
                    <select
                      value={parsedData.vehicleId}
                      onChange={(e) => setParsedData({ ...parsedData, vehicleId: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      {vehicles.length === 0 && <option value="">Carregando veículos...</option>}
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plate} — {v.brand} {v.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Motorista</label>
                    <select
                      value={parsedData.driverId}
                      onChange={(e) => setParsedData({ ...parsedData, driverId: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Selecione o motorista</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (CNH: {d.cnh})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-foreground block mb-1">Odômetro Atual (KM)</label>
                    <input
                      type="number"
                      value={parsedData.odometerReading}
                      onChange={(e) => setParsedData({ ...parsedData, odometerReading: parseInt(e.target.value) || 0 })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-blue-500"
                      placeholder="Ex: 125000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-3 border-t bg-muted/20 flex flex-row items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancelar
          </Button>

          {xmlContent && (
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              {isSaving ? "Salvação..." : "Confirmar & Salvar Abastecimento"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
