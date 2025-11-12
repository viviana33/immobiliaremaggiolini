# Deployment Guide - Split Architecture

Questo progetto è ora strutturato in due parti separate per ottimizzare i costi di hosting:

- **Frontend** (React + Vite) → Deploy su Vercel (gratuito)
- **Backend** (Express + PostgreSQL) → Deploy su Railway (~$2-3/mese)

## Struttura Progetto

```
/
├── frontend/          # React/Vite application
│   ├── src/          # Frontend source code
│   ├── attached_assets/  # Images and static assets
│   ├── package.json
│   ├── vercel.json   # Vercel configuration
│   ├── .env.example
│   └── VERCEL.md     # Frontend deployment guide
│
└── backend/          # Express API server
    ├── src/          # Backend source code
    ├── shared/       # Shared types between frontend/backend
    ├── migrations/   # Database migrations
    ├── package.json
    ├── .env.example
    └── RAILWAY.md    # Backend deployment guide
```

## Perché Split Architecture?

### Costi Mensili

**Prima (monolithic su Railway)**:
- Railway Compute: ~$5/mese (serve frontend + backend)
- **Totale**: ~$5/mese

**Dopo (split architecture)**:
- Vercel (frontend): $0 (piano gratuito)
- Railway (backend): ~$2-3/mese (solo API)
- **Totale**: ~$2-3/mese ✅

**Risparmio**: ~40-50% sui costi mensili

### Vantaggi Tecnici

1. **Performance**: Frontend su CDN globale Vercel (più veloce)
2. **Scalabilità**: Frontend e backend scalano indipendentemente
3. **CI/CD**: Deploy automatici separati per frontend e backend
4. **Zero Downtime**: Aggiornamenti frontend senza riavvio backend
5. **Developer Experience**: Sviluppo locale più semplice

## Quick Start - Development

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Configura DATABASE_URL e altre env vars in .env
npm run dev  # Parte su http://localhost:5000
```

### 2. Setup Frontend

In un altro terminale:

```bash
cd frontend
npm install
cp .env.example .env
# Imposta VITE_API_URL=http://localhost:5000
npm run dev  # Parte su http://localhost:5173
```

Ora apri http://localhost:5173 nel browser.

## Deployment in Produzione

### Step 1: Deploy Database (una sola volta)

1. Crea account gratuito su [Neon.tech](https://neon.tech)
2. Crea nuovo database PostgreSQL
3. Copia connection string (es: `postgresql://user:pass@host.neon.tech/db`)

### Step 2: Deploy Backend

Segui la guida completa: **[backend/RAILWAY.md](backend/RAILWAY.md)**

**Quick steps**:
1. Crea progetto su [Railway.app](https://railway.app)
2. Connetti GitHub repository (root directory: `backend`)
3. Configura environment variables da `backend/.env.example`
4. Deploy automatico
5. Copia URL generato (es: `https://your-app.up.railway.app`)

### Step 3: Deploy Frontend

Segui la guida completa: **[frontend/VERCEL.md](frontend/VERCEL.md)**

**Quick steps**:
1. Crea progetto su [Vercel](https://vercel.com)
2. Connetti GitHub repository (root directory: `frontend`)
3. Configura `VITE_API_URL` con URL Railway
4. Deploy automatico
5. Copia URL generato (es: `https://your-app.vercel.app`)

### Step 4: Configurare CORS

Torna su Railway e aggiungi:
```
FRONTEND_URL=https://your-app.vercel.app
```

Questo permette al backend di accettare richieste dal frontend Vercel.

## Environment Variables

### Backend (Railway)

```bash
# Required
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
SESSION_SECRET=your_secret
ADMIN_TOKEN=your_token
CRON_TOKEN=your_token

# Email (Brevo)
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=...
# ... altri (vedi backend/.env.example)

# Storage (Cloudinary o R2)
CLOUDINARY_CLOUD_NAME=...
# ... (vedi backend/.env.example)
```

### Frontend (Vercel)

```bash
# Required
VITE_API_URL=https://your-app.up.railway.app
```

## Architettura Tecnica

### Comunicazione Frontend ↔ Backend

```
┌─────────────────┐         HTTPS          ┌──────────────────┐
│   Vercel CDN    │  ────────────────────>  │  Railway API     │
│   (Frontend)    │  <────────────────────  │  (Backend)       │
│                 │       CORS enabled      │                  │
│  Static React   │                         │  Express + DB    │
└─────────────────┘                         └──────────────────┘
        │                                            │
        │                                            │
        v                                            v
   User Browser                              ┌──────────────┐
   localhost:5173 (dev)                      │  PostgreSQL  │
                                            │   (Neon.tech)│
                                            └──────────────┘
```

### CORS Configuration

Il backend è configurato per accettare richieste da:
- `process.env.FRONTEND_URL` (produzione Vercel)
- `http://localhost:5173` (development)

Credenziali (cookies/session) sono incluse tramite `credentials: true`.

### Session Management

- **Development**: Session in-memory (MemoryStore)
- **Production**: Session in PostgreSQL (connect-pg-simple)

Le sessioni funzionano correttamente con CORS grazie a:
```javascript
cookie: {
  sameSite: "none",  // Required per cross-origin
  secure: true,      // HTTPS only in production
  httpOnly: true     // Security
}
```

## Testing

### Frontend (isolato)

```bash
cd frontend
npm run build  # Verifica che build funzioni
npm run preview  # Test build di produzione
```

### Backend (isolato)

```bash
cd backend
npm run check  # TypeScript check
npm run build  # Build backend
# Test endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/properties
```

### Integration (frontend + backend)

1. Avvia backend: `cd backend && npm run dev`
2. Avvia frontend: `cd frontend && npm run dev`
3. Apri http://localhost:5173
4. Testa tutte le funzionalità

## Troubleshooting

### CORS Errors

**Sintomo**: Console browser mostra "CORS policy blocked"

**Soluzione**:
1. Verifica `VITE_API_URL` nel frontend
2. Verifica `FRONTEND_URL` nel backend
3. Assicurati che gli URL corrispondano esattamente (no trailing slash)
4. Riavvia entrambi i server

### Session/Cookies non funzionano

**Sintomo**: Login fallisce, session non persiste

**Soluzione**:
1. Verifica che backend usi `credentials: true` in CORS
2. Verifica che frontend usi `credentials: "include"` in fetch
3. In produzione, assicurati che `sameSite: "none"` e `secure: true`

### Environment Variables non caricate

**Frontend**:
- Variabili devono iniziare con `VITE_`
- Riavvia dev server dopo modifiche a `.env`
- Re-deploy Vercel dopo modifiche env vars

**Backend**:
- Railway auto-riavvia su cambio env vars
- Verifica spelling esatto (case-sensitive)

## Monitoring

### Frontend (Vercel)

- Dashboard: https://vercel.com/dashboard
- Analytics: Abilita Vercel Analytics (gratuito)
- Logs: Real-time function logs

### Backend (Railway)

- Dashboard: https://railway.app/dashboard
- Logs: `railway logs` o Dashboard > Logs
- Metrics: CPU, Memory, Network usage

## Backup Strategy

### Database (Neon.tech)

- Automatic backups su piano free (7 giorni retention)
- Upgrade a Pro per backup più lunghi

### Code (GitHub)

- Tutto il codice è su GitHub
- Vercel e Railway deployano da GitHub
- Tag releases per versioning

## Next Steps

Dopo il primo deploy:

1. ✅ Configura custom domain su Vercel e Railway
2. ✅ Abilita analytics e monitoring
3. ✅ Setup alerting per errori
4. ✅ Configura automated tests in CI/CD
5. ✅ Review sicurezza (HTTPS, secrets, rate limiting)

## Link Utili

- **Frontend Deploy**: [frontend/VERCEL.md](frontend/VERCEL.md)
- **Backend Deploy**: [backend/RAILWAY.md](backend/RAILWAY.md)
- **Vercel**: https://vercel.com
- **Railway**: https://railway.app
- **Neon Database**: https://neon.tech

## Support

Per problemi o domande:
- Vercel: https://vercel.com/support
- Railway: https://railway.app/help
- Neon: https://neon.tech/docs
