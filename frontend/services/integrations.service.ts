import {
  IntegrationItem,
  IntegrationLog,
  IntegrationAudit,
  SystemHealthMetrics
} from "@/types/integrations"

export const INITIAL_INTEGRATIONS_CATALOG: IntegrationItem[] = [
  {
    id: "int-gmaps",
    slug: "google-maps",
    name: "Google Maps",
    category: "Mapas",
    description: "Geolocalização, cálculo de rotas, distâncias e autocomplete de endereços.",
    version: "v3.52",
    iconName: "MapPin",
    status: "connected",
    installed: true,
    enabled: true,
    lastSync: "Não sincronizado",
    uptimePct: 100.0,
    latencyMs: 0,
    calls24h: 0,
    rateLimitPct: 0,
    maskedCredential: "",
    supportedFeatures: [
      "Cadastro de fornecedores",
      "Cadastro de unidades",
      "Geolocalização",
      "Cálculo de distâncias",
      "Rotas futuras"
    ],
    configFields: [
      { key: "apiKey", label: "API Key", type: "password", value: "", masked: true, placeholder: "Cole sua chave API do Google Cloud" },
      { key: "services", label: "Serviços Habilitados", type: "text", value: "Maps, Places, Geocoding, Directions" }
    ]
  },
  {
    id: "int-whatsapp",
    slug: "whatsapp-meta",
    name: "WhatsApp Business (Meta)",
    category: "Comunicação",
    description: "Envio de notificações de alertas, revisões e aprovações via WhatsApp.",
    version: "v18.0",
    iconName: "MessageSquare",
    status: "connected",
    installed: true,
    enabled: true,
    lastSync: "Não sincronizado",
    uptimePct: 100.0,
    latencyMs: 0,
    calls24h: 0,
    rateLimitPct: 0,
    maskedCredential: "",
    supportedFeatures: [
      "Alertas de documentos vencidos",
      "Notificações de manutenção",
      "Preventivas agendadas",
      "Aprovação de OS",
      "Alertas de despesas"
    ],
    configFields: [
      { key: "accessToken", label: "Access Token", type: "password", value: "", masked: true },
      { key: "phoneNumberId", label: "Phone Number ID", type: "text", value: "" },
      { key: "businessAccountId", label: "Business Account ID", type: "text", value: "" },
      { key: "webhookVerifyToken", label: "Webhook Verify Token", type: "password", value: "", masked: true }
    ]
  },
  {
    id: "int-supabase",
    slug: "supabase",
    name: "Supabase",
    category: "Banco de Dados",
    description: "Banco de dados principal do ERP com suporte a Realtime e Storage.",
    version: "v2.39",
    iconName: "Database",
    status: "connected",
    installed: true,
    enabled: true,
    lastSync: "Não sincronizado",
    uptimePct: 100.0,
    latencyMs: 0,
    calls24h: 0,
    rateLimitPct: 0,
    maskedCredential: "",
    supportedFeatures: [
      "Persistência ERP FrotaOne",
      "Realtime Subscriptions",
      "Storage de Comprovantes",
      "Connection Pooling"
    ],
    configFields: [
      { key: "projectUrl", label: "Project URL", type: "text", value: "" },
      { key: "serviceKey", label: "Service Role Key", type: "password", value: "", masked: true },
      { key: "dbStatus", label: "Modo de Conexão", type: "text", value: "Pooling Ativo" }
    ]
  },
  {
    id: "int-sefaz-dfe",
    slug: "distribuicao-dfe",
    name: "Distribuição DF-e (SEFAZ)",
    category: "Fiscal",
    description: "Recepção e download automático de notas fiscais emitidas para o CNPJ.",
    version: "v1.00",
    iconName: "FileCheck",
    status: "pending",
    installed: true,
    enabled: true,
    lastSync: "Não configurado",
    uptimePct: 100.0,
    latencyMs: 0,
    calls24h: 0,
    rateLimitPct: 0,
    maskedCredential: "Certificado Não Configurado",
    supportedFeatures: [
      "NF-e (Notas de Terceiros)",
      "NFC-e (Combustíveis)",
      "CT-e (Fretes e Cargas)",
      "MDF-e (Manifesto Eletrônico)",
      "Manifestação do Destinatário"
    ],
    configFields: [
      { key: "ambiente", label: "Ambiente", type: "select", value: "Produção", options: ["Produção", "Homologação"] },
      { key: "cnpj", label: "CNPJ da Empresa (Reconhecido)", type: "text", value: "", placeholder: "CNPJ extraído do certificado A1..." },
      { key: "certFile", label: "Arquivo do Certificado Digital A1 (.pfx / .p12)", type: "certificate", value: "" },
      { key: "certPassword", label: "Senha do Certificado Digital", type: "password", value: "", placeholder: "Sua senha do arquivo .pfx", masked: true },
      { key: "certStatus", label: "Certificado Digital A1 (Status)", type: "text", value: "Nenhum certificado A1 configurado" },
      { key: "certCorporateName", label: "Razão Social Reconhecida", type: "text", value: "" },
      { key: "lastNsu", label: "Último NSU Consultado", type: "text", value: "000000000000000" }
    ]
  },
  {
    id: "int-openai",
    slug: "openai",
    name: "OpenAI GPT-4",
    category: "IA",
    description: "Inteligência Artificial para análise de notas, classificação de despesas e assistente.",
    version: "v1.4",
    iconName: "Cpu",
    status: "connected",
    installed: true,
    enabled: true,
    lastSync: "Não sincronizado",
    uptimePct: 100.0,
    latencyMs: 0,
    calls24h: 0,
    rateLimitPct: 0,
    maskedCredential: "",
    supportedFeatures: [
      "Assistente ERP FrotaOne",
      "Insights automáticos",
      "Resumos operacionais",
      "Classificação de despesas",
      "Análise de documentos"
    ],
    configFields: [
      { key: "apiKey", label: "API Key", type: "password", value: "", masked: true },
      { key: "model", label: "Modelo Principal", type: "text", value: "gpt-4o-mini" },
      { key: "organization", label: "Organização", type: "text", value: "" }
    ]
  },
  {
    id: "int-gemini",
    slug: "google-gemini",
    name: "Google Gemini AI",
    category: "IA",
    description: "Recursos de visão computacional, OCR de recibos e geração de relatórios.",
    version: "v1.5 Flash",
    iconName: "Sparkles",
    status: "connected",
    installed: true,
    enabled: true,
    lastSync: "Ontem às 18:20",
    uptimePct: 99.9,
    latencyMs: 280,
    calls24h: 84,
    rateLimitPct: 4,
    maskedCredential: "AIzaSyB...4mNq",
    supportedFeatures: [
      "OCR de comprovantes e cupons",
      "Resumo de contratos",
      "Geração de indicadores",
      "Assistente de manutenção"
    ],
    configFields: [
      { key: "apiKey", label: "API Key", type: "password", value: "AIzaSyB1234567894mNq", masked: true },
      { key: "project", label: "Projeto GCP", type: "text", value: "frotaone-ai-vision" },
      { key: "model", label: "Modelo", type: "text", value: "gemini-1.5-flash" }
    ]
  },
  {
    id: "int-firebase",
    slug: "firebase",
    name: "Firebase",
    category: "Banco de Dados",
    description: "Serviços de Push Notifications móveis para motoristas e autenticação.",
    version: "v10.8",
    iconName: "Flame",
    status: "pending",
    installed: true,
    enabled: false,
    lastSync: "Pendente de credenciais",
    uptimePct: 99.9,
    latencyMs: 95,
    calls24h: 0,
    rateLimitPct: 0,
    maskedCredential: "Não configurado",
    supportedFeatures: [
      "Push Notifications para o App Motorista",
      "Firebase Auth",
      "Cloud Storage",
      "Analytics"
    ],
    configFields: [
      { key: "projectId", label: "Project ID", type: "text", value: "frotaone-mobile-app" },
      { key: "apiKey", label: "API Key", type: "password", value: "", masked: true },
      { key: "appId", label: "App ID", type: "text", value: "" },
      { key: "storageBucket", label: "Storage Bucket", type: "text", value: "frotaone-mobile-app.appspot.com" }
    ]
  },
  {
    id: "int-smtp",
    slug: "smtp-email",
    name: "Servidor SMTP / E-mail",
    category: "Comunicação",
    description: "Envio de relatórios agendados, confirmações e alertas por e-mail corporativo.",
    version: "TLS 1.3",
    iconName: "Mail",
    status: "connected",
    installed: true,
    enabled: true,
    lastSync: "Ontem às 23:00",
    uptimePct: 99.5,
    latencyMs: 210,
    calls24h: 145,
    rateLimitPct: 6,
    maskedCredential: "smtp.sendgrid.net",
    supportedFeatures: [
      "Envio de relatórios em PDF",
      "Notificações aos gestores",
      "Recuperação de senhas"
    ],
    configFields: [
      { key: "host", label: "Host SMTP", type: "text", value: "smtp.sendgrid.net" },
      { key: "port", label: "Porta", type: "text", value: "587" },
      { key: "user", label: "Usuário / Apikey", type: "text", value: "apikey" },
      { key: "password", label: "Senha", type: "password", value: "SG.1234567890abcdef", masked: true }
    ]
  },
  {
    id: "int-rest-api",
    slug: "rest-api",
    name: "REST API Gateways",
    category: "APIs",
    description: "Endpoints REST com suporte a OAuth 2.0 e API Keys para integrações de terceiros.",
    version: "v2.0",
    iconName: "Share2",
    status: "connected",
    installed: false,
    enabled: false,
    lastSync: "Não instalado",
    uptimePct: 100.0,
    latencyMs: 45,
    calls24h: 0,
    rateLimitPct: 0,
    supportedFeatures: [
      "OAuth 2.0 Auth Server",
      "Gestão de API Keys por empresa",
      "Controle de taxa (Rate Limit)",
      "Documentação OpenAPI / Swagger"
    ],
    configFields: [
      { key: "clientId", label: "Client ID", type: "text", value: "frotaone_client_prod" },
      { key: "clientSecret", label: "Client Secret", type: "password", value: "sec_987654321", masked: true }
    ]
  },
  {
    id: "int-webhooks",
    slug: "webhooks",
    name: "Webhooks de Eventos",
    category: "APIs",
    description: "Despacho em tempo real de eventos do ERP para endpoints externos.",
    version: "v1.2",
    iconName: "Activity",
    status: "connected",
    installed: false,
    enabled: false,
    lastSync: "Não instalado",
    uptimePct: 99.8,
    latencyMs: 160,
    calls24h: 0,
    rateLimitPct: 0,
    supportedFeatures: [
      "Veículo criado / atualizado",
      "Motorista cadastrado",
      "Ordem de Serviço concluída",
      "Despesa financeira lançada",
      "Documento vencido"
    ],
    configFields: [
      { key: "targetUrl", label: "URL de Destino", type: "text", value: "https://api.empresa.com.br/webhooks/frota" },
      { key: "secretKey", label: "Secret HMAC Key", type: "password", value: "whsec_abcdef123456", masked: true }
    ]
  },
  {
    id: "int-sascar",
    slug: "sascar-telemetria",
    name: "Sascar Telemetria",
    category: "Telemetria",
    description: "Integração de rastreamento, consumo de combustível e horímetro de caminhões.",
    version: "v4.0",
    iconName: "Truck",
    status: "connected",
    installed: false,
    enabled: false,
    lastSync: "Não instalado",
    uptimePct: 99.4,
    latencyMs: 240,
    calls24h: 0,
    rateLimitPct: 0,
    supportedFeatures: ["Posição em tempo real", "Odômetro SEFAZ", "Alertas de velocidade"],
    configFields: [{ key: "user", label: "Usuário Sascar", type: "text", value: "" }]
  },
  {
    id: "int-asaas",
    slug: "asaas-financeiro",
    name: "Asaas Gestão Financeira",
    category: "Financeiro",
    description: "Emissão de boletos, PIX e reconciliação bancária de pagamentos.",
    version: "v3.0",
    iconName: "DollarSign",
    status: "connected",
    installed: false,
    enabled: false,
    lastSync: "Não instalado",
    uptimePct: 99.9,
    latencyMs: 90,
    calls24h: 0,
    rateLimitPct: 0,
    supportedFeatures: ["Pagamento por PIX", "Cobrança de clientes", "Extrato de conciliação"],
    configFields: [{ key: "apiKey", label: "API Key Asaas", type: "password", value: "", masked: true }]
  }
]

export const MOCK_RECENT_TIMELINE: any[] = []

export const MOCK_INTEGRATION_LOGS: Record<string, IntegrationLog[]> = {}

export const MOCK_INTEGRATION_AUDIT: IntegrationAudit[] = []
