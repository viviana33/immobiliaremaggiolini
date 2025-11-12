# Deploy Backend su Railway

Questa guida spiega come deployare il backend Express su Railway.app (~$3/mese con free tier incluso).

## Requisiti

- Account Railway: https://railway.app
- Account GitHub (per connettere repository)
- Database PostgreSQL su Neon.tech (vedi DATABASE.md)
- Account servizi esterni: Cloudinary/R2, Brevo

## Preparazione

### 1. Creare account Railway

1. Vai su https://railway.app
2. Registrati con GitHub
3. Railway offre $5 di crediti gratuiti ogni mese

### 2. Preparare variabili d'ambiente

Copia `.env.example` e prepara i valori per:

```bash
# Database
DATABASE_URL=postgresql://...  # da Neon.tech

# Frontend CORS
FRONTEND_URL=https://your-app.vercel.app  # dopo deploy frontend

# App config
NODE_ENV=production
SESSION_SECRET=  # genera con: openssl rand -base64 32
ADMIN_TOKEN=  # genera con: openssl rand -base64 32
CRON_TOKEN=  # genera con: openssl rand -base64 32
ADMIN_EMAIL=admin@yourdomain.com
APP_URL=  # verrà generato da Railway

# Brevo (email)
BREVO_API_KEY=xkeysib-...
BREVO_TEMPLATE_ID=1
BREVO_LIST_ID=2
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Your Company Name

# Cloudinary (immagini)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Deploy tramite Dashboard

### Step 1: Creare nuovo progetto

1. Vai su https://railway.app/dashboard
2. Clicca "New Project"
3. Seleziona "Deploy from GitHub repo"
4. Autorizza Railway ad accedere al repository
5. Seleziona il repository del progetto

### Step 2: Configurare Root Directory

Se il repository contiene sia frontend che backend:

1. Dopo aver selezionato il repo, clicca "Add variables"
2. In "Settings" > "Service Settings"
3. Imposta **Root Directory**: `backend`

### Step 3: Configurare Build

Railway rileva automaticamente Node.js, ma verifica:

- **Build Command**: `npm run build` (se configurato)
- **Start Command**: `npm start`
- **Watch Paths**: `backend/**` (opzionale, per deploy automatici solo su cambi backend)

### Step 4: Aggiungere Environment Variables

Nel tab "Variables", aggiungi TUTTE le variabili da `.env.example`:

```
DATABASE_URL = postgresql://...
FRONTEND_URL = https://your-app.vercel.app
NODE_ENV = production
SESSION_SECRET = your_generated_secret
ADMIN_TOKEN = your_generated_token
CRON_TOKEN = your_generated_token
ADMIN_EMAIL = admin@yourdomain.com
BREVO_API_KEY = xkeysib-...
BREVO_TEMPLATE_ID = 1
BREVO_LIST_ID = 2
BREVO_SENDER_EMAIL = noreply@yourdomain.com
BREVO_SENDER_NAME = Your Company Name
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
```

**IMPORTANTE**: Non aggiungere `PORT` - Railway lo imposta automaticamente.

### Step 5: Deploy

1. Railway inizierà il deploy automaticamente
2. Attendi il completamento (2-3 minuti)
3. Nel tab "Deployments" vedrai il progresso
4. Quando completato, vedrai "Success" ✅

### Step 6: Ottenere URL pubblico

1. Nel tab "Settings"
2. Sezione "Networking"
3. Clicca "Generate Domain"
4. Copia l'URL generato (es: `your-app.up.railway.app`)
5. Aggiungi questa variabile d'ambiente:
   ```
   APP_URL = https://your-app.up.railway.app
   ```

### Step 7: Testare il backend

Visita:
```
https://your-app.up.railway.app/health
```

Dovresti vedere:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Deploy tramite CLI (Alternativo)

### Step 1: Installare Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Inizializzare progetto

```bash
cd backend
railway init
```

### Step 4: Linkare a progetto esistente o crearne uno nuovo

```bash
# Opzione A: Nuovo progetto
railway init

# Opzione B: Link a progetto esistente
railway link
```

### Step 5: Aggiungere variabili d'ambiente

```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set FRONTEND_URL="https://your-app.vercel.app"
railway variables set NODE_ENV="production"
# ... etc (tutte le variabili da .env.example)
```

### Step 6: Deploy

```bash
railway up
```

## Configurare Custom Domain (Opzionale)

### 1. Aggiungere dominio su Railway

1. Settings > Networking
2. Custom Domain
3. Aggiungi `api.tuosito.it` (o subdomain preferito)

### 2. Configurare DNS

Nel tuo provider DNS, aggiungi:

```
CNAME  api  your-app.up.railway.app
```

### 3. Aggiornare variabili d'ambiente

```
APP_URL = https://api.tuosito.it
```

## Database Migrations

Railway **non esegue automaticamente** le migrations. Devi eseguirle manualmente:

### Opzione A: Eseguire da locale

```bash
# Configura DATABASE_URL locale (dal Railway)
export DATABASE_URL="postgresql://..."

# Esegui migrations
npm run db:push
```

### Opzione B: Eseguire da Railway CLI

```bash
cd backend
railway run npm run db:push
```

### Opzione C: One-time deployment command

Su Railway Dashboard:
1. Settings > Deploy
2. Custom Start Command (temporaneo):
   ```
   npm run db:push && npm start
   ```
3. Dopo la migration, rimuovi `npm run db:push &&`

## Monitoraggio

### Visualizzare logs

**Dashboard**:
1. Tab "Deployments"
2. Clicca sul deployment attivo
3. Visualizza logs in tempo reale

**CLI**:
```bash
railway logs
```

### Metriche

Railway fornisce automaticamente:
- CPU usage
- Memory usage
- Network bandwidth
- Deploy history

Visualizza in: Dashboard > Metrics

## Costi

Railway pricing (2024):

- **Starter Plan (Gratuito)**:
  - $5 crediti/mese gratuiti
  - ~500 ore di uptime
  - Adatto per progetti in sviluppo

- **Developer Plan ($5)**:
  - $5 fissi + usage
  - Uptime illimitato
  - Adatto per progetti in produzione
  - Costo stimato: $2-3/mese per backend API

**Stima mensile backend**:
- Compute: ~$2-3/mese (512MB RAM, sempre attivo)
- Database: $0 (su Neon.tech)
- **Totale**: ~$2-3/mese

## Troubleshooting

### Problema: Build fallisce

**Soluzione**:
1. Verifica che `package.json` contenga script `build` e `start`
2. Verifica che tutte le dipendenze siano in `dependencies` (non `devDependencies`)
3. Controlla logs: `railway logs`

### Problema: App crashes al boot

**Soluzione**:
1. Verifica variabili d'ambiente (specialmente `DATABASE_URL`)
2. Controlla logs per errori: `railway logs`
3. Testa connessione database: `railway run npm run db:push`

### Problema: CORS errors dal frontend

**Soluzione**:
1. Verifica che `FRONTEND_URL` sia configurato correttamente
2. Assicurati che corrisponda esattamente all'URL Vercel (senza trailing slash)
3. Controlla logs backend per confermare configurazione CORS

### Problema: 502 Bad Gateway

**Soluzione**:
1. App non è in ascolto su `0.0.0.0` - verifica `index.ts`
2. App non usa `process.env.PORT` - Railway lo imposta automaticamente
3. Health check fallisce - verifica `/health` endpoint

### Problema: Database connection fails

**Soluzione**:
1. Verifica `DATABASE_URL` su Neon.tech
2. Assicurati che includa `?sslmode=require`
3. Verifica che IP di Railway sia whitelisted su Neon (di default accetta tutti)

## Backup e Rollback

### Rollback a deployment precedente

**Dashboard**:
1. Tab "Deployments"
2. Trova deployment funzionante precedente
3. Clicca "⋮" > "Redeploy"

**CLI**:
```bash
railway status  # Vedi deployment history
railway rollback
```

## Best Practices

1. **Monitoring**: Configura alerting per errori (Railway Webhooks)
2. **Environment Variables**: Non committare mai `.env` files
3. **Database**: Usa Neon.tech per database PostgreSQL (free tier generoso)
4. **Logs**: Monitora regularly per identificare problemi
5. **Migrations**: Esegui sempre prima del deploy di codice che richiede schema changes

## Link Utili

- Dashboard Railway: https://railway.app/dashboard
- Documentazione: https://docs.railway.app
- CLI Reference: https://docs.railway.app/develop/cli
- Railway Status: https://railway.statuspage.io
- Pricing: https://railway.app/pricing

## Next Steps

Dopo il deploy backend:

1. ✅ Testa `/health` endpoint
2. ✅ Esegui database migrations
3. ✅ Testa tutte le API routes con Postman/curl
4. ✅ Copia URL Railway e usalo come `VITE_API_URL` nel frontend
5. ✅ Configura monitoring e alerting
6. ✅ Setup custom domain (opzionale)
