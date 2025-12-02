# Fleet Management System - Setup Completo

## Status: ✅ Pronto para Deploy

Este é um sistema completo de gerenciamento de frota com backend Node.js/Express e frontend React/Next.js.

## O que foi entregue

### Backend
- ✅ API REST com Express + TypeScript
- ✅ Autenticação JWT com refresh tokens
- ✅ PostgreSQL com Prisma ORM
- ✅ 8 tabelas principais com relacionamentos
- ✅ Endpoints para: Autenticação, Veículos, Motoristas, Manutenção, Questionário, Relatórios
- ✅ Validações, tratamento de erros, logs de auditoria
- ✅ Testes unitários com Jest
- ✅ Documentação Swagger/OpenAPI

### Frontend
- ✅ Next.js 14 com App Router
- ✅ React 18 com hooks
- ✅ Tailwind CSS v3
- ✅ Zustand para state management
- ✅ React Hook Form para formulários
- ✅ Autenticação protegida por JWT
- ✅ Interface responsiva (mobile-first)
- ✅ Internacionalização PT-BR

### Funcionalidades
- ✅ Cadastro de veículos e motoristas
- ✅ Histórico de associações veículo-motorista
- ✅ Registro de manutenção preventiva/corretiva
- ✅ Questionário "Rodando/Parado" com GPS
- ✅ Dashboard com métricas
- ✅ Exportação de relatórios em CSV
- ✅ Controle de acesso por roles (Admin, Gestor, Motorista)
- ✅ Auditoria de alterações críticas

## Como Iniciar

### 1. Pré-requisitos
\`\`\`bash
# Verificar versões
node --version  # Deve ser 18+
npm --version   # Qualquer versão recente
\`\`\`

### 2. Configurar Backend
\`\`\`bash
cd backend

# Instalar dependências
npm install

# Criar .env a partir do exemplo
cp .env.example .env

# IMPORTANTE: Editar .env com suas configurações
# - DATABASE_URL: conexão PostgreSQL
# - JWT_SECRET: chave secreta aleatória
# - PORT: porta (padrão 3000)

# Criar e popular banco de dados
npm run db:migrate
npm run db:seed

# Iniciar servidor
npm run dev
\`\`\`

**Backend rodando em:** http://localhost:3000/api

### 3. Configurar Frontend
\`\`\`bash
# Em outro terminal
cd frontend

# Instalar dependências
npm install

# Criar .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Iniciar desenvolvimento
npm run dev
\`\`\`

**Frontend rodando em:** http://localhost:3000

### 4. Fazer Login
Abra http://localhost:3000 e entre com:

| Usuário | Senha |
|---------|-------|
| admin@fleet.com | password123 |
| manager@fleet.com | password123 |
| driver1@fleet.com | password123 |

## Estrutura de Pastas

\`\`\`
fleet-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Handlers de rotas
│   │   ├── services/         # Lógica de negócio
│   │   ├── repositories/     # Acesso a dados
│   │   ├── middlewares/      # Auth, validação, etc
│   │   ├── routes/           # Definição de rotas
│   │   ├── database/         # Migrations e seeds
│   │   ├── types/            # Interfaces TypeScript
│   │   ├── utils/            # Funções auxiliares
│   │   └── app.ts            # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/                  # Páginas (Next.js App Router)
│   ├── components/           # Componentes React
│   ├── services/             # Cliente HTTP (Axios)
│   ├── store/                # Zustand store
│   ├── types/                # Tipos TypeScript
│   ├── utils/                # Utilitários
│   ├── middleware.ts         # Auth middleware
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── API.md               # Documentação de endpoints
│   ├── ARCHITECTURE.md      # Visão geral da arquitetura
│   └── DATABASE.md          # Schema do banco
│
├── DEPLOYMENT_GUIDE.md      # Como fazer deploy
├── TROUBLESHOOTING.md       # Resolução de problemas
├── QUICK_START.md           # Início rápido
└── README_SETUP.md          # Este arquivo
\`\`\`

## Endpoints Principais

### Autenticação
\`\`\`
POST   /api/auth/register      # Registrar novo usuário
POST   /api/auth/login         # Fazer login (retorna JWT)
POST   /api/auth/refresh       # Renovar token expirado
GET    /api/auth/profile       # Perfil do usuário
\`\`\`

### Veículos
\`\`\`
GET    /api/vehicles           # Listar veículos
POST   /api/vehicles           # Criar veículo
GET    /api/vehicles/:id       # Obter detalhes
PUT    /api/vehicles/:id       # Atualizar veículo
DELETE /api/vehicles/:id       # Deletar veículo
\`\`\`

### Motoristas
\`\`\`
GET    /api/drivers            # Listar motoristas
POST   /api/drivers            # Criar motorista
GET    /api/drivers/:id        # Obter detalhes
PUT    /api/drivers/:id        # Atualizar motorista
POST   /api/drivers/:id/assign-vehicle  # Associar veículo
\`\`\`

### Manutenção
\`\`\`
GET    /api/maintenance/vehicle/:vehicleId  # Histórico do veículo
POST   /api/maintenance        # Registrar manutenção
GET    /api/maintenance/:id    # Detalhes
PUT    /api/maintenance/:id    # Atualizar
\`\`\`

### Questionário
\`\`\`
POST   /api/questionnaire      # Registrar status (rodando/parado)
GET    /api/questionnaire/driver/:driverId  # Histórico
GET    /api/questionnaire/driver/:driverId/latest  # Último registro
\`\`\`

### Relatórios
\`\`\`
GET    /api/reports/metrics    # Métricas do dashboard
GET    /api/reports/maintenance/csv  # Exportar manutenção
GET    /api/reports/questionnaire/csv  # Exportar questionário
\`\`\`

## Credenciais de Teste

Após rodar o seed, estarão disponíveis:

**Admin (acesso total):**
- Email: admin@fleet.com
- Senha: password123

**Gestor (relatórios e gerenciamento):**
- Email: manager@fleet.com
- Senha: password123

**Motorista (acesso limitado):**
- Email: driver1@fleet.com
- Senha: password123
- Email: driver2@fleet.com
- Senha: password123

## Validação do Build

Antes de fazer deploy, execute:

\`\`\`bash
# Frontend - Verificar exports
cd frontend && npm run verify

# Frontend - Build
npm run build

# Backend - Testes
cd ../backend && npm test
\`\`\`

## Deploy

### Desenvolvimento
\`\`\`bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
\`\`\`

### Produção (Docker)
\`\`\`bash
docker-compose up -d
\`\`\`

### Produção (Vercel + Heroku)
Veja [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## Troubleshooting

### "Module not found"
\`\`\`bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run verify
\`\`\`

### Erro de conexão com banco
1. Confirme PostgreSQL está rodando
2. Verifique DATABASE_URL em backend/.env
3. Execute: \`npm run db:migrate\`

### Erro de CORS
1. Confirme NEXT_PUBLIC_API_URL em frontend/.env.local
2. Confira FRONTEND_URL em backend/.env

### Port já está em uso
\`\`\`bash
# Mudar porta do backend
# Edit backend/.env: PORT=3001

# Mudar porta do frontend
# Execute: npm run dev -- -p 3002
\`\`\`

## Próximos Passos

1. ✅ Instalar e configurar (veja acima)
2. ✅ Testar todas as funcionalidades
3. ✅ Ajustar variáveis de ambiente
4. ✅ Configurar banco de dados de produção
5. ✅ Fazer deploy (Heroku, Vercel, AWS, etc)
6. ✅ Configurar CI/CD (GitHub Actions)
7. ✅ Monitorar e ajustar performance

## Documentação Adicional

- [API Documentation](./docs/API.md) - Todos os endpoints com exemplos
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy em vários ambientes
- [Troubleshooting](./TROUBLESHOOTING.md) - Resolução de problemas comuns
- [Architecture](./docs/ARCHITECTURE.md) - Visão técnica da solução
- [Database](./docs/DATABASE.md) - Schema e relacionamentos

## Suporte

Para problemas ou dúvidas:
1. Consulte os arquivos .md acima
2. Verifique TROUBLESHOOTING.md
3. Revise os logs (console.log no código)
4. Verifique as variáveis de ambiente

## Licença

MIT - Sinta-se livre para usar e modificar

---

**Sistema pronto para produção** ✅

Qualquer dúvida, consulte a documentação ou execute \`npm run verify\`
