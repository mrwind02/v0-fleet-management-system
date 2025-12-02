# Fleet Management System - Frontend

Sistema de gerenciamento de frota com React/Next.js.

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

\`\`\`bash
npm install
\`\`\`

## Configuração

Crie um arquivo \`.env.local\`:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

## Desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Credenciais de Teste

- **Admin:** admin@fleet.com / password123
- **Gestor:** manager@fleet.com / password123
- **Motorista:** driver1@fleet.com / password123

## Build para Produção

\`\`\`bash
npm run build
npm run start
\`\`\`

## Estrutura de Pastas

\`\`\`
frontend/
├── app/                 # Pages (Next.js App Router)
├── components/          # Componentes React
│   ├── auth/           # Componentes de autenticação
│   ├── layout/         # Layout principal
│   ├── vehicles/       # Componentes de veículos
│   ├── drivers/        # Componentes de motoristas
│   └── maintenance/    # Componentes de manutenção
├── services/           # Serviços de API
├── store/              # Zustand store
├── types/              # Tipos TypeScript
├── utils/              # Utilitários
├── middleware.ts       # Next.js middleware
└── package.json
\`\`\`

## Funcionalidades

- ✅ Autenticação JWT
- ✅ Dashboard com métricas
- ✅ Cadastro de veículos
- ✅ Cadastro de motoristas
- ✅ Registro de manutenção
- ✅ Questionário de status (rodando/parado)
- ✅ Relatórios exportáveis em CSV
- ✅ Interface responsiva
- ✅ Controle de acesso por role

## Troubleshooting

### "Module not found"
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Build falha
\`\`\`bash
npm run build -- --force
\`\`\`

### Erro de CORS
Verifique se \`NEXT_PUBLIC_API_URL\` está correto em \`.env.local\`

## Deploy

### Vercel (Recomendado)
\`\`\`bash
npm i -g vercel
vercel
\`\`\`

### Docker
\`\`\`bash
docker build -t fleet-frontend .
docker run -p 3000:3000 fleet-frontend
\`\`\`
