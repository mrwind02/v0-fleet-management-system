# Guia Completo de Setup - Fleet Management System

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 12+ instalado e rodando
- npm ou yarn

## Instalação Rápida (5 minutos)

### 1. Backend

\`\`\`bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env (copiar do .env.example)
cp .env.example .env

# Verificar variáveis de banco de dados em .env
# Padrão: 
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=fleet_management
# DB_USER=postgres
# DB_PASSWORD=postgres

# Criar tabelas no banco de dados
npm run db:migrate

# Popular banco com dados de teste
npm run db:seed

# Rodar backend
npm run dev
\`\`\`

### 2. Frontend

\`\`\`bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# Rodar frontend
npm run dev
\`\`\`

## Acessar a Aplicação

- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api
- Swagger/Docs: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

## Credenciais de Teste

\`\`\`
Admin:
  Email: admin@fleet.com
  Senha: password123
  Papel: admin

Gerente:
  Email: manager@fleet.com
  Senha: password123
  Papel: manager

Motorista 1:
  Email: driver1@fleet.com
  Senha: password123
  Papel: driver

Motorista 2:
  Email: driver2@fleet.com
  Senha: password123
  Papel: driver
\`\`\`

## Verificar Setup

### Verificação Manual

\`\`\`bash
# 1. Verificar se backend está rodando
curl http://localhost:3000/health

# Resposta esperada:
# {"status":"OK","timestamp":"..."}

# 2. Testar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleet.com","password":"password123"}'

# Resposta esperada:
# {"success":true,"data":{"user":{...},"accessToken":"...","refreshToken":"..."}}
\`\`\`

### Verificação Automática

\`\`\`bash
cd backend
node verify-setup.js
\`\`\`

## Troubleshooting

### Erro: "Não consegue conectar à API"

**1. Verificar se backend está rodando**
\`\`\`bash
cd backend
npm run dev
# Deve aparecer: "Server running on port 3000"
\`\`\`

**2. Verificar banco de dados**
\`\`\`bash
# PostgreSQL deve estar rodando
psql -U postgres -d fleet_management -c "SELECT COUNT(*) FROM users;"

# Se erro, banco não existe. Execute:
cd backend
npm run db:migrate
npm run db:seed
\`\`\`

**3. Verificar rotas**
- Abra http://localhost:3000/api-docs
- Deve mostrar documentação Swagger
- Se 404, backend não foi iniciado corretamente

### Erro: "Credenciais inválidas"

**Solução:**
\`\`\`bash
cd backend
npm run db:seed
# Reexecuta o seed com usuários corretos
\`\`\`

### Erro: "CORS bloqueado"

**Verificar em backend/.env:**
\`\`\`
CORS_ORIGIN=http://localhost:3001
# ou
CORS_ORIGIN=*
\`\`\`

### Console do navegador mostra erro estranho

1. Abra F12 (DevTools)
2. Vá para aba "Network"
3. Faça o login
4. Procure pela requisição POST para `/api/auth/login`
5. Clique nela e veja a resposta (tab "Response")
6. O erro real estará lá

## Estrutura de Pastas

\`\`\`
fleet-management-system/
├── backend/
│   ├── src/
│   │   ├── app.ts (arquivo principal - contém setupRoutes(app))
│   │   ├── routes/
│   │   │   ├── index.ts (registra todas as rotas)
│   │   │   ├── auth.ts (endpoints de login/registro)
│   │   │   ├── vehicles.ts
│   │   │   ├── drivers.ts
│   │   │   └── ...
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   │   └── auth.ts (validação de JWT)
│   │   └── config/
│   │       └── database.ts (conexão PostgreSQL)
│   ├── scripts/
│   │   ├── migrate.js (cria tabelas)
│   │   ├── seed.js (popula dados de teste)
│   │   └── verify-setup.js (verifica setup)
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx (raiz)
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── ...
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── LoginDebugPanel.tsx (aparece em desenvolvimento)
│   │   └── ...
│   ├── services/
│   │   └── api.ts (cliente HTTP com interceptores)
│   ├── store/
│   │   └── authStore.ts (gerenciamento de estado)
│   └── package.json
\`\`\`

## Fluxo de Autenticação

\`\`\`
1. Frontend (LoginForm) → POST /api/auth/login
           ↓
2. Backend (AuthController) → AuthService.login()
           ↓
3. Banco: SELECT user WHERE email = ?
           ↓
4. Validar senha com bcrypt
           ↓
5. Gerar JWT tokens
           ↓
6. Retornar { user, accessToken, refreshToken }
           ↓
7. Frontend: Armazenar tokens em localStorage
           ↓
8. Redirecionar para /dashboard
\`\`\`

## Próximos Passos

1. Explore o Dashboard
2. Cadastre um veículo
3. Cadastre um motorista
4. Teste o questionário (Rodando/Parado)
5. Veja os relatórios

## Contato / Suporte

Para mais detalhes, veja:
- API Documentation: http://localhost:3000/api-docs
- Backend Logs: Console onde `npm run dev` está rodando
- Frontend Console: F12 > Console
- Network Debug: F12 > Network tab (quando faz login)
