"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { supplierService, Supplier } from "@/services/supplier.service"
import { unitService } from "@/services/api"
import { UploadArea } from "@/components/ui/upload-area"
import { toast } from "sonner"
import { AlertCircle, Building2, Search, Loader2 } from "lucide-react"

interface SupplierFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editData?: Supplier | null
}

const FIELD_CLASS = "w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
const LABEL_CLASS = "block text-xs font-semibold text-muted-foreground mb-1"
const SECTION_CLASS = "text-sm font-semibold border-b border-border pb-2 mb-4 text-foreground"

const DEFAULT_CATEGORIES = [
  "Oficina Mecânica",
  "Posto de Combustível",
  "Borracharia",
  "Pneus",
  "Guincho",
  "Auto Elétrica",
  "Funilaria",
  "Pintura",
  "Lava Rápido",
  "Seguradora",
  "Despachante",
  "Autopeças",
  "Locadora",
  "Serviço Administrativo",
  "Outros"
]

export function SupplierFormSheet({ open, onOpenChange, onSuccess, editData }: SupplierFormSheetProps) {
  const [unitsList, setUnitsList] = useState<string[]>([
    "Matriz São Paulo", "Filial Curitiba", "Filial Rio de Janeiro", "Filial Belo Horizonte"
  ])
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  const [error, setError] = useState("")
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [selectedUnits, setSelectedUnits] = useState<string[]>(["Matriz São Paulo"])
  const isEditing = !!editData

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      code: "",
      trade_name: "",
      corporate_name: "",
      cnpj: "",
      state_registration: "",
      municipal_registration: "",
      primary_category: "Oficina Mecânica",
      specialty: "",
      status: "Ativo",
      is_homologated: "sim",
      rating: "5.0",
      contact_name: "",
      phone: "",
      whatsapp: "",
      email: "",
      website: "",
      zip_code: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      preferred_payment_method: "Faturamento",
      payment_terms_days: "30",
      bank_info: "",
      pix_key: "",
      financial_notes: "",
      notes: "",
    }
  })

  const zipCodeVal = watch("zip_code")

  useEffect(() => {
    unitService.getAll().then(r => {
      const uArr = Array.isArray(r.data) ? r.data : (r.data?.data || [])
      if (Array.isArray(uArr) && uArr.length > 0) {
        setUnitsList(uArr.map((u: any) => u.name || u.unitName))
      }
    }).catch(console.error)

    supplierService.getCategories().then(cats => {
      if (cats && cats.length > 0) {
        setCategoriesList(cats.map(c => c.name))
      }
    }).catch(console.error)
  }, [])

  // Auto CEP Search via ViaCEP
  const handleSearchCep = async () => {
    const rawCep = zipCodeVal?.replace(/\D/g, "")
    if (!rawCep || rawCep.length !== 8) {
      toast.error("Informe um CEP válido com 8 dígitos.")
      return
    }

    setIsSearchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`)
      const data = await res.json()
      if (data.erro) {
        toast.error("CEP não encontrado.")
      } else {
        setValue("street", data.logradouro || "")
        setValue("neighborhood", data.bairro || "")
        setValue("city", data.localidade || "")
        setValue("state", data.uf || "")
        toast.success("Endereço preenchido automaticamente pelo CEP!")
      }
    } catch {
      toast.error("Erro ao buscar CEP.")
    } finally {
      setIsSearchingCep(false)
    }
  }

  // Preencher formulário em edição
  useEffect(() => {
    if (editData && open) {
      setValue("code", editData.code || "")
      setValue("trade_name", editData.trade_name)
      setValue("corporate_name", editData.corporate_name)
      setValue("cnpj", editData.cnpj)
      setValue("state_registration", editData.state_registration || "")
      setValue("municipal_registration", editData.municipal_registration || "")
      setValue("primary_category", editData.primary_category)
      setValue("specialty", editData.specialty || "")
      setValue("status", editData.status)
      setValue("is_homologated", editData.is_homologated ? "sim" : "nao")
      setValue("rating", editData.rating?.toString() || "5.0")
      setValue("contact_name", editData.contact_name || "")
      setValue("phone", editData.phone || "")
      setValue("whatsapp", editData.whatsapp || "")
      setValue("email", editData.email || "")
      setValue("website", editData.website || "")
      setValue("zip_code", editData.zip_code || "")
      setValue("street", editData.street || "")
      setValue("number", editData.number || "")
      setValue("complement", editData.complement || "")
      setValue("neighborhood", editData.neighborhood || "")
      setValue("city", editData.city)
      setValue("state", editData.state)
      setValue("country", editData.country || "Brasil")
      setValue("preferred_payment_method", editData.preferred_payment_method || "Faturamento")
      setValue("payment_terms_days", editData.payment_terms_days?.toString() || "30")
      setValue("bank_info", editData.bank_info || "")
      setValue("pix_key", editData.pix_key || "")
      setValue("financial_notes", editData.financial_notes || "")
      setValue("notes", editData.notes || "")
      if (editData.units) setSelectedUnits(editData.units)
    } else if (!editData && open) {
      reset()
      setSelectedUnits(["Matriz São Paulo"])
    }
  }, [editData, open, setValue, reset])

  const toggleUnit = (unitName: string) => {
    setSelectedUnits(prev =>
      prev.includes(unitName) ? prev.filter(u => u !== unitName) : [...prev, unitName]
    )
  }

  const onSubmit = async (data: any) => {
    setError("")
    setIsLoading(true)
    try {
      const payload = {
        code: data.code || undefined,
        trade_name: data.trade_name,
        corporate_name: data.corporate_name,
        cnpj: data.cnpj,
        state_registration: data.state_registration || null,
        municipal_registration: data.municipal_registration || null,
        primary_category: data.primary_category,
        specialty: data.specialty || null,
        categories: [data.primary_category],
        status: data.status,
        is_homologated: data.is_homologated === "sim",
        rating: parseFloat(data.rating) || 5.0,
        contact_name: data.contact_name || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        website: data.website || null,
        zip_code: data.zip_code || null,
        street: data.street || null,
        number: data.number || null,
        complement: data.complement || null,
        neighborhood: data.neighborhood || null,
        city: data.city || 'São Paulo',
        state: data.state || 'SP',
        country: data.country || 'Brasil',
        units: selectedUnits.length > 0 ? selectedUnits : ['Matriz São Paulo'],
        preferred_payment_method: data.preferred_payment_method || 'Faturamento',
        payment_terms_days: parseInt(data.payment_terms_days || '30', 10),
        bank_info: data.bank_info || null,
        pix_key: data.pix_key || null,
        financial_notes: data.financial_notes || null,
        notes: data.notes || null,
      }

      let savedSup: Supplier
      if (isEditing && editData) {
        savedSup = await supplierService.update(editData.id, payload)
        toast.success("Fornecedor atualizado com sucesso!")
      } else {
        savedSup = await supplierService.create(payload)
        toast.success("Fornecedor cadastrado com sucesso!")
      }

      // If document attached
      if (attachedFile && savedSup?.id) {
        await supplierService.addDocument(savedSup.id, {
          name: attachedFile.name,
          doc_type: 'Contrato Social',
          file_url: '#',
        })
      }

      reset()
      setAttachedFile(null)
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar fornecedor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={{ maxWidth: 820 }} className="w-full overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="mb-6 px-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl">
                  {isEditing ? `Editar Fornecedor ${editData?.trade_name}` : "Novo Fornecedor / Parceiro Comercial"}
                </SheetTitle>
                <SheetDescription>
                  {isEditing
                    ? "Atualize as informações comerciais, fiscais e bancárias do fornecedor."
                    : "Cadastre um parceiro comercial comercial para gerenciar contratos, serviços e histórico."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Seção 1: Dados Gerais ── */}
            <div>
              <h3 className={SECTION_CLASS}>1. Dados Fiscais & Identificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Código Interno</label>
                  <input
                    type="text"
                    {...register("code")}
                    className={FIELD_CLASS}
                    placeholder="Automático (FOR-00X)"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>CNPJ *</label>
                  <input
                    type="text"
                    required
                    {...register("cnpj", { required: true })}
                    className={FIELD_CLASS}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Categoria Principal *</label>
                  <select {...register("primary_category", { required: true })} className={FIELD_CLASS}>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={LABEL_CLASS}>Razão Social *</label>
                  <input
                    type="text"
                    required
                    {...register("corporate_name", { required: true })}
                    className={FIELD_CLASS}
                    placeholder="Ex: Mecânica Alfa Prestação de Serviços LTDA"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Nome Fantasia *</label>
                  <input
                    type="text"
                    required
                    {...register("trade_name", { required: true })}
                    className={FIELD_CLASS}
                    placeholder="Ex: Oficina Mecânica Alfa"
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Inscrição Estadual</label>
                  <input
                    type="text"
                    {...register("state_registration")}
                    className={FIELD_CLASS}
                    placeholder="000.000.000.000"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Inscrição Municipal</label>
                  <input
                    type="text"
                    {...register("municipal_registration")}
                    className={FIELD_CLASS}
                    placeholder="0000000"
                  />
                </div>
              </div>
            </div>

            {/* ── Seção 2: Contato ── */}
            <div>
              <h3 className={SECTION_CLASS}>2. Responsável & Canais de Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Responsável Comercial</label>
                  <input
                    type="text"
                    {...register("contact_name")}
                    className={FIELD_CLASS}
                    placeholder="Ex: Ricardo Santos"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Telefone Fixo</label>
                  <input
                    type="text"
                    {...register("phone")}
                    className={FIELD_CLASS}
                    placeholder="(11) 3456-7890"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>WhatsApp</label>
                  <input
                    type="text"
                    {...register("whatsapp")}
                    className={FIELD_CLASS}
                    placeholder="(11) 98765-4321"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL_CLASS}>E-mail Comercial</label>
                  <input
                    type="email"
                    {...register("email")}
                    className={FIELD_CLASS}
                    placeholder="contato@empresa.com.br"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Website</label>
                  <input
                    type="url"
                    {...register("website")}
                    className={FIELD_CLASS}
                    placeholder="https://empresa.com.br"
                  />
                </div>
              </div>
            </div>

            {/* ── Seção 3: Endereço (Busca CEP ViaCEP) ── */}
            <div>
              <h3 className={SECTION_CLASS}>3. Endereço & Localização</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>CEP</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      {...register("zip_code")}
                      className={FIELD_CLASS}
                      placeholder="00000-000"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="px-3 shrink-0"
                      onClick={handleSearchCep}
                      disabled={isSearchingCep}
                    >
                      {isSearchingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL_CLASS}>Logradouro</label>
                  <input
                    type="text"
                    {...register("street")}
                    className={FIELD_CLASS}
                    placeholder="Avenida Paulista"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Número</label>
                  <input
                    type="text"
                    {...register("number")}
                    className={FIELD_CLASS}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Complemento</label>
                  <input
                    type="text"
                    {...register("complement")}
                    className={FIELD_CLASS}
                    placeholder="Bloco A, Sala 42"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Bairro</label>
                  <input
                    type="text"
                    {...register("neighborhood")}
                    className={FIELD_CLASS}
                    placeholder="Bela Vista"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Cidade *</label>
                  <input
                    type="text"
                    required
                    {...register("city", { required: true })}
                    className={FIELD_CLASS}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>UF *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    {...register("state", { required: true })}
                    className={FIELD_CLASS}
                    placeholder="SP"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>País</label>
                  <input
                    type="text"
                    {...register("country")}
                    className={FIELD_CLASS}
                    placeholder="Brasil"
                  />
                </div>
              </div>
            </div>

            {/* ── Seção 4: Classificação & Homologação ── */}
            <div>
              <h3 className={SECTION_CLASS}>4. Classificação & Homologação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Especialidade</label>
                  <input
                    type="text"
                    {...register("specialty")}
                    className={FIELD_CLASS}
                    placeholder="Ex: Manutenção Pesada Diesel & Motores"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Situação Inicial *</label>
                  <select {...register("status")} className={FIELD_CLASS}>
                    <option value="Ativo">Ativo</option>
                    <option value="Em Homologação">Em Homologação</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Fornecedor Homologado?</label>
                  <select {...register("is_homologated")} className={FIELD_CLASS}>
                    <option value="sim">Sim — Homologação Aprovada</option>
                    <option value="nao">Não — Em Avaliação</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Avaliação Inicial (1.0 - 5.0)</label>
                  <select {...register("rating")} className={FIELD_CLASS}>
                    <option value="5.0">5.0 ★ (Excelente)</option>
                    <option value="4.8">4.8 ★ (Ótimo)</option>
                    <option value="4.5">4.5 ★ (Muito Bom)</option>
                    <option value="4.0">4.0 ★ (Bom)</option>
                    <option value="3.5">3.5 ★ (Regular)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={LABEL_CLASS}>Unidades Atendidas</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {unitsList.map(unit => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => toggleUnit(unit)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                          selectedUnits.includes(unit)
                            ? "bg-blue-600 text-white border-blue-600 font-semibold"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Seção 5: Financeiro ── */}
            <div>
              <h3 className={SECTION_CLASS}>5. Informações Financeiras & Pagamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Forma Pagamento Preferencial</label>
                  <select {...register("preferred_payment_method")} className={FIELD_CLASS}>
                    <option value="Faturamento">Faturamento / Faturado</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Pix">Pix</option>
                    <option value="Sem Parar">Sem Parar / Tag</option>
                    <option value="Cartão Corporativo">Cartão Corporativo</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Prazo Médio de Pagamento (Dias)</label>
                  <input
                    type="number"
                    {...register("payment_terms_days")}
                    className={FIELD_CLASS}
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Chave PIX</label>
                  <input
                    type="text"
                    {...register("pix_key")}
                    className={FIELD_CLASS}
                    placeholder="CNPJ, Email, Tel ou Chave Aleatória"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={LABEL_CLASS}>Dados Bancários (Banco, Agência, Conta)</label>
                  <input
                    type="text"
                    {...register("bank_info")}
                    className={FIELD_CLASS}
                    placeholder="Ex: Banco Itaú (341) Ag: 1234 CC: 56789-0"
                  />
                </div>
              </div>
            </div>

            {/* ── Seção 6: Documentos ── */}
            <div>
              <h3 className={SECTION_CLASS}>6. Documentos & Contrato Social</h3>
              <UploadArea
                onFileSelect={(file) => setAttachedFile(file)}
                accept="image/*,.pdf,.doc,.docx"
              />
            </div>

            {/* ── Seção 7: Observações ── */}
            <div>
              <h3 className={SECTION_CLASS}>7. Observações Adicionais</h3>
              <textarea
                rows={3}
                {...register("notes")}
                className={FIELD_CLASS}
                placeholder="Insira observações relevantes sobre o histórico, negociações ou particularidades..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Salvar..." : isEditing ? "Atualizar Fornecedor" : "Cadastrar Fornecedor"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
