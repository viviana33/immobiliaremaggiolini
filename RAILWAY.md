# 🚂 Deploy su Railway.app

Questa guida ti aiuterà a fare il deploy del progetto su Railway.app in pochi minuti.

## ✅ Vantaggi di Railway

- **Persistente**: Server sempre attivo (non serverless), le sessioni funzionano perfettamente
- **Auto-deploy**: Push su GitHub → Deploy automatico
- **SSL Gratuito**: HTTPS automatico con certificato SSL
- **Database Esterno**: Funziona perfettamente con Neon.tech PostgreSQL
- **Zero Config**: Railway rileva automaticamente Node.js dal `package.json`
- **Scalabile**: Scala automaticamente sotto carico

## 📋 Prerequisiti

1. Account su [Railway.app](https://railway.app) (gratis con GitHub)
2. Repository GitHub con il codice
3. Database PostgreSQL su Neon.tech (già configurato)
4. Credenziali per i servizi esterni:
   - Cloudinary o Cloudflare R2 (immagini)
   - Brevo (email)

## 🚀 Deploy in 3 Step

### Step 1: Connetti GitHub a Railway

1. Vai su [railway.app](https://railway.app)
2. Clicca **"Start a New Project"**
3. Seleziona **"Deploy from GitHub repo"**
4. Autorizza Railway ad accedere ai tuoi repository
5. Seleziona il repository del progetto

### Step 2: Configura le Variabili d'Ambiente

Railway ti chiederà di configurare le variabili. Ecco la lista completa:

#### 🔐 Variabili OBBLIGATORIE

```bash
# Database (Neon.tech)
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Applicazione
NODE_ENV=production
SESSION_SECRET=<genera con: openssl rand -base64 32>
ADMIN_TOKEN=<genera con: openssl rand -hex 32>
ADMIN_EMAIL=tua-email@dominio.com
APP_URL=https://tuodominio.railway.app

# Brevo Email
BREVO_API_KEY=xkeysib-xxxxx
BREVO_TEMPLATE_ID=1
BREVO_LIST_ID=2
BREVO_SENDER_EMAIL=noreply@tuodominio.com
BREVO_SENDER_NAME=Nome Azienda

# Cron Jobs
CRON_TOKEN=<genera con: openssl rand -hex 32>
```

#### 📦 Storage Immagini (scegli UNO dei due)

**Opzione A - Cloudinary (consigliato per semplicità)**
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdefghijklmnop
```

**Opzione B - Cloudflare R2 (consigliato per costi)**
```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-domain.r2.dev
```

### Step 3: Deploy!

Railway inizierà automaticamente il deploy:
1. Installa le dipendenze (`npm install`)
2. Compila il progetto (`npm run build`)
3. Avvia il server (`npm run start`)
4. Assegna un dominio `.railway.app`

Il tuo sito sarà live in **2-3 minuti**! 🎉

## 🌐 Dominio Personalizzato (Opzionale)

1. Vai su **Settings** > **Domains**
2. Clicca **"Generate Domain"** per ottenere un dominio `.railway.app`
3. Oppure connetti il tuo dominio personalizzato:
   - Aggiungi il dominio (es. `www.tuodominio.com`)
   - Aggiorna i DNS con il CNAME fornito da Railway

## 🔄 Come Aggiornare l'App

Ogni volta che fai `git push` su GitHub, Railway:
1. Rileva il push automaticamente
2. Esegue il build
3. Fa il deploy della nuova versione
4. Zero downtime!

## 📊 Monitoraggio

Railway fornisce:
- **Logs in tempo reale**: Vedi tutti i log del server
- **Metriche**: CPU, RAM, richieste
- **Deployments**: Storico di tutti i deploy
- **Rollback**: Torna a una versione precedente con un click

## 💰 Costi

- **Trial Plan**: $5 di credito gratuito al mese
- **Developer Plan**: $5/mese (per hobby e progetti personali)
- **Starter Plan**: $20/mese (per produzione)

Stima di consumo per questo progetto:
- ~$3-8/mese nel trial/developer plan
- Il database Neon.tech è separato (free tier disponibile)

## 🛠️ Troubleshooting

### Il deploy fallisce
```bash
# Verifica i log in Railway > Deployments > View Logs
# Controlla che tutte le variabili d'ambiente siano configurate
```

### Sessioni non funzionano
```bash
# Assicurati che NODE_ENV=production
# Verifica che SESSION_SECRET sia configurato
# Controlla che APP_URL usi HTTPS (non HTTP)
```

### Immagini non si caricano
```bash
# Verifica le credenziali Cloudinary/R2
# Controlla i log per errori di upload
# Testa le credenziali localmente prima
```

### Database non si connette
```bash
# Verifica DATABASE_URL con ?sslmode=require alla fine
# Controlla che Neon.tech accetti connessioni da Railway
# Verifica IP whitelisting su Neon (dovrebbe essere aperto)
```

## 📞 Supporto

- Documentazione: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

## ✅ Checklist Pre-Deploy

- [ ] Database Neon.tech attivo e accessibile
- [ ] Tutte le variabili d'ambiente configurate
- [ ] Credenziali Brevo valide
- [ ] Credenziali Cloudinary/R2 valide
- [ ] `SESSION_SECRET` generato in modo sicuro
- [ ] `ADMIN_TOKEN` generato in modo sicuro
- [ ] `CRON_TOKEN` generato in modo sicuro
- [ ] `APP_URL` impostato con il dominio Railway
- [ ] Codice pushato su GitHub

## 🎯 Prossimi Step Dopo il Deploy

1. Testa il login admin su `/admin`
2. Carica alcune proprietà di test
3. Testa l'invio di un lead dal form di contatto
4. Verifica che le email arrivino (Brevo)
5. Configura il cron job per cleanup immagini (opzionale)
6. Aggiungi il dominio personalizzato (opzionale)
7. Configura monitoraggio/alerting (opzionale)

---

**Nota**: Questo progetto è ottimizzato per Railway. Non servono modifiche al codice, né configurazioni Docker, né file speciali. Railway rileva automaticamente tutto dal `package.json`!
