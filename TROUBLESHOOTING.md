# Troubleshooting - Fleet Management System

## Erros Comuns

### 1. "Module not found" ou "Cannot find module"

**Solução:**
\`\`\`bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install

# Verifique paths no tsconfig.json
# Certifique-se que "@/*" aponta para o diretório correto
\`\`\`

### 2. "useAuthStore is not a named export"

**Causa:** Arquivo de store não tem export nomeado
**Solução:** Verifique se `store/authStore.ts` tem:
\`\`\`typescript
export const useAuthStore = create<AuthStore>(...)
\`\`\`

### 3. Erro de CORS

**Solução - Backend:**
\`\`\`typescript
// app.ts
import cors from 'cors'
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}))
\`\`\`

### 4. Erro 401 Unauthorized

**Causa:** Token inválido ou expirado
**Solução:**
- Fazer logout e login novamente
- Limpar localStorage
- Verificar se JWT_SECRET é consistente

### 5. Erro ao Conectar ao Banco

**Solução:**
\`\`\`bash
# Verificar se PostgreSQL está rodando
psql -U postgres

# Criar banco se não existir
createdb fleet_db

# Configurar DATABASE_URL
export DATABASE_URL=postgresql://postgres:password@localhost:5432/fleet_db
\`\`\`

### 6. Build falha com erros TypeScript

**Solução:**
\`\`\`bash
# Verifique tipos
npx tsc --noEmit

# Force build
npm run build -- --force
\`\`\`

## Debug Mode

### Backend
\`\`\`bash
# Ativar logs detalhados
DEBUG=* npm run dev
\`\`\`

### Frontend
\`\`\`bash
# Abrir DevTools (F12)
# Verificar Console e Network tabs
# Usar React DevTools extension
\`\`\`

## Performance Issues

### Frontend Lento
\`\`\`bash
# Analisar bundle
npm run analyze

# Otimizar imagens
npm install next-image-optimization
\`\`\`

### Backend Lento
\`\`\`bash
# Verificar índices no banco
# Ativar query logging
# Usar APM (Application Performance Monitoring)
\`\`\`

## Security Checks

- Verifique se JWT_SECRET é forte (mín. 32 caracteres)
- Confirme HTTPS em produção
- Habilite Rate Limiting
- Configure HELMET para headers de segurança
- Valide todas as entradas
`
\`\`\`

```json file="" isHidden
