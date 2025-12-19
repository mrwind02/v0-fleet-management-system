# Guia de Deploy - Vercel e Render

## Status Atual dos Commits

✅ **Último commit no GitHub:** `1da9601` - "fix: configurar Vercel para usar diretório frontend"

```bash
# Verificar se commits estão no GitHub
git ls-remote origin main
# Deve retornar: 1da9601bf8a800268c5030998ce9f01153ad158a

# Verificar sincronização local
git log --oneline -1
# Deve retornar: 1da9601 (HEAD -> main, origin/main)
```

## Configuração do Vercel

### Estrutura do Projeto
```
v0-fleet-management-system/
├── frontend/          ← Código Next.js (USAR ESTE)
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── ...
├── backend/           ← API Node.js (NÃO DEPLOY NO VERCEL)
├── app/              ← IGNORAR (duplicado)
└── vercel.json       ← Configuração
```

### Configuração Atual (vercel.json)
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs"
}
```

### Passos para Configurar no Dashboard do Vercel

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione o projeto:** v0-fleet-management-system
3. **Settings → General:**
   - **Root Directory:** `frontend` ⚠️ IMPORTANTE
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

4. **Settings → Git:**
   - **Branch:** `main`
   - **Auto Deploy:** Enabled ✅
   - Verificar se o repositório está conectado

5. **Forçar Novo Deploy:**
   - Deployments → ... (menu) → Redeploy
   - OU fazer um commit vazio:
   ```bash
   git commit --allow-empty -m "trigger: forçar deploy no Vercel"
   git push origin main
   ```

## Configuração do Render (Backend)

### Estrutura
O Render deve fazer deploy APENAS do backend.

### Configuração Atual (render.yaml)
```yaml
services:
  - type: web
    name: fleet-management-backend
    env: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    healthCheckPath: /api/health
```

### Passos para Configurar no Dashboard do Render

1. **Acesse:** https://dashboard.render.com
2. **Selecione o serviço:** fleet-management-backend
3. **Settings:**
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Auto-Deploy:** Yes ✅

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<sua-connection-string>
   JWT_SECRET=<seu-secret>
   ```

5. **Forçar Novo Deploy:**
   - Manual Deploy → Deploy latest commit

## Troubleshooting

### Vercel não detecta novos commits

**Causa:** Configuração incorreta do Root Directory

**Solução:**
1. Settings → General → Root Directory = `frontend`
2. Salvar e fazer redeploy

### Render não atualiza

**Causa:** Auto-deploy desabilitado ou branch incorreta

**Solução:**
1. Settings → Auto-Deploy = Yes
2. Settings → Branch = `main`
3. Manual Deploy → Deploy latest commit

### Erro "Vulnerable version of Next.js"

**Status:** ✅ RESOLVIDO
- Next.js atualizado para 16.1.0 em todos os package.json

### Páginas não aparecem no Vercel

**Causa:** Build usando diretório raiz ao invés de `frontend/`

**Solução:** ✅ RESOLVIDO
- vercel.json atualizado para usar `frontend/`
- .vercelignore criado

## Verificação de Deploy

### Vercel (Frontend)
```bash
# Verificar build local
cd frontend
npm run build
# Deve compilar sem erros

# Testar localmente
npm run start
# Acessar http://localhost:3000
```

### Render (Backend)
```bash
# Verificar build local
cd backend
npm run build
# Deve compilar sem erros

# Testar localmente
npm start
# Testar: curl http://localhost:3000/health
```

## Commits Recentes

```
1da9601 - fix: configurar Vercel para usar diretório frontend
0e15f83 - security: atualizar versão Next.js no frontend/package.json para 16.1.0
b2ff702 - security: atualizar Next.js na raiz 16.0.3 -> 16.1.0 (CVE-2025-66478)
66cb308 - security: atualizar Next.js 16.0.8 -> 16.1.0 para corrigir CVE-2025-66478
d53868d - fix: corrigir erros de compilação TypeScript para deploy
```

## Próximos Passos

1. ✅ Commits estão no GitHub
2. ⚠️ Verificar configuração do Root Directory no Vercel Dashboard
3. ⚠️ Verificar se Auto-Deploy está ativado no Render
4. 🔄 Forçar redeploy manual se necessário
