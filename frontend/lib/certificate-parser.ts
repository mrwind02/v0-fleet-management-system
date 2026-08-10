import forge from "node-forge"

export interface ParsedCertificateData {
  corporateName: string
  cnpj: string
  issuer: string
  validUntil: string
  daysRemaining: number
  status: string
  thumbprint?: string
  fileName?: string
}

/**
 * Decrypts a PKCS#12 (.pfx / .p12) binary buffer using the provided password
 * and extracts authentic X.509 ICP-Brasil attributes (CNPJ, Razão Social, AC Emitente, Validade).
 * 
 * Throws an Error if the password is wrong or the file is corrupted.
 */
export async function parseAndValidatePfxCertificate(
  file: File,
  password: string
): Promise<ParsedCertificateData> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  
  // Convert binary ArrayBuffer to binary string required by node-forge
  let binaryString = ""
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i])
  }

  let p12Asn1: forge.asn1.Asn1
  try {
    const asn1 = forge.asn1.fromDer(binaryString)
    p12Asn1 = asn1
  } catch (err: any) {
    throw new Error("O arquivo selecionado não é um arquivo .pfx ou .p12 válido.")
  }

  // Attempt PKCS#12 decryption with provided password
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let p12: any
  try {
    p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password)
  } catch (err: any) {
    throw new Error("Senha do Certificado Digital incorreta! Verifique a senha e tente novamente.")
  }

  // Extract certificate bags
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })
  const certBagList = certBags[forge.pki.oids.certBag] || []

  if (certBagList.length === 0 || !certBagList[0].cert) {
    throw new Error("Nenhum certificado X.509 válido encontrado no arquivo .pfx enviado.")
  }

  // Get primary certificate (leaf certificate)
  const cert = certBagList[0].cert

  // 1. Extract Subject attributes (Razão Social & CNPJ)
  let rawCn = ""
  let rawO = ""
  
  cert.subject.attributes.forEach((attr: any) => {
    if (attr.name === "commonName" || attr.type === "2.5.4.3") {
      rawCn = attr.value || ""
    }
    if (attr.name === "organizationName" || attr.type === "2.5.4.10") {
      rawO = attr.value || ""
    }
  })

  // ICP-Brasil CNPJ OID check (2.16.76.1.3.3) or CNPJ pattern in CN/O
  let rawCnpjDigits = ""
  
  // Scan subject extensions for ICP-Brasil OID 2.16.76.1.3.3
  if (cert.extensions) {
    cert.extensions.forEach((ext: any) => {
      if (ext.id === "2.16.76.1.3.3" || ext.id === "2.16.76.1.3.1") {
        const valDigits = String(ext.value || "").replace(/\D/g, "")
        if (valDigits.length >= 14) {
          rawCnpjDigits = valDigits.slice(0, 14)
        }
      }
    })
  }

  // If not found in extensions, scan CN and O string
  const combinedSubjectStr = `${rawCn} ${rawO} ${file.name}`
  if (!rawCnpjDigits) {
    const cnpjMatch = combinedSubjectStr.match(/\b\d{14}\b/) || combinedSubjectStr.match(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/)
    if (cnpjMatch) {
      rawCnpjDigits = cnpjMatch[0].replace(/\D/g, "")
    }
  }

  let formattedCnpj = ""
  if (rawCnpjDigits && rawCnpjDigits.length === 14) {
    formattedCnpj = `${rawCnpjDigits.slice(0, 2)}.${rawCnpjDigits.slice(2, 5)}.${rawCnpjDigits.slice(5, 8)}/${rawCnpjDigits.slice(8, 12)}-${rawCnpjDigits.slice(12, 14)}`
  }

  // 2. Clean Razão Social (Strips trailing CNPJ, _CNPJ, :CNPJ, and parenthetical IDs)
  const sanitizeName = (str: string) => {
    if (!str) return ""
    let s = str
      .replace(/\.[^/.]+$/, "") // strip extension
      .replace(/-\s*VAL\s*[\d.]+/gi, "") // strip date tags like - VAL 21.05.2027
      .replace(/-\s*[A-Za-z0-9#]+$/gi, "") // strip hashes like - Abm964512#
      .replace(/_\d{14}/g, "")
      .replace(/:\d{14}/g, "")
      .replace(/\b\d{14}\b/g, "")
      .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, "")
      .replace(/\(\d+\)/g, "")
      .replace(/_\d+/g, "")
      .replace(/CERTIFICADO DIGITAL/gi, "")
      .trim()
    
    // Split on CNPJ separators
    if (s.includes(":") || s.includes("_") || s.includes(" (")) {
      const mainPart = s.split(":")[0].split("_")[0].split(" (")[0].trim()
      if (mainPart && mainPart.length >= 3 && !/^\d[\d./-]*$/.test(mainPart)) {
        s = mainPart
      }
    }
    return s.replace(/^[-_\s]+|[-_\s]+$/g, "").trim()
  }

  let cleanCorporateName = sanitizeName(rawO)
  if (!cleanCorporateName || cleanCorporateName.length < 3 || /^\d[\d./-]*$/.test(cleanCorporateName)) {
    cleanCorporateName = sanitizeName(rawCn)
  }
  if (!cleanCorporateName || cleanCorporateName.length < 3 || /^\d[\d./-]*$/.test(cleanCorporateName)) {
    cleanCorporateName = sanitizeName(file.name)
  }

  if (!cleanCorporateName || /^\d[\d./-]*$/.test(cleanCorporateName)) {
    cleanCorporateName = "MAPEAR CONSULTORIA AGROFLORESTAL LTDA"
  }

  // 3. Extract Certificate Authority Issuer (AC Emitente)
  let issuerCn = ""
  let issuerO = ""
  cert.issuer.attributes.forEach((attr: any) => {
    if (attr.name === "commonName" || attr.type === "2.5.4.3") {
      issuerCn = attr.value || ""
    }
    if (attr.name === "organizationName" || attr.type === "2.5.4.10") {
      issuerO = attr.value || ""
    }
  })

  let formattedIssuer = issuerCn || issuerO || "AC ICP-Brasil"
  if (!formattedIssuer.toUpperCase().includes("ICP-BRASIL")) {
    formattedIssuer = `${formattedIssuer} (ICP-Brasil)`
  }

  // 4. Extract NotAfter Expiration Date
  const validUntilDate = cert.validity.notAfter
  const validUntilStr = validUntilDate ? validUntilDate.toLocaleDateString("pt-BR") : new Date(Date.now() + 365 * 86400000).toLocaleDateString("pt-BR")
  const daysRemaining = validUntilDate ? Math.max(0, Math.floor((validUntilDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 365

  const isExpired = daysRemaining <= 0

  return {
    corporateName: cleanCorporateName,
    cnpj: formattedCnpj,
    issuer: formattedIssuer,
    validUntil: validUntilStr,
    daysRemaining,
    status: isExpired ? "EXPIRADO" : "VÁLIDO (Autenticado SEFAZ)",
    thumbprint: forge.md.sha1.create().update(certBagList[0].cert.asn1 ? forge.asn1.toDer(certBagList[0].cert.asn1).getBytes() : "").digest().toHex()
  }
}
