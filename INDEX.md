# Fleet Management System - Índice Completo

## Documentação Principal

- **[README_SETUP.md](README_SETUP.md)** - Guia de instalação e início rápido
- **[QUICK_START.md](QUICK_START.md)** - Instruções passo a passo
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deploy em produção
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Resolução de problemas
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Checklist de verificação

## Documentação Técnica

### Backend

\`\`\`
backend/
├── src/
│   ├── app.ts                    # Entry point com Express setup
│   ├── config/database.ts        # Conexão PostgreSQL
│   ├── middlewares/
│   │   ├── auth.ts              # Verificação JWT
│   │   └── errorHandler.ts      # Tratamento de erros
│   ├── controllers/
│   │   ├── AuthController.ts    # Login, register, refresh
│   │   ├── VehicleController.ts # CRUD de veículos
│   │   ├── DriverController.ts  # CRUD de motoristas
│   │   ├── MaintenanceController.ts  # Manutenção
│   │   ├── QuestionnaireController.ts # Status
│   │   └── ReportController.ts  # Relatórios
│   ├── services/
│   │   ├── AuthService.ts       # Lógica de autenticação
│   │   ├── VehicleService.ts    # Lógica de veículos
│   │   ├── DriverService.ts     # Lógica de motoristas
│   │   ├── MaintenanceService.ts # Lógica de manutenção
│   │   ├── QuestionnaireService.ts # Lógica de status
│   │   └── ReportService.ts     # Geração de relatórios
│   ├── repositories/            # Acesso a dados (Prisma)
│   ├── routes/
│   │   ├── index.ts             # Agregador de rotas
│   │   ├── auth.ts              # Rotas de autenticação
│   │   ├── vehicles.ts          # Rotas de veículos
│   │   ├── drivers.ts           # Rotas de motoristas
│   │   ├── maintenance.ts       # Rotas de manutenção
│   │   ├── questionnaire.ts     # Rotas de questionário
│   │   └── reports.ts           # Rotas de relatórios
│   ├── types/index.ts           # Interfaces TypeScript
│   ├── utils/
│   │   ├── jwt.ts               # Funções JWT
│   │   ├── password.ts          # Hash de senhas
│   │   └── validators.ts        # Validações
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql  # Schema DDL
│   │   └── seeds/
│   │       └── seed.js          # Dados de teste
│   └── tests/
│       ├── auth.test.ts         # Testes de auth
│       └── vehicles.test.ts     # Testes de veículos
├── .env.example                 # Variáveis de ambiente (exemplo)
├── package.json                 # Dependências
├── tsconfig.json                # Configuração TypeScript
├── jest.config.js               # Configuração de testes
├── Dockerfile                   # Build Docker
└── README.md                    # Documentação do backend
\`\`\`

### Frontend

\`\`\`
frontend/
├── app/
│   ├── layout.tsx               # Layout raiz
│   ├── login/page.tsx           # Página de login
│   ├── dashboard/page.tsx       # Dashboard
│   ├── vehicles/page.tsx        # Gerenciamento de veículos
│   ├── drivers/page.tsx         # Gerenciamento de motoristas
│   ├── maintenance/page.tsx     # Manutenção
│   ├── questionnaire/page.tsx   # Questionário do motorista
│   ├── reports/page.tsx         # Relatórios
│   └── globals.css              # Estilos globais
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx        # Formulário de login
│   ├── layout/
│   │   ├── MainLayout.tsx       # Layout principal
│   │   ├── Header.tsx           # Cabeçalho
│   │   └── Sidebar.tsx          # Menu lateral
│   ├── vehicles/
│   │   ├── VehicleForm.tsx      # Formulário de veículos
│   │   └── VehicleList.tsx      # Lista de veículos
│   ├── drivers/
│   │   └── DriverForm.tsx       # Formulário de motoristas
│   ├── maintenance/
│   │   └── MaintenanceForm.tsx  # Formulário de manutenção
│   └── questionnaire/           # (Página integrada)
├── services/
│   ├── api.ts                   # Cliente HTTP (Axios)
│   └── index.ts                 # Barrel export
├── store/
│   ├── authStore.ts             # Zustand store
│   └── index.ts                 # Barrel export
├── types/
│   └── index.ts                 # Interfaces TypeScript
├── utils/
│   ├── api-client.ts            # Funções auxiliares API
│   ├── constants.ts             # Constantes
│   └── index.ts                 # Barrel export
├── middleware.ts                # Auth middleware (Next.js)
├── .env.example                 # Variáveis de ambiente (exemplo)
├── .env.local                   # Variáveis de ambiente (local)
├── package.json                 # Dependências
├── tsconfig.json                # Configuração TypeScript
├── next.config.js               # Configuração Next.js
├── Dockerfile                   # Build Docker
├── .gitignore                   # Git ignore
└── README.md                    # Documentação do frontend
\`\`\`

### Scripts e Configuração

\`\`\`
project-root/
├── docker-compose.yml           # Orquestração Docker
├── VALIDATE.sh                  # Script de validação
├── QUICK_START.md               # Início rápido
├── README_SETUP.md              # Setup completo
├── DEPLOYMENT_GUIDE.md          # Deploy em produção
├── TROUBLESHOOTING.md           # Problemas comuns
├── VERIFICATION_CHECKLIST.md    # Checklist
└── INDEX.md                     # Este arquivo
\`\`\`

## Banco de Dados

### Tabelas (8 principais)

1. **users** - Usuários do sistema
   - id, email, password, name, role, createdAt, updatedAt

2. **vehicles** - Veículos da frota
   - id, plate, renavam, brand, model, year, color, chassisNumber, loadCapacity, transportType, active, createdAt, updatedAt

3. **drivers** - Motoristas
   - id, name, cnhNumber, cnhCategory, cnhExpiryDate, phone, email, specialLoadCertified, active, createdAt, updatedAt

4. **vehicle_driver_assignments** - Histórico de atribuições
   - id, vehicleId, driverId, assignedAt, unassignedAt, notes

5. **maintenance_records** - Manutenções realizadas
   - id, vehicleId, maintenanceDate, maintenanceType, mechanicName, establishmentName, serviceDescription, cost, odometerReading, createdAt

6. **driver_questionnaire_responses** - Respostas do questionário
   - id, driverId, vehicleId, status, gpsLatitude, gpsLongitude, timestampResponse, createdAt

7. **audit_logs** - Logs de auditoria
   - id, userId, action, entityType, entityId, changes, createdAt

8. **refresh_tokens** - Tokens de renovação
   - id, userId, token, expiresAt, createdAt

## Endpoints Disponíveis

### Autenticação (POST)
- `/api/auth/register` - Registrar novo usuário
- `/api/auth/login` - Login (retorna JWT + refresh token)
- `/api/auth/refresh` - Renovar token expirado
- `/api/auth/profile` - Obter dados do usuário autenticado

### Veículos (REST)
- `GET /api/vehicles` - Listar todos (filtrar por active)
- `POST /api/vehicles` - Criar novo veículo
- `GET /api/vehicles/:id` - Obter detalhes
- `PUT /api/vehicles/:id` - Atualizar veículo
- `DELETE /api/vehicles/:id` - Deletar veículo

### Motoristas (REST)
- `GET /api/drivers` - Listar todos (filtrar por active)
- `POST /api/drivers` - Criar novo motorista
- `GET /api/drivers/:id` - Obter detalhes
- `PUT /api/drivers/:id` - Atualizar motorista
- `POST /api/drivers/:id/assign-vehicle` - Associar veículo
- `GET /api/drivers/:id/current-vehicle` - Obter veículo atual

### Manutenção (REST)
- `GET /api/maintenance/vehicle/:vehicleId` - Histórico do veículo
- `POST /api/maintenance` - Registrar manutenção
- `GET /api/maintenance/:id` - Obter detalhes
- `PUT /api/maintenance/:id` - Atualizar registro

### Questionário (POST/GET)
- `POST /api/questionnaire` - Registrar status (rodando/parado)
- `GET /api/questionnaire/driver/:driverId` - Histórico do motorista
- `GET /api/questionnaire/driver/:driverId/latest` - Último registro

### Relatórios (GET)
- `GET /api/reports/metrics` - Métricas do dashboard
- `GET /api/reports/maintenance/csv` - Exportar manutenção (CSV)
- `GET /api/reports/questionnaire/csv` - Exportar questionário (CSV)

## Variáveis de Ambiente

### Backend (.env)
\`\`\`
DATABASE_URL=postgresql://user:password@localhost:5432/fleet_db
JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
FRONTEND_URL=http://localhost:3001
\`\`\`

### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

## Testando a API

### Com curl
\`\`\`bash
# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@fleet.com","password":"password123"}'

# Usar token retornado em requests subsequentes
curl http://localhost:3000/api/vehicles \\
  -H "Authorization: Bearer <TOKEN>"
\`\`\`

### Com Postman
1. Importe a collection do arquivo `backend/src/example-requests.json`
2. Configure a variável `base_url`
3. Execute requests

## Recursos Adicionais

### Logs
- Frontend: Browser DevTools Console
- Backend: Arquivo `logs/` ou console

### Documentação API
- Swagger/OpenAPI: http://localhost:3000/api/docs

### Performance
\`\`\`bash
# Frontend
cd frontend && npm run analyze

# Backend
npm run profile
\`\`\`

### Testes
\`\`\`bash
# Backend
npm test

# Frontend
npm run test (quando implementado)
\`\`\`

## Checklist de Implementação

- ✅ Autenticação JWT
- ✅ Cadastro de veículos e motoristas
- ✅ Gerenciamento de manutenção
- ✅ Questionário com GPS
- ✅ Relatórios em CSV
- ✅ Dashboard com métricas
- ✅ Roles e permissões
- ✅ Validações
- ✅ Testes
- ✅ Documentação
- ✅ Docker
- ✅ TypeScript
- ✅ Tratamento de erros
- ✅ Logs de auditoria

## Próximas Melhorias (Futuro)

- [ ] Adicionar WebSockets para rastreamento em tempo real
- [ ] Integração com Google Maps para rotas
- [ ] Notificações push
- [ ] Aplicativo mobile nativo
- [ ] Analytics avançado
- [ ] Machine Learning para previsão de manutenção
- [ ] Integração com sistemas de frota IoT
- [ ] Backup automático e recuperação

---

**Versão:** 1.0.0  
**Data:** 2025-11-28  
**Status:** Pronto para Produção
