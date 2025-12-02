# Guia de Deploy - Fleet Management System

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL 12+
- Git (para deploy contínuo)

## Deploy Local (Desenvolvimento)

### 1. Backend Setup

\`\`\`bash
cd backend
npm install

# Criar arquivo .env
cp .env.example .env

# Configurar variáveis de ambiente
# DATABASE_URL=postgresql://user:password@localhost:5432/fleet_db
# JWT_SECRET=your-secret-key
# PORT=3000

# Executar migrations
npm run db:migrate

# Popular com dados de teste
npm run db:seed

# Iniciar servidor
npm run dev
\`\`\`

### 2. Frontend Setup

\`\`\`bash
cd frontend
npm install

# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Iniciar desenvolvedor
npm run dev
\`\`\`

Acesse: http://localhost:3001

**Credenciais de Teste:**
- Admin: admin@fleet.com / password123
- Gestor: manager@fleet.com / password123
- Motorista: driver1@fleet.com / password123

## Deploy em Produção (Heroku)

### Backend

\`\`\`bash
# 1. Criar app no Heroku
heroku create fleet-management-backend

# 2. Adicionar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 3. Configurar variáveis de ambiente
heroku config:set JWT_SECRET=sua-chave-secreta
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main
\`\`\`

### Frontend

\`\`\`bash
cd frontend

# 1. Build
npm run build

# 2. Criar app Vercel
vercel

# 3. Configurar variável de ambiente
# NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com/api
\`\`\`

## Deploy com Docker

### Backend

\`\`\`bash
cd backend
docker build -t fleet-backend .
docker run -p 3000:3000 --env-file .env fleet-backend
\`\`\`

### Frontend

\`\`\`bash
cd frontend
docker build -t fleet-frontend .
docker run -p 3001:3000 fleet-frontend
\`\`\`

### Docker Compose (Completo)

\`\`\`bash
docker-compose up
\`\`\`

## Verificação de Saúde

### Backend Health Check
\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

### API Endpoints
- Documentação Swagger: http://localhost:3000/api/docs
- Exemplos de requests: backend/src/example-requests.json

## Troubleshooting

### Erro de Conexão com Banco
\`\`\`
Verifique se PostgreSQL está rodando
Confirme DATABASE_URL está correto
Rode: npm run db:migrate
\`\`\`

### Erro de CORS
\`\`\`
Adicione FRONTEND_URL às variáveis de ambiente do backend
Exemplo: FRONTEND_URL=http://localhost:3001
\`\`\`

### Erro de Autenticação
\`\`\`
Limpe localStorage: console.log(localStorage.clear())
Limpe cookies do navegador
Tente fazer login novamente
\`\`\`

## Monitoramento

### Logs
\`\`\`bash
# Backend
npm run logs

# Frontend
vercel logs
\`\`\`

### Performance
- Frontend: Use DevTools de Performance
- Backend: Habilite APM com New Relic ou similar

## Backup de Dados

\`\`\`bash
# Backup PostgreSQL
pg_dump fleet_db > backup.sql

# Restaurar
psql fleet_db < backup.sql
\`\`\`
`
