# 💾 Backup e Export Dati

Guida completa per scaricare, esportare e fare backup di tutti i dati del progetto.

## 📍 Dove Sono Salvati i Dati

### Database PostgreSQL (Neon.tech)
Tutti i dati sono salvati nel database PostgreSQL su **Neon.tech**:

| Tabella | Contenuto | Record Tipici |
|---------|-----------|---------------|
| `properties` | Dati immobili (titolo, prezzo, descrizione, zona) | Variabile |
| `properties_images` | URL immagini immobili | 5-15 per immobile |
| `posts` | Articoli blog (titolo, contenuto, tag) | Variabile |
| `posts_images` | URL immagini galleria articoli | 0-10 per articolo |
| `leads` | Contatti ricevuti dal form | Variabile |
| `subscriptions` | Iscritti newsletter | Variabile |
| `users` | Utenti admin | 1-5 tipicamente |

### Storage Immagini
Le **immagini** sono salvate su:
- **Cloudinary** (se configurato), oppure
- **Cloudflare R2** (se configurato)

Il database contiene solo gli **URL** delle immagini, non i file stessi.

---

## 🚀 Metodi di Export

### Metodo 1: Script JSON (Consigliato per Backup Completo)

Esporta **tutti i dati** in un unico file JSON:

```bash
# Assicurati di avere le variabili d'ambiente configurate
npx tsx scripts/export-data.ts
```

**Output**: `export-2024-11-13_14-30-00.json`

**Vantaggi**:
- ✅ Tutti i dati in un file
- ✅ Facile da re-importare
- ✅ Mantiene tipi e struttura

**Contenuto del file**:
```json
{
  "exportDate": "2024-11-13T14:30:00.000Z",
  "statistics": {
    "properties": 25,
    "propertyImages": 180,
    "posts": 12,
    "postImages": 45,
    "leads": 67,
    "subscriptions": 120
  },
  "data": {
    "properties": [...],
    "propertyImages": [...],
    "posts": [...],
    "postImages": [...],
    "leads": [...],
    "subscriptions": [...]
  }
}
```

---

### Metodo 2: Export CSV (Excel/Google Sheets)

Esporta i dati in **file CSV separati** (compatibili con Excel):

```bash
npx tsx scripts/export-csv.ts
```

**Output** (cartella `exports/`):
```
exports/
├── immobili-2024-11-13_14-30-00.csv
├── blog-2024-11-13_14-30-00.csv
├── lead-2024-11-13_14-30-00.csv
├── newsletter-2024-11-13_14-30-00.csv
└── immagini-immobili-2024-11-13_14-30-00.csv
```

**Vantaggi**:
- ✅ Apribile con Excel/Google Sheets
- ✅ Facile da analizzare
- ✅ File separati per categoria

---

### Metodo 3: Dump PostgreSQL (Backup Completo Database)

Esporta l'**intero database** con `pg_dump`:

#### Da Locale (con accesso al database)
```bash
# Backup completo con schema
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Solo dati (senza schema)
pg_dump --data-only $DATABASE_URL > data-only-$(date +%Y%m%d-%H%M%S).sql

# Formato compresso
pg_dump -Fc $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).dump
```

#### Da Neon.tech Dashboard
1. Vai su [console.neon.tech](https://console.neon.tech)
2. Seleziona il progetto
3. Vai su **Branches** → **main**
4. Clicca su **Actions** → **Export data**
5. Scarica il file SQL

**Vantaggi**:
- ✅ Backup completo (schema + dati)
- ✅ Ripristino facile con `psql`
- ✅ Standard PostgreSQL

---

### Metodo 4: Connessione Diretta con Tool GUI

Usa tool grafici per esplorare/esportare:

#### TablePlus / DBeaver / pgAdmin
1. Installa [TablePlus](https://tableplus.com/) o [DBeaver](https://dbeaver.io/)
2. Crea nuova connessione PostgreSQL
3. Usa `DATABASE_URL` da `.env` o Neon.tech
4. Esporta tabelle singolarmente (Right-click → Export)

**Vantaggi**:
- ✅ Interfaccia visuale
- ✅ Export selettivo
- ✅ Filtri e ricerche

---

## 📥 Come Scaricare le Immagini

Le immagini sono su Cloudinary/R2, non nel database. Per scaricarle:

### Opzione A: Script di Download (da creare)
```bash
# TODO: Creare script che scarica tutte le immagini dagli URL nel database
# Questo richiederebbe uno script custom che:
# 1. Legge tutti gli URL dal database
# 2. Scarica ogni immagine
# 3. Organizza in cartelle (properties/posts)
```

### Opzione B: Cloudinary Dashboard
1. Vai su [cloudinary.com](https://cloudinary.com)
2. Login con le tue credenziali
3. Media Library → Select All
4. Download → Archive

### Opzione C: Cloudflare R2 Dashboard
1. Vai su [dash.cloudflare.com](https://dash.cloudflare.com)
2. R2 → Seleziona il bucket
3. Scarica i file manualmente o usa AWS CLI:
```bash
aws s3 sync s3://your-bucket-name ./local-images \
  --endpoint-url=https://[account-id].r2.cloudflarestorage.com
```

---

## 🔄 Ripristinare i Dati

### Da JSON Export
```bash
# TODO: Creare script import-data.ts che legge il JSON e inserisce nel DB
```

### Da SQL Dump
```bash
# Ripristina database da dump
psql $DATABASE_URL < backup-20241113.sql

# Oppure da file compresso
pg_restore -d $DATABASE_URL backup-20241113.dump
```

---

## 🔒 Backup Automatici

### Opzione 1: Neon.tech Automatic Backups
Neon.tech fa **backup automatici** ogni giorno:
- Retention: 7 giorni (free tier)
- Retention: 30 giorni (pro tier)
- Accesso: Neon Dashboard → Branches → Restore

### Opzione 2: Cron Job Script
Crea un cron job che esegue lo script di export periodicamente:

```bash
# Aggiungi a crontab
# Backup giornaliero alle 2 AM
0 2 * * * cd /path/to/project && npx tsx scripts/export-data.ts
```

### Opzione 3: GitHub Actions
Crea `.github/workflows/backup.yml`:
```yaml
name: Daily Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Ogni giorno alle 2 AM
  workflow_dispatch:      # Manuale

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npx tsx scripts/export-data.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      - uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: export-*.json
```

---

## 📊 Statistiche e Report

### Visualizza Statistiche Database
```bash
# Connettiti al database
psql $DATABASE_URL

# Query statistiche
SELECT 
  'properties' as table_name, COUNT(*) as count FROM properties
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions;
```

---

## ⚠️ Importante

1. **Mai committare** i file di backup su Git (sono già in `.gitignore`)
2. **Proteggi** i backup (contengono email e dati personali)
3. **Testa** il ripristino periodicamente
4. **Backup multipli**: Locale + Cloud (Google Drive, Dropbox)
5. **Automatizza**: Non fare affidamento su backup manuali

---

## 📞 Support

Se hai problemi con l'export:
1. Verifica `DATABASE_URL` nel `.env`
2. Controlla connessione: `psql $DATABASE_URL -c "SELECT 1"`
3. Controlla log errori dello script
4. Contatta supporto Neon.tech per problemi di connessione

---

## ✅ Checklist Backup Mensile

- [ ] Esporta dati JSON: `npx tsx scripts/export-data.ts`
- [ ] Esporta dati CSV: `npx tsx scripts/export-csv.ts`
- [ ] Verifica file creati correttamente
- [ ] Scarica backup da Neon.tech Dashboard
- [ ] Salva backup su Google Drive/Dropbox
- [ ] Testa ripristino su database di test (opzionale)
- [ ] Elimina backup vecchi >3 mesi
