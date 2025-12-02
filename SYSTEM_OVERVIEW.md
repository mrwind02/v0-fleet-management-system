# System Overview - Fleet Management System v1.0

## Diagrama de Fluxo

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                              │
│  (React/Next.js - Responsive Web App)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Login    │  │Dashboard │  │ Veículos │  │Motoristas│        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Manutenção│  │Questioná-│  │Relatórios│  │  Config  │        │
│  │          │  │rio       │  │          │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────┬──────────────────────────────┬─────────────────┘
                  │ HTTPS/REST API               │ SSE/WebSocket
                  │                              │ (Future)
┌─────────────────▼──────────────────────────────▼─────────────────┐
│                       API SERVER                                  │
│          (Express.js + TypeScript)                               │
├──────────────────┬──────────────────────────┬─────────────────────┤
│                  │                          │                     │
│  Auth Layer      │  Business Logic          │  Integration        │
│  ├─ JWT         │  ├─ VehicleService      │  ├─ S3/MinIO        │
│  ├─ Refresh     │  ├─ DriverService       │  ├─ Email           │
│  └─ RBAC        │  ├─ MaintenanceService  │  └─ SMS             │
│                  │  ├─ QuestionnaireServ.  │                     │
│  Data Access     │  └─ ReportService      │  Caching            │
│  ├─ Repositories│                          │  ├─ Redis Ready     │
│  └─ Cache       │  Validation              │  └─ In-Memory       │
│                  │  ├─ Input validation    │                     │
│                  │  └─ Business rules      │                     │
└──────────────────┴──────────────────────────┴─────────────────────┘
                  │
                  │ SQL (PostgreSQL)
                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│              (PostgreSQL + Prisma ORM)                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │    USERS         │  │   VEHICLES       │  │    DRIVERS    │  │
│  │ ├─ id (PK)       │  │ ├─ id (PK)       │  │ ├─ id (PK)    │  │
│  │ ├─ email (U)     │  │ ├─ plate (U)     │  │ ├─ cnhNumber  │  │
│  │ ├─ password      │  │ ├─ brand         │  │ ├─ cnhExpiry  │  │
│  │ ├─ name          │  │ ├─ model         │  │ ├─ email      │  │
│  │ ├─ role (enum)   │  │ ├─ year          │  │ ├─ phone      │  │
│  │ └─ timestamps    │  │ ├─ loadCapacity  │  │ └─ timestamps │  │
│  └──────────────────┘  │ └─ timestamps    │  └───────────────┘  │
│                        └──────────────────┘                       │
│                                                                   │
│  ┌──────────────────────────┐  ┌────────────────────────┐       │
│  │ VEHICLE_DRIVER_ASSIGNMENTS│  │ MAINTENANCE_RECORDS    │       │
│  │ ├─ id (PK)               │  │ ├─ id (PK)             │       │
│  │ ├─ vehicleId (FK)        │  │ ├─ vehicleId (FK)      │       │
│  │ ├─ driverId (FK)         │  │ ├─ type (enum)         │       │
│  │ ├─ assignedAt            │  │ ├─ date                │       │
│  │ ├─ unassignedAt          │  │ ├─ cost                │       │
│  │ └─ notes                 │  │ ├─ mechanic            │       │
│  └──────────────────────────┘  │ └─ timestamps          │       │
│                                └────────────────────────┘       │
│  ┌──────────────────────────┐  ┌────────────────────────┐       │
│  │DRIVER_QUESTIONNAIRE_RESP.│  │   AUDIT_LOGS           │       │
│  │ ├─ id (PK)               │  │ ├─ id (PK)             │       │
│  │ ├─ driverId (FK)         │  │ ├─ userId (FK)         │       │
│  │ ├─ vehicleId (FK)        │  │ ├─ action              │       │
│  │ ├─ status (enum)         │  │ ├─ entityType          │       │
│  │ ├─ gpsLatitude           │  │ ├─ changes (JSON)      │       │
│  │ ├─ gpsLongitude          │  │ └─ timestamp           │       │
│  │ └─ timestamp             │  └────────────────────────┘       │
│  └──────────────────────────┘                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
\`\`\`

## Fluxo de Autenticação

\`\`\`
1. Login
   ├─ POST /auth/login (email, password)
   ├─ Backend valida credenciais
   ├─ Gera JWT token (expiração: 24h)
   ├─ Retorna accessToken + refreshToken
   └─ Frontend armazena em localStorage/cookie

2. Requisição Autenticada
   ├─ Cliente inclui: Authorization: Bearer <token>
   ├─ Backend verifica JWT
   ├─ Se válido → Processa requisição
   └─ Se inválido → Retorna 401

3. Token Expirado
   ├─ Cliente recebe 401
   ├─ Usa refreshToken para obter novo token
   ├─ POST /auth/refresh (refreshToken)
   ├─ Backend valida refreshToken
   ├─ Retorna novo accessToken
   └─ Cliente retenta requisição original

4. Logout
   ├─ Frontend limpa localStorage
   ├─ Backend invalida tokens (opcional)
   └─ Redireciona para /login
\`\`\`

## Fluxo de Manutenção

\`\`\`
Gestor/Admin
     │
     ├─ 1. Seleciona veículo
     │
     ├─ 2. Clica "Nova Manutenção"
     │
     ├─ 3. Preenche formulário:
     │    ├─ Data do serviço
     │    ├─ Tipo (preventiva/corretiva)
     │    ├─ Mecânico responsável
     │    ├─ Estabelecimento
     │    ├─ Descrição
     │    ├─ Custo (R$)
     │    └─ Quilometragem
     │
     ├─ 4. POST /api/maintenance
     │    ├─ Backend valida dados
     │    ├─ Salva em BD
     │    ├─ Registra em audit_logs
     │    └─ Retorna confirmação
     │
     ├─ 5. Exibir em histórico
     │    ├─ GET /api/maintenance/vehicle/:id
     │    └─ Listar com filtros
     │
     └─ 6. Exportar relatório
          ├─ GET /api/reports/maintenance/csv
          └─ Download arquivo
\`\`\`

## Fluxo do Questionário (Motorista)

\`\`\`
Ao abrir app (motorista)
     │
     ├─ 1. Exibe pergunta:
     │    "Você está rodando ou parado?"
     │
     ├─ 2a. Se "Estou Rodando"
     │      ├─ POST /api/questionnaire (status: 'driving')
     │      ├─ Coleta GPS (se permitido)
     │      ├─ Gera timestamp
     │      ├─ Bloqueia funções pesadas
     │      └─ Permite apenas Status rápido
     │
     ├─ 2b. Se "Estou Parado"
     │      ├─ POST /api/questionnaire (status: 'stopped')
     │      ├─ Sem coleta de GPS
     │      ├─ Gera timestamp
     │      ├─ Permite todas as funções
     │      └─ Acesso a relatórios
     │
     └─ 3. Histórico disponível em:
          ├─ GET /api/questionnaire/driver/:id
          └─ Filtrar por período
\`\`\`

## Fluxo de Relatórios

\`\`\`
Gestor/Admin seleciona "Relatórios"
     │
     ├─ 1. DASHBOARD (Métricas)
     │    ├─ GET /api/reports/metrics
     │    ├─ Exibe:
     │    │  ├─ Veículos ativos
     │    │  ├─ Motoristas ativos
     │    │  ├─ Manutenções hoje
     │    │  └─ KM total
     │    └─ Atualiza a cada 30s
     │
     ├─ 2. EXPORTAR MANUTENÇÃO
     │    ├─ Seleciona filtros (veículo, período)
     │    ├─ GET /api/reports/maintenance/csv
     │    ├─ Backend gera CSV com:
     │    │  ├─ Data
     │    │  ├─ Tipo (preventiva/corretiva)
     │    │  ├─ Mecânico
     │    │  ├─ Custo
     │    │  └─ Notas
     │    └─ Download automático
     │
     └─ 3. EXPORTAR QUESTIONÁRIO
          ├─ Seleciona período
          ├─ GET /api/reports/questionnaire/csv
          ├─ Backend gera CSV com:
          │  ├─ Data/hora
          │  ├─ Motorista
          │  ├─ Status
          │  ├─ GPS (se disponível)
          │  └─ Veículo
          └─ Download automático
\`\`\`

## Estados e Permissões

\`\`\`
ADMIN
├─ Dashboard (métricas completas)
├─ Criar/editar/deletar veículos
├─ Criar/editar/deletar motoristas
├─ Registrar manutenção
├─ Visualizar todas as manutenções
├─ Visualizar todos os questionários
├─ Exportar relatórios completos
├─ Gerenciar usuários
└─ Acessar auditoria

GESTOR
├─ Dashboard (métricas de negócio)
├─ Visualizar veículos
├─ Visualizar motoristas
├─ Registrar manutenção
├─ Filtrar manutenção por veículo/período
├─ Exportar relatórios (filtrados)
├─ Visualizar questionário (agregado)
└─ ❌ Não pode deletar dados críticos

MOTORISTA
├─ Dashboard (apenas seu status)
├─ Responder questionário (rodando/parado)
├─ Visualizar veículo atual
├─ Ver histórico pessoal de status
├─ ❌ Não pode criar/editar veículos
├─ ❌ Não pode registrar manutenção
├─ ❌ Não pode acessar outros motoristas
└─ ❌ Não pode exportar relatórios
\`\`\`

## Validações Implementadas

\`\`\`
VEÍCULO
├─ Placa: required, unique, formato ABC1234
├─ Marca: required, min 2 chars
├─ Modelo: required, min 2 chars
├─ Ano: required, between 1900-2100
├─ Chassi: required, unique, min 10 chars
├─ Carga: optional, > 0
└─ RENAVAM: optional, 11 digits

MOTORISTA
├─ Nome: required, min 5 chars
├─ CNH: required, unique, 11 digits
├─ Categoria: required, enum (A,B,C,D,E)
├─ Validade: required, date > today
├─ Email: optional, valid email format
├─ Phone: optional, valid phone format
└─ Especial: optional, boolean

MANUTENÇÃO
├─ Data: required, not future
├─ Tipo: required, enum (preventiva/corretiva)
├─ Mecânico: required, min 3 chars
├─ Estabelecimento: required, min 3 chars
├─ Descrição: required, min 10 chars
├─ Custo: optional, > 0
└─ Quilometragem: optional, > 0

QUESTIONÁRIO
├─ Status: required, enum (driving/stopped)
├─ Motorista: required, exists
├─ Veículo: required, exists
├─ GPS: optional, valid coordinates
└─ Timestamp: auto-generated
\`\`\`

## Índices no Banco de Dados

\`\`\`
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_drivers_cnh ON drivers(cnhNumber);
CREATE INDEX idx_maintenance_vehicle ON maintenance_records(vehicleId);
CREATE INDEX idx_maintenance_date ON maintenance_records(maintenanceDate);
CREATE INDEX idx_questionnaire_driver ON driver_questionnaire_responses(driverId);
CREATE INDEX idx_questionnaire_date ON driver_questionnaire_responses(timestampResponse);
CREATE INDEX idx_audit_user ON audit_logs(userId);
CREATE INDEX idx_audit_date ON audit_logs(createdAt);
\`\`\`

## Escalabilidade

\`\`\`
Atual (v1.0):
├─ Single instance
├─ PostgreSQL local
├─ Suporta 100+ veículos
└─ ~50 usuários simultâneos

Escalável para v2.0:
├─ Load balancer (nginx/HAProxy)
├─ Multiple API instances
├─ Database replication
├─ Redis cache layer
├─ CDN para assets
├─ Suporta 1000+ veículos
└─ ~500+ usuários simultâneos

Cloud Native (v3.0):
├─ Kubernetes orquestração
├─ Auto-scaling
├─ Managed database (RDS/Cloud SQL)
├─ Distributed cache (ElastiCache)
├─ Unlimited scale
└─ Multi-region deployment
\`\`\`

---

**Sistema moderno, escalável e pronto para produção.**
