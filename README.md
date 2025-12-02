# Fleet Management System

Sistema completo de gerenciamento de frota com autenticação JWT, gestão de veículos, motoristas, manutenção e relatórios.

## Características Principais

✅ **Autenticação JWT** - Roles: Admin, Gestor, Motorista
✅ **Cadastro de Frota** - Veículos e motoristas com histórico
✅ **Manutenção** - Registro de manutenções preventivas/corretivas
✅ **Questionário do Motorista** - Status "Rodando/Parado" com GPS
✅ **Relatórios** - Exportação em CSV
✅ **Dashboard** - Métricas em tempo real
✅ **Mobile First** - Interface responsiva

## Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## Instalação Rápida

### 1. Clone o Repositório
\`\`\`bash
git clone <repository-url>
cd fleet-management-system
\`\`\`

### 2. Setup Backend

\`\`\`bash
cd backend

# Instale dependências
npm install

# Configure o banco de dados
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# Execute migrações
npm run db:migrate

# Popule com dados de teste
npm run db:seed

# Inicie o servidor
npm run dev
\`\`\`

O backend estará disponível em `http://localhost:3000`

### 3. Setup Frontend

\`\`\`bash
cd ../frontend

# Instale dependências
npm install

# Configure variáveis de ambiente
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# Inicie o servidor de desenvolvimento
npm run dev
\`\`\`

O frontend estará disponível em `http://localhost:3000`

## Credenciais de Teste

Após executar `npm run db:seed`, use:

\`\`\`
Admin:    admin@fleet.com / password123
Gestor:   manager@fleet.com / password123
Motorista 1: driver1@fleet.com / password123
Motorista 2: driver2@fleet.com / password123
\`\`\`

## Estrutura do Projeto

\`\`\`
fleet-management-system/
├── backend/
│   ├── src/
│   │   ├── config/       - Configuração do banco
│   │   ├── controllers/  - Controladores de rotas
│   │   ├── services/     - Lógica de negócio
│   │   ├── routes/       - Definição de rotas
│   │   ├── middlewares/  - Autenticação, autorização
│   │   ├── utils/        - JWT, Hash, etc
│   │   ├── types/        - Tipos TypeScript
│   │   └── tests/        - Testes unitários
│   ├── database/
│   │   ├── migrations/   - Scripts SQL
│   │   └── seeds/        - Dados de teste
│   └── scripts/
│       ├── migrate.js    - Executar migrações
│       └── seed.js       - Populate dados
│
└── frontend/
    ├── components/       - Componentes React
    │   ├── auth/
    │   ├── layout/
    │   ├── vehicles/
    │   ├── drivers/
    │   ├── maintenance/
    │   └── questionnaire/
    ├── services/         - Cliente API
    ├── store/            - Zustand state
    ├── app/              - Páginas Next.js
    └── public/           - Arquivos estáticos
\`\`\`

## Fluxos Principais

### 1. Autenticação
\`\`\`
Login → JWT gerado → Token armazenado → Acesso a rotas protegidas
\`\`\`

### 2. Cadastro de Veículos e Motoristas
\`\`\`
Admin/Gestor → Cadastra Veículo
Admin/Gestor → Cadastra Motorista
Admin/Gestor → Associa Motorista a Veículo
\`\`\`

### 3. Questionário do Motorista
\`\`\`
Motorista abre app → "Estou rodando/parado?"
Se "rodando" → GPS coletado (se permitido) → Ações limitadas
Se "parado" → Funções completas disponíveis
\`\`\`

### 4. Registro de Manutenção
\`\`\`
Admin/Gestor → Seleciona Veículo
Admin/Gestor → Registra Manutenção (tipo, data, custo, km, descrição)
Sistema → Armazena com anexos opcionais
\`\`\`

### 5. Relatórios
\`\`\`
Admin/Gestor → Filtra período e veículo
Sistema → Gera CSV
Admin/Gestor → Download
\`\`\`

## API Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/profile` - Obter perfil (requer token)

### Veículos
- `POST /api/vehicles` - Criar veículo
- `GET /api/vehicles` - Listar veículos
- `GET /api/vehicles/:id` - Obter veículo
- `PUT /api/vehicles/:id` - Atualizar veículo
- `DELETE /api/vehicles/:id` - Deletar veículo

### Motoristas
- `POST /api/drivers` - Criar motorista
- `GET /api/drivers` - Listar motoristas
- `POST /api/drivers/:driverId/assign-vehicle` - Atribuir veículo
- `GET /api/drivers/:driverId/current-vehicle` - Veículo atual

### Manutenção
- `POST /api/maintenance` - Registrar manutenção
- `GET /api/maintenance/vehicle/:vehicleId` - Histórico de veículo
- `GET /api/maintenance/:id` - Obter registro

### Questionário
- `POST /api/questionnaire` - Registrar status
- `GET /api/questionnaire/driver/:driverId/latest` - Último status

### Relatórios
- `GET /api/reports/metrics` - Dashboard
- `GET /api/reports/maintenance/csv` - Export manutenção
- `GET /api/reports/questionnaire/csv` - Export questionário

## Testes

### Backend
\`\`\`bash
cd backend
npm test                    # Executar testes
npm run test:watch        # Modo watch
npm run test:coverage     # Cobertura de testes
\`\`\`

### Testes Cobertos
- Autenticação (registro e login)
- Criação e listagem de veículos
- Criação e listagem de motoristas
- Associação veículo-motorista
- Registros de manutenção

## Deploy

### Opção 1: Vercel (Recomendado para Frontend)
\`\`\`bash
# Frontend
cd frontend
npm install -g vercel
vercel

# Variáveis de Ambiente
NEXT_PUBLIC_API_URL=https://seu-api-url.com/api
\`\`\`

### Opção 2: Heroku (Backend)
\`\`\`bash
cd backend
npm install -g heroku
heroku login
heroku create seu-app
git push heroku main
\`\`\`

### Opção 3: Docker Compose (Local)
\`\`\`bash
docker-compose up -d
\`\`\`

## Documentação

Veja detalhes completos em:
- `docs/API.md` - Documentação da API
- `docs/ARCHITECTURE.md` - Arquitetura do sistema
- `docs/DATABASE.md` - Schema do banco de dados

## Validações e Regras de Negócio

### Veículos
- Placa única no sistema
- Ano não pode ser menor que 1900
- Capacidade de carga > 0
- Transporte padrão: "Rodoviário"

### Motoristas
- CNH única no sistema
- Data de expiração não pode ser no passado
- Categoria deve estar em: A, B, C, D, E, ADI VT

### Manutenção
- Data de manutenção não pode ser no futuro
- Custo deve ser > 0
- Descrição obrigatória
- Quilometragem deve ser crescente

### Questionário
- Motorista deve ter veículo associado para "rodando"
- GPS somente coletado se motorista permitiu e está rodando
- Um registro por motorista por vez

### Auditoria
- Alterações críticas são registradas
- Cada operação inclui user_id, timestamp, valores anteriores/novos
- Retenção de logs por 1 ano

## Suporte a Internacionalização

O sistema está configurado para **pt-BR** (Português Brasileiro).

Para adicionar outras línguas:

1. Crie arquivo `i18n/pt-BR.json` e `i18n/en-US.json`
2. Use hook customizado `useTranslation()` nos componentes
3. Armazene preferência de idioma no localStorage

Exemplo:
\`\`\`json
// i18n/pt-BR.json
{
  "dashboard": "Dashboard",
  "vehicles": "Veículos",
  "drivers": "Motoristas"
}
\`\`\`

## Performance

### Backend
- Índices no banco para queries frequentes
- Paginação em listagens grandes
- Cache com Redis (opcional via Upstash)
- Compressão com Gzip

### Frontend
- Code splitting automático do Next.js
- Images otimizadas
- State management com Zustand (leve)
- Lazy loading de componentes

## Segurança

✅ JWT com 24h expiração + Refresh tokens 7d
✅ Hash bcrypt para senhas
✅ Row-Level Security pronto para Supabase
✅ CORS configurável
✅ Helmet.js para headers de segurança
✅ SQL parameterizado (previne SQL injection)
✅ Rate limiting recomendado (nginx/API gateway)

## Troubleshooting

### Erro de Conexão com BD
\`\`\`bash
# Verifique credenciais no .env
# Verifique se PostgreSQL está rodando
psql -U postgres
\`\`\`

### Token Expirado
\`\`\`
O frontend automaticamente tenta renovar com refresh token
Se falhar, usuário é redirecionado para login
\`\`\`

### CORS Error
\`\`\`bash
# Verifique CORS_ORIGIN no .env backend
# Frontend deve ser adicionado à lista de origens permitidas
\`\`\`

## Roadmap Futuro

- [ ] Integração com Google Maps (rastreamento em tempo real)
- [ ] WhatsApp notifications para manutenção vencida
- [ ] Integração com sistemas de frota (Sascar, Trackenn)
- [ ] Mobile app nativa (React Native)
- [ ] Dashboards analíticos avançados
- [ ] Notificações push
- [ ] Integração de pagamentos (manutenção externa)

## Licença

MIT License - Veja LICENSE.md para detalhes

## Suporte

Para issues e dúvidas:
- Abra uma issue no GitHub
- Envie email para suporte@example.com

---

**Desenvolvido com ❤️ para gerenciamento moderno de frotas**
