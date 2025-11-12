# Deploy Frontend su Vercel

Questa guida spiega come deployare il frontend React su Vercel (hosting gratuito per progetti static).

## Requisiti

- Account Vercel (gratuito): https://vercel.com
- Repository GitHub/GitLab/Bitbucket con il codice (opzionale ma consigliato)
- Backend già deployato su Railway (vedi `../backend/RAILWAY.md`)

## Preparazione

### 1. Installare Vercel CLI (opzionale)

```bash
npm install -g vercel
```

### 2. Configurare Environment Variables

Il frontend ha bisogno di una sola variabile d'ambiente:

```
VITE_API_URL=https://your-backend.railway.app
```

Sostituisci `your-backend.railway.app` con l'URL del backend deployato su Railway.

## Metodo 1: Deploy tramite Vercel Dashboard (Consigliato)

### Step 1: Connettere Repository

1. Vai su https://vercel.com/dashboard
2. Clicca "Add New Project"
3. Importa il repository GitHub/GitLab
4. Seleziona la directory `frontend/` come root del progetto

### Step 2: Configurare Build Settings

Vercel rileverà automaticamente che è un progetto Vite, ma verifica:

- **Framework Preset**: Vite
- **Root Directory**: `frontend` (se il repo contiene anche backend)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Aggiungere Environment Variables

Nel dashboard Vercel, nella sezione "Environment Variables":

```
VITE_API_URL = https://your-backend.railway.app
```

### Step 4: Deploy

1. Clicca "Deploy"
2. Attendi il completamento (1-2 minuti)
3. Copia l'URL generato (es: `https://your-app.vercel.app`)

### Step 5: Configurare CORS nel Backend

Dopo aver ottenuto l'URL Vercel, aggiorna la variabile d'ambiente del backend su Railway:

```
FRONTEND_URL=https://your-app.vercel.app
```

Questo permetterà al backend di accettare richieste dal frontend Vercel.

## Metodo 2: Deploy tramite CLI

### Step 1: Login

```bash
cd frontend
vercel login
```

### Step 2: Configurare Environment

Crea file `.env.production`:

```bash
VITE_API_URL=https://your-backend.railway.app
```

### Step 3: Deploy

Per deploy di test:
```bash
vercel
```

Per deploy in produzione:
```bash
vercel --prod
```

### Step 4: Aggiungere variabili d'ambiente permanenti

```bash
vercel env add VITE_API_URL production
# Inserisci: https://your-backend.railway.app
```

## Custom Domain (Opzionale)

### 1. Aggiungere dominio su Vercel

1. Vai nel progetto su Vercel Dashboard
2. Settings > Domains
3. Aggiungi il tuo dominio (es: `www.tuosito.it`)
4. Segui le istruzioni per configurare DNS

### 2. Configurare DNS

Aggiungi questi record DNS presso il tuo provider:

**Per dominio principale (example.com):**
```
A     @     76.76.21.21
```

**Per sottodominio (www.example.com):**
```
CNAME www   cname.vercel-dns.com
```

### 3. Aggiornare CORS nel Backend

Dopo aver configurato il dominio custom, aggiorna `FRONTEND_URL` su Railway:

```
FRONTEND_URL=https://www.tuosito.it
```

## Troubleshooting

### Problema: 404 su route diverse da homepage

**Soluzione**: Verifica che `vercel.json` contenga:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Problema: API calls falliscono con CORS error

**Soluzione**: Verifica che:
1. `VITE_API_URL` sia configurato correttamente su Vercel
2. `FRONTEND_URL` sia configurato correttamente su Railway
3. Il backend includa l'URL Vercel nella configurazione CORS

### Problema: Environment variables non funzionano

**Soluzione**: 
- Le variabili d'ambiente devono iniziare con `VITE_`
- Dopo aver modificato env vars su Vercel, devi rifare il deploy
- Verifica che le variabili siano configurate per l'ambiente "Production"

### Problema: Build fallisce

**Soluzione**:
1. Verifica che `package.json` contenga tutti i dependencies
2. Controlla i log di build per errori TypeScript
3. Testa la build in locale con `npm run build`

## Costi

Vercel offre:

- **Hobby Plan (Gratuito)**:
  - 100 GB bandwidth/mese
  - Deployments illimitati
  - HTTPS automatico
  - Deploy automatici da GitHub
  - Perfetto per progetti personali e piccole app

- **Pro Plan ($20/mese)**: 
  - 1 TB bandwidth/mese
  - Analytics avanzate
  - Protezione DDoS
  - Per progetti commerciali

## Best Practices

1. **Environment Variables**: Non committare mai `.env` files
2. **Build Optimization**: Usa `vite build` per ottimizzare il bundle
3. **Automatic Deploys**: Connetti GitHub per deploy automatici ad ogni push
4. **Preview Deployments**: Ogni PR genera un deployment di preview automatico
5. **Analytics**: Abilita Vercel Analytics per monitorare performance

## Link Utili

- Dashboard Vercel: https://vercel.com/dashboard
- Documentazione: https://vercel.com/docs
- CLI Reference: https://vercel.com/docs/cli
- Vercel Status: https://www.vercel-status.com

## Next Steps

Dopo il deploy:

1. ✅ Testa tutte le funzionalità dell'app
2. ✅ Verifica che le chiamate API funzionino
3. ✅ Configura un dominio custom (opzionale)
4. ✅ Abilita Analytics per monitorare traffico
5. ✅ Configura branch preview per testing
