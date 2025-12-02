# Troubleshooting - Erro ao Fazer Login

## Problema: "Erro ao conectar em http://localhost:3000/api/auth/login"

### Causas Comuns

#### 1. Backend não está rodando
- **Verificar**: Backend deve estar rodando na porta 3000
- **Como verificar**: Abra http://localhost:3000/health no navegador
- **Solução**:
  \`\`\`bash
  cd backend
  npm install
  npm run dev
  \`\`\`

#### 2. Banco de dados não está rodando
- **Verificar**: PostgreSQL deve estar ativo
- **Solução** (com Docker):
  \`\`\`bash
  cd backend
  docker-compose up -d
  \`\`\`

#### 3. Tabelas do banco não foram criadas
- **Verificar**: As tabelas devem ser migradas
- **Solução**:
  \`\`\`bash
  cd backend
  npm run db:migrate
  npm run db:seed
  \`\`\`

#### 4. Credenciais de teste não existem
- **Verificar**: O seed deve ter criado os usuários
- **Solução**: Reexecute o seed
  \`\`\`bash
  cd backend
  npm run db:seed
  \`\`\`

#### 5. CORS bloqueando requisição
- **Verificar**: Verifique o console do navegador (F12 > Console/Network)
- **Solução**: Verifique que `CORS_ORIGIN` no `.env` do backend inclui `http://localhost:3001`

#### 6. URL da API incorreta
- **Verificar**: No arquivo `frontend/.env.local`
- **Deve ser**: `NEXT_PUBLIC_API_URL=http://localhost:3000/api`

### Passos de Debug

1. **Abra o Console (F12 > Console)**
   - Procure por mensagens `[v0]` com detalhes do erro

2. **Use o Debug Panel**
   - Botão roxo "Abrir Debug" no canto inferior direito
   - Clique em "Health Check" para testar conectividade
   - Clique em "Testar Login" para testar autenticação

3. **Verificar Network Tab (F12 > Network)**
   - Faça o login
   - Procure pela requisição POST `/api/auth/login`
   - Verifique o status code:
     - 200: OK, verificar response
     - 401: Credenciais inválidas
     - 404: Endpoint não existe (backend routes não carregadas)
     - 500: Erro no servidor (verifique logs do backend)

### Checklist de Verificação

\`\`\`bash
# 1. Verificar se backend está rodando
curl http://localhost:3000/health

# 2. Verificar se banco está acessível
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleet.com","password":"password123"}'

# 3. Se backend retornar 404, as rotas não estão registradas
# Verifique se backend/src/app.ts tem: setupRoutes(app)
\`\`\`

### Logs Úteis

**Backend - Procure por mensagens de erro:**
\`\`\`
npm run dev
# Verifique se aparece: "Server running on port 3000"
# Verifique queries do banco
\`\`\`

**Frontend - Abra F12 > Console e procure por:**
- `[v0] Login attempt with email:`
- `[v0] Login response:`
- `[v0] Login error:` - aqui está o erro detalhado

### Credenciais de Teste

\`\`\`
Email: admin@fleet.com
Senha: password123

Email: manager@fleet.com
Senha: password123

Email: driver1@fleet.com
Senha: password123
\`\`\`

### Ainda com problema?

1. Verifique que as variáveis de ambiente estão corretas
2. Execute novamente as migrations: `npm run db:migrate`
3. Execute novamente o seed: `npm run db:seed`
4. Reinicie backend e frontend
5. Limpe o cache do navegador (Ctrl+Shift+Delete)
