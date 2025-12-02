# Guia de Deploy - Fleet Management System

## 1. Preparação Pré-Deploy

### Checklist
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Testes passando (npm test)
- [ ] Build funcionando (npm run build)
- [ ] Database migrations testadas
- [ ] Sem console.errors ou warnings
- [ ] CORS configurado corretamente
- [ ] JWT secrets diferentes para prod/dev
- [ ] Rate limiting configurado

## 2. Deploy Backend

### Opção A: Heroku

\`\`\`bash
# 1. Preparar repositório
cd backend
git init
git add .
git commit -m "Initial commit"

# 2. Criar app no Heroku
heroku create fleet-management-api
heroku addons:create heroku-postgresql:standard-0

# 3. Configurar variáveis
heroku config:set JWT_SECRET=seu-secret-muito-seguro
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://seu-app.vercel.app

# 4. Deploy
git push heroku main

# 5. Executar migrations
heroku run npm run db:migrate
heroku run npm run db:seed
\`\`\`

### Opção B: AWS EC2

\`\`\`bash
# 1. SSH no servidor
ssh -i sua-chave.pem ubuntu@seu-ip

# 2. Instalar dependências
sudo apt-get update
sudo apt-get install nodejs npm postgresql postgresql-contrib nginx

# 3. Clonar repositório
git clone https://github.com/seu-repo.git
cd fleet-management-system/backend

# 4. Instalar e build
npm install
npm run build

# 5. Configurar PM2
npm install -g pm2
pm2 start dist/app.js --name fleet-api
pm2 save
pm2 startup

# 6. Configurar Nginx como reverse proxy
sudo nano /etc/nginx/sites-available/fleet
# Adicione:
# upstream fleet_api {
#   server localhost:3000;
# }
# server {
#   listen 80;
#   server_name seu-dominio.com;
#   location / {
#     proxy_pass http://fleet_api;
#   }
# }

sudo systemctl restart nginx
\`\`\`

### Opção C: Docker + DigitalOcean

\`\`\`bash
# 1. Preparar Docker
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/app.js"]
EOF

# 2. Build imagem
docker build -t fleet-api:latest .

# 3. Push para Docker Hub
docker tag fleet-api:latest seu-usuario/fleet-api:latest
docker push seu-usuario/fleet-api:latest

# 4. Deploy no DigitalOcean App Platform
# Conecte seu repositório do GitHub e configure CI/CD automático
\`\`\`

## 3. Deploy Frontend

### Opção A: Vercel (Recomendado)

\`\`\`bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Configurar variáveis de ambiente
vercel env add NEXT_PUBLIC_API_URL
# Valor: https://seu-api-backend.com/api

# 4. Redeploy
vercel --prod
\`\`\`

### Opção B: Netlify

\`\`\`bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod --dir=.next

# 4. Configurar variáveis no Netlify Dashboard
# NEXT_PUBLIC_API_URL = https://seu-api-backend.com/api
\`\`\`

### Opção C: AWS S3 + CloudFront

\`\`\`bash
# 1. Build Next.js como static export
# Edite next.config.js:
# export default nextConfig = {
#   output: 'export',
# }

npm run build

# 2. Fazer upload para S3
aws s3 sync out/ s3://seu-bucket-name/ --delete

# 3. Invalidar CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id SEU_DIST_ID \
  --paths "/*"
\`\`\`

## 4. Configuração do Banco de Dados

### PostgreSQL em Produção

\`\`\`bash
# 1. Criar banco de dados
createdb fleet_production

# 2. Executar migrações
DATABASE_URL="postgresql://user:password@host:5432/fleet_production" npm run db:migrate

# 3. Configurar backups automáticos
# crontab -e
# 0 3 * * * pg_dump -U user fleet_production | gzip > /backups/fleet_$(date +\%Y\%m\%d).sql.gz

# 4. Configurar SSL/TLS
# Editar postgresql.conf:
# ssl = on
# ssl_cert_file = '/etc/ssl/certs/cert.pem'
# ssl_key_file = '/etc/ssl/private/key.pem'
\`\`\`

## 5. SSL/HTTPS

### Usando Let's Encrypt + Certbot

\`\`\`bash
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --nginx -d seu-dominio.com

# Configurar auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
\`\`\`

## 6. Monitoramento e Logs

### Setup Sentry para Errors
\`\`\`typescript
// backend/src/app.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
\`\`\`

### Logs com Winston
\`\`\`typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
\`\`\`

## 7. Performance

### Otimizações Backend
\`\`\`typescript
// app.ts
app.use(compression()); // Gzip
app.use(helmet()); // Headers de segurança
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));
\`\`\`

### Otimizações Frontend
- Image Optimization (Next.js automático)
- Code Splitting (automático)
- API Caching com SWR
- Redis para cache de dados frequentes

## 8. CI/CD Pipeline

### GitHub Actions
Veja `.github/workflows/ci-cd.yml`

\`\`\`bash
# Trigger automático:
# - Push em main → testa e faz deploy em staging
# - PR → roda testes
# - Release tag → deploy para produção
\`\`\`

## 9. Checklist Pós-Deploy

- [ ] Verificar logs (sem erros)
- [ ] Testar endpoints críticos
- [ ] Testar autenticação
- [ ] Verificar performance (Lighthouse)
- [ ] Testar no mobile
- [ ] Backup do banco configurado
- [ ] Monitoring ativo (Sentry, DataDog)
- [ ] Status page (https://status.seu-app.com)
- [ ] Documentação atualizada
- [ ] Equipe notificada

## 10. Troubleshooting

### Erro: "Can't connect to database"
\`\`\`bash
# Verificar string de conexão
echo $DATABASE_URL

# Testar conexão
psql $DATABASE_URL -c "SELECT 1"
\`\`\`

### Erro: "CORS error"
\`\`\`bash
# Adicionar origem frontend ao CORS_ORIGIN no backend
CORS_ORIGIN=https://seu-dominio.com,http://localhost:3000
\`\`\`

### Erro: "Out of memory"
\`\`\`bash
# Aumentar limite do Node.js
node --max-old-space-size=4096 dist/app.js

# Ou via PM2
pm2 start app.js --max-memory-restart 500M
\`\`\`

## 11. Rollback Procedure

\`\`\`bash
# Se algo der errado:

# 1. Revert código
git revert <commit-hash>

# 2. Revert banco (se aplicável)
DATABASE_URL=$DB_URL psql < backup-pre-deploy.sql

# 3. Redeploy versão anterior
heroku releases
heroku rollback v123
\`\`\`

---

Para suporte, abra uma issue no repositório.
