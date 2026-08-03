/**
 * CNPJ Service — BrasilAPI Integration
 * Consulta gratuita de CNPJ via BrasilAPI (sem autenticação)
 * Endpoint: https://brasilapi.com.br/api/cnpj/v1/{cnpj}
 */

export interface CnpjApiResponse {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  ddd_telefone_1: string
  ddd_telefone_2: string
  email: string | null
  descricao_situacao_cadastral: string
  situacao_cadastral: number
  data_inicio_atividade: string
  cnae_fiscal_descricao: string
  natureza_juridica: string
  porte: string
  capital_social: number
  descricao_identificador_matriz_filial: "MATRIZ" | "FILIAL"
  identificador_matriz_filial: number
}

export interface CnpjResult {
  cnpj: string
  corporateName: string
  tradeName: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  cnpjStatus: string
  isActive: boolean
  activity: string
  openingDate: string
  isMatrix: boolean
  legalNature: string
  companySize: string
}

/** Remove todos os caracteres não numéricos do CNPJ */
export function stripCnpjMask(cnpj: string): string {
  return cnpj.replace(/\D/g, "")
}

/** Aplica a máscara XX.XXX.XXX/XXXX-XX ao CNPJ */
export function formatCnpj(value: string): string {
  const digits = stripCnpjMask(value).slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

/** Formata CEP: XXXXX-XXX */
export function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

/** Formata telefone com DDD: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX */
export function formatPhone(dddPhone: string): string {
  const digits = dddPhone.replace(/\D/g, "")
  if (digits.length === 0) return ""
  if (digits.length <= 2) return `(${digits}`
  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  if (rest.length <= 4) return `(${ddd}) ${rest}`
  if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`
}

/** Valida CNPJ usando o algoritmo de dígitos verificadores */
export function validateCnpj(cnpj: string): boolean {
  const digits = stripCnpjMask(cnpj)
  if (digits.length !== 14) return false
  // Rejeita sequências repetidas (ex: 00000000000000)
  if (/^(\d)\1+$/.test(digits)) return false

  const calcDigit = (slice: string, weights: number[]) => {
    const sum = slice.split("").reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0)
    const rem = sum % 11
    return rem < 2 ? 0 : 11 - rem
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const d1 = calcDigit(digits.slice(0, 12), weights1)
  const d2 = calcDigit(digits.slice(0, 13), weights2)

  return parseInt(digits[12]) === d1 && parseInt(digits[13]) === d2
}

/** Mapeia a resposta da BrasilAPI para o formato interno CnpjResult */
function mapApiResponse(data: CnpjApiResponse): CnpjResult {
  return {
    cnpj: formatCnpj(data.cnpj),
    corporateName: data.razao_social || "",
    tradeName: data.nome_fantasia || "",
    address: data.logradouro ? `${data.logradouro}` : "",
    number: data.numero || "",
    complement: data.complemento || "",
    neighborhood: data.bairro || "",
    city: data.municipio || "",
    state: data.uf || "",
    zipCode: formatCep(data.cep || ""),
    phone: formatPhone(data.ddd_telefone_1 || data.ddd_telefone_2 || ""),
    email: data.email || "",
    cnpjStatus: data.descricao_situacao_cadastral || "",
    isActive: data.situacao_cadastral === 2,
    activity: data.cnae_fiscal_descricao || "",
    openingDate: data.data_inicio_atividade || "",
    isMatrix: data.identificador_matriz_filial === 1,
    legalNature: data.natureza_juridica || "",
    companySize: data.porte || "",
  }
}

/**
 * Consulta dados do CNPJ na BrasilAPI (gratuita, sem autenticação).
 * Fallback automático para open.cnpja.com se BrasilAPI falhar.
 *
 * @param cnpj - CNPJ com ou sem máscara
 * @returns CnpjResult com todos os dados da empresa
 * @throws Error com mensagem amigável em caso de falha
 */
export async function fetchCnpj(cnpj: string): Promise<CnpjResult> {
  const digits = stripCnpjMask(cnpj)

  if (digits.length !== 14) {
    throw new Error("CNPJ deve conter 14 dígitos.")
  }

  if (!validateCnpj(digits)) {
    throw new Error("CNPJ inválido. Verifique os dígitos verificadores.")
  }

  // Tentativa 1: BrasilAPI (principal)
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    })

    if (response.status === 404) {
      throw new Error("CNPJ não encontrado na base da Receita Federal.")
    }
    if (!response.ok) {
      throw new Error(`Erro na consulta: ${response.status}`)
    }

    const data: CnpjApiResponse = await response.json()
    return mapApiResponse(data)
  } catch (err: any) {
    // Se for erro de validação/404, repassa diretamente
    if (err.message.includes("inválido") || err.message.includes("não encontrado")) {
      throw err
    }

    // Tentativa 2: CNPJá (fallback)
    try {
      const fallbackResponse = await fetch(`https://open.cnpja.com/office/${digits}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      })

      if (!fallbackResponse.ok) {
        throw new Error("CNPJ não encontrado.")
      }

      const fallbackData = await fallbackResponse.json()
      // Mapeia o formato do CNPJá para CnpjApiResponse
      const mapped: CnpjApiResponse = {
        cnpj: digits,
        razao_social: fallbackData.company?.name || "",
        nome_fantasia: fallbackData.alias || "",
        logradouro: fallbackData.address?.street || "",
        numero: fallbackData.address?.number || "",
        complemento: fallbackData.address?.details || "",
        bairro: fallbackData.address?.district || "",
        municipio: fallbackData.address?.city || "",
        uf: fallbackData.address?.state || "",
        cep: fallbackData.address?.zip || "",
        ddd_telefone_1: fallbackData.phones?.[0]?.number || "",
        ddd_telefone_2: fallbackData.phones?.[1]?.number || "",
        email: fallbackData.emails?.[0]?.address || null,
        descricao_situacao_cadastral: fallbackData.status?.text || "",
        situacao_cadastral: fallbackData.status?.id === 2 ? 2 : 0,
        data_inicio_atividade: fallbackData.founded || "",
        cnae_fiscal_descricao: fallbackData.mainActivity?.text || "",
        natureza_juridica: fallbackData.nature?.text || "",
        porte: fallbackData.size?.text || "",
        capital_social: fallbackData.capital || 0,
        descricao_identificador_matriz_filial: fallbackData.head ? "MATRIZ" : "FILIAL",
        identificador_matriz_filial: fallbackData.head ? 1 : 2,
      }
      return mapApiResponse(mapped)
    } catch {
      throw new Error(
        "Serviço de consulta de CNPJ temporariamente indisponível. Tente novamente em alguns instantes."
      )
    }
  }
}
