# Verificação de Build - Fleet Management System

## Pre-Build Checks

- [ ] Node.js 18+ instalado: \`node --version\`
- [ ] npm/yarn funcionando: \`npm --version\`
- [ ] PostgreSQL em execução: \`psql --version\`
- [ ] Porta 3000 disponível
- [ ] Porta 3001 disponível

## Backend Checks

- [ ] \`backend/.env\` criado com todas as variáveis
- [ ] DATABASE_URL aponta para banco válido
- [ ] JWT_SECRET configurado
- [ ] \`npm install\` completou sem erros
- [ ] \`npm run db:migrate\` executou com sucesso
- [ ] \`npm run db:seed\` populou dados de teste
- [ ] \`npm run dev\` inicia sem erros
- [ ] Health check: \`curl http://localhost:3000/api/health\`

## Frontend Checks

- [ ] \`frontend/.env.local\` criado
- [ ] NEXT_PUBLIC_API_URL aponta para backend
- [ ] \`npm install\` completou sem erros
- [ ] \`npm run build\` sem erros
- [ ] Sem avisos de tipos TypeScript: \`npx tsc --noEmit\`
- [ ] \`npm run dev\` inicia sem erros
- [ ] Página de login carrega em http://localhost:3000

## Login e Autenticação

- [ ] Login com admin@fleet.com funciona
- [ ] Dashboard carrega após login
- [ ] Sidebar mostra itens de menu corretos
- [ ] Logout funciona
- [ ] Proteção de rotas funciona (acesso negado sem token)

## Funcionalidades Principais

- [ ] Dashboard - Exibe métricas
- [ ] Veículos - CRUD funciona
- [ ] Motoristas - CRUD funciona
- [ ] Manutenção - Registros salvam
- [ ] Questionário - Status registra com GPS
- [ ] Relatórios - CSV exporta corretamente

## API Endpoints

- [ ] POST /auth/login - Retorna token
- [ ] POST /auth/refresh - Renovação de token
- [ ] GET /vehicles - Lista veículos
- [ ] POST /vehicles - Cria veículo
- [ ] GET /drivers - Lista motoristas
- [ ] POST /drivers - Cria motorista
- [ ] GET /maintenance/vehicle/:id - Lista manutenção
- [ ] POST /maintenance - Registra manutenção
- [ ] POST /questionnaire - Registra status
- [ ] GET /reports/metrics - Métricas

## Performance

- [ ] Frontend carrega em < 3 segundos
- [ ] API responde em < 500ms
- [ ] Sem memory leaks no navegador (DevTools)
- [ ] Bundle size aceitável: \`npm run analyze\`

## Segurança

- [ ] Senhas hasheadas no banco
- [ ] JWT com expiração
- [ ] CORS configurado
- [ ] SQL Injection protegido (queries parametrizadas)
- [ ] XSS protection (React escapa HTML)

## Deployment Readiness

- [ ] Docker build bem-sucedido (opcional)
- [ ] Variáveis de ambiente em .env (não em código)
- [ ] README.md atualizado
- [ ] Documentação API completa
- [ ] Testes unitários passam: \`npm test\`
- [ ] Linting sem erros: \`npm run lint\`

## Pós-Deploy

- [ ] App acessível em produção
- [ ] Login funciona em produção
- [ ] HTTPS ativado
- [ ] Rate limiting ativado
- [ ] Logs configurados
- [ ] Backup do banco agendado
- [ ] Monitoring ativado

---

✅ Quando todos os itens estiverem marcados, o sistema está pronto para uso.
