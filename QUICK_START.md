# Quick Start Guide - Fleet Management System

## 1. Iniciar Backend

\`\`\`bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env com suas configurações:
# - DATABASE_URL=postgresql://postgres:password@localhost:5432/fleet_db
# - JWT_SECRET=seu-segredo-super-seguro-aqui
# - PORT=3000

# Executar migrations
npm run db:migrate

# Popular com dados de teste
npm run db:seed

# Iniciar servidor
npm run dev
\`\`\`

O backend estará disponível em: **http://localhost:3000/api**

## 2. Iniciar Frontend

Em outro terminal:

\`\`\`bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Iniciar desenvolvimento
npm run dev
\`\`\`

O frontend estará disponível em: **http://localhost:3000**

## 3. Acessar a Aplicação

Abra seu navegador e acesse: **http://localhost:3000**

### Credenciais Disponíveis

| Papel | Email | Senha |
|-------|-------|-------|
| Admin | admin@fleet.com | password123 |
| Gestor | manager@fleet.com | password123 |
| Motorista | driver1@fleet.com | password123 |

## 4. Testar Funcionalidades

### Dashboard
- Visualizar métricas gerais
- Ver veículos e motoristas ativos

### Veículos
- Criar novo veículo
- Visualizar lista de veículos

### Motoristas
- Cadastrar motoristas
- Gerenciar CNH e dados

### Manutenção
- Registrar manutenção preventiva/corretiva
- Visualizar histórico por veículo

### Status (para Motoristas)
- Responder "Estou rodando" ou "Estou parado"
- Coletar GPS automaticamente quando rodando

### Relatórios
- Exportar histórico de manutenção em CSV
- Exportar respostas de status em CSV

## Documentação Completa

- [API Documentation](./docs/API.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Architecture](./docs/ARCHITECTURE.md)

## Suporte

Para dúvidas ou problemas, consulte:
1. TROUBLESHOOTING.md
2. Documentação da API
3. Código comentado nos componentes
