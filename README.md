# Progetto Maggiolini

## QA Checklist Completa

### Immobili

#### CRUD
- [ ] Creazione nuovo immobile con tutti i campi obbligatori
- [ ] Lettura/visualizzazione dettagli immobile
- [ ] Modifica immobile esistente
- [ ] Eliminazione immobile (soft delete consigliato)

#### Filtri
- [ ] Filtro per tipo (vendita/affitto)
- [ ] Filtro per categoria
- [ ] Filtro per prezzo (min/max)
- [ ] Filtro per superficie (min/max)
- [ ] Filtro per numero locali
- [ ] Filtro per città
- [ ] Combinazione multipla filtri

#### Ordinamento
- [ ] Ordinamento per prezzo (crescente/decrescente)
- [ ] Ordinamento per superficie
- [ ] Ordinamento per data pubblicazione
- [ ] Ordinamento per featured/hot

#### Status
- [ ] Cambio status: available → sold
- [ ] Cambio status: available → rented
- [ ] Cambio status: sold/rented → available
- [ ] Featured flag (evidenziazione)
- [ ] Hot flag (occasione)
- [ ] Visibilità corretta in base allo status

#### Gallery
- [ ] Upload multiplo immagini
- [ ] Riordinamento immagini (drag & drop o manuale)
- [ ] Eliminazione singola immagine
- [ ] Immagine principale selezionabile
- [ ] Visualizzazione gallery in dettaglio immobile
- [ ] Ottimizzazione e resize automatico immagini

#### Video
- [ ] Upload video (se supportato locale)
- [ ] URL video esterno (YouTube/Vimeo)
- [ ] Visualizzazione video in dettaglio immobile
- [ ] Fallback se video non disponibile

---

### Blog

#### Bozza → Publish
- [ ] Creazione post come bozza (draft)
- [ ] Salvataggio bozza senza pubblicazione
- [ ] Pubblicazione bozza → post pubblico
- [ ] Cambio da published → draft
- [ ] Verifica visibilità: draft non visibile pubblicamente
- [ ] Verifica visibilità: published visibile pubblicamente

#### Editor
- [ ] Editor Markdown/Rich text funzionante
- [ ] Anteprima formattazione
- [ ] Salvataggio automatico (se implementato)
- [ ] Inserimento link
- [ ] Formattazione testo (bold, italic, liste, ecc.)

#### Immagini
- [ ] Upload immagine featured
- [ ] Upload immagini nel contenuto
- [ ] Visualizzazione corretta immagini nel post
- [ ] Ottimizzazione immagini

#### Slug
- [ ] Generazione automatica slug da titolo
- [ ] Slug unico (no duplicati)
- [ ] Slug modificabile manualmente
- [ ] URL del post corretto con slug

#### Notify
- [ ] Pubblicazione nuovo post → invio notifica iscritti newsletter blog
- [ ] Notifica non inviata per bozze
- [ ] Notifica non inviata per aggiornamenti post esistente
- [ ] Template email notifica corretto
- [ ] Link al post funzionante nella email

---

### Newsletter

#### Opt-in
- [ ] Iscrizione da form /contatti con checkbox newsletter
- [ ] Iscrizione da dettaglio immobile con checkbox newsletter
- [ ] Iscrizione da post blog con checkbox newsletter
- [ ] Double opt-in (se implementato)
- [ ] Conferma iscrizione (messaggio/email)
- [ ] Email di benvenuto (se prevista)

#### Preferenze
- [ ] Pagina /preferenze accessibile tramite link da email
- [ ] Modifica preferenze immobili (flag attivo/disattivo)
- [ ] Modifica preferenze blog (flag attivo/disattivo)
- [ ] Salvataggio preferenze corretto
- [ ] Unsubscribe totale funzionante
- [ ] Link unsubscribe in ogni email inviata

#### Invii
- [ ] Nuovo post pubblicato → invio a iscritti blog
- [ ] Nuovo immobile available → invio a iscritti immobili (se implementato)
- [ ] Invio solo a utenti con flag preferenza attivo
- [ ] Nessun invio a utenti unsubscribed
- [ ] Template email corretto e responsive
- [ ] Personalizzazione contenuto email (nome, link, etc.)

---

### Lead (Gestione Contatti)

#### Contatti da 3 Sorgenti
- [ ] Contatto da form /contatti → salvataggio lead con source "contact"
- [ ] Contatto da dettaglio immobile → salvataggio lead con source "property" e propertyId
- [ ] Contatto da post blog → salvataggio lead con source "blog" e postId
- [ ] Context corretto per ogni tipo di contatto
- [ ] Tutti i campi necessari salvati (nome, email, messaggio, telefono)

#### Email In
- [ ] Ricezione email da form /contatti
- [ ] Ricezione email da immobile con contesto immobile
- [ ] Ricezione email da post con contesto post
- [ ] Template email ricevute corretto
- [ ] Indirizzo destinatario corretto (admin/proprietario)

#### Email Out
- [ ] Conferma invio al cliente (auto-reply)
- [ ] Email contiene recap del messaggio inviato
- [ ] Email contiene link al contesto (immobile/post se applicabile)
- [ ] From address corretto e autenticato
- [ ] Template responsive e professionale

---

### SEO

#### Sitemap
- [ ] Sitemap XML generata correttamente
- [ ] Sitemap accessibile a /sitemap.xml
- [ ] Sitemap contiene tutte le pagine pubbliche
- [ ] Sitemap contiene immobili available
- [ ] Sitemap contiene post blog pubblicati
- [ ] Sitemap con lastmod e priority corretti
- [ ] Sitemap registrata in Google Search Console

#### RSS
- [ ] Feed RSS generato correttamente
- [ ] Feed accessibile a /rss.xml o /feed
- [ ] Feed contiene ultimi post blog
- [ ] Feed con metadata corretti (title, description, pubDate)
- [ ] Feed validato (https://validator.w3.org/feed/)

#### Meta/OG (Open Graph)
- [ ] Meta title univoco per ogni pagina
- [ ] Meta description univoca per ogni pagina
- [ ] OG tags per condivisioni social (og:title, og:description, og:image)
- [ ] OG:image presente e corretto
- [ ] Twitter Card tags (se implementati)
- [ ] Canonical URL corretto per ogni pagina

#### JSON-LD (Structured Data)
- [ ] Schema.org RealEstateAgent/Organization per homepage
- [ ] Schema.org Product/Offer per immobili
- [ ] Schema.org BlogPosting per post blog
- [ ] Structured data validati (https://search.google.com/test/rich-results)
- [ ] BreadcrumbList schema (se implementato)

---

### Accessibilità (A11y)

#### Note Principali
- [ ] Contrasto colori sufficiente (WCAG AA minimum)
- [ ] Testo alternativo per tutte le immagini
- [ ] Focus visibile su elementi interattivi
- [ ] Navigazione da tastiera funzionante
- [ ] Form con label corrette e associate
- [ ] Messaggi di errore chiari e leggibili
- [ ] Struttura heading gerarchica (h1 → h2 → h3)
- [ ] ARIA labels dove necessario
- [ ] No text in images (o alt text completo)

---

### Performance

#### Note Principali
- [ ] Immagini ottimizzate e compresse
- [ ] Lazy loading immagini
- [ ] Caching browser configurato
- [ ] Minificazione CSS/JS
- [ ] Dimensioni bundle ragionevoli
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] Lighthouse score > 80 (performance)
- [ ] Database queries ottimizzate (no N+1)

---

### Cron Jobs

#### Cleanup Immagini Hot
- [ ] Endpoint /api/cron/cleanup-hot protetto con token
- [ ] Token validato correttamente (da query o header)
- [ ] Richiesta senza token → 401 Unauthorized
- [ ] Richiesta con token errato → 401 Unauthorized
- [ ] Richiesta con token corretto → 200 OK
- [ ] Job elimina immagini immobili sold/rented > 30 giorni
- [ ] Job elimina immagini orfane (no immobile associato)
- [ ] Job eseguito secondo schedule configurato
- [ ] Log/verifica esecuzione job disponibile
- [ ] Configurazione Vercel cron job completa

---

## Test Fase 7

1. **Iscrizione da post (flag immobili)**: Verificare che un utente possa iscriversi a ricevere notifiche direttamente da un post, selezionando il flag per gli immobili.

2. **Cambio preferenze in /preferenze**: Verificare che un utente possa modificare le proprie preferenze di notifica dalla pagina dedicata.

3. **Pubblicazione post → verifica invio**: Verificare che alla pubblicazione di un nuovo post, le notifiche vengano inviate correttamente agli utenti iscritti.

4. **Nuovo immobile available → verifica invio (se 7.5 attivo)**: Verificare che quando un nuovo immobile diventa disponibile, le notifiche vengano inviate agli utenti interessati (funzionalità attiva solo se il passo 7.5 è implementato).

## Test Fase 8

1. **invio da /contatti**

2. **invio da immobile (context ok)**

3. **invio da post (context ok)**

4. **newsletter via checkbox → opt-in ok**

## Configurazione Vercel Cron

### Variabile d'ambiente CRON_TOKEN

1. Accedi al progetto su Vercel Dashboard
2. Vai in **Settings** → **Environment Variables**
3. Aggiungi una nuova variabile:
   - **Name**: `CRON_TOKEN`
   - **Value**: Genera un token sicuro casuale (es. una stringa lunga e complessa)
   - **Environments**: Seleziona Production (e Deployment se necessario)
4. Clicca **Save**

**Nota**: Conserva il valore del token in un posto sicuro, ti servirà per configurare il cron job.

### Configurazione Cron Job

1. Nel progetto Vercel, crea o modifica il file `vercel.json` nella root del progetto:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-hot",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Nota**: Lo schedule `0 2 * * *` esegue il job ogni giorno alle 2:00 AM (UTC). Puoi modificare l'orario secondo le tue preferenze usando la sintassi cron.

2. Configura l'header di autenticazione:
   - Vercel Cron supporta l'invio di header personalizzati tramite la configurazione del cron job
   - Aggiungi il token come header `x-cron-token` nel modo seguente:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-hot",
      "schedule": "0 2 * * *",
      "headers": {
        "x-cron-token": "${CRON_TOKEN}"
      }
    }
  ]
}
```

**Attenzione**: Vercel attualmente non supporta l'interpolazione di variabili d'ambiente negli header dei cron job. Dovrai invece:

**Soluzione alternativa**: Passa il token come query parameter:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-hot?token=IL_TUO_TOKEN_QUI",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Sostituisci `IL_TUO_TOKEN_QUI` con il valore effettivo del `CRON_TOKEN` che hai configurato.

3. Fai il commit e il deploy delle modifiche su Vercel

### Verifica del funzionamento

- Puoi testare manualmente l'endpoint eseguendo una richiesta POST a:
  ```
  https://tuo-dominio.vercel.app/api/cron/cleanup-hot?token=IL_TUO_TOKEN
  ```
  
- Controlla i log di Vercel per verificare l'esecuzione del cron job
- Il job elimina le immagini in eccesso per immobili venduti/affittati da più di 30 giorni e rimuove le immagini orfane

## Configurazione SPF/DKIM/DMARC per il Dominio Email

### Perché configurare l'autenticazione email?

A partire da **febbraio 2024**, Gmail e Yahoo richiedono l'autenticazione email obbligatoria per i mittenti in volume. Senza una corretta configurazione:
- Le email finiscono nello spam
- Il tasso di consegna diminuisce
- La reputazione del dominio viene compromessa

---

### Provider Email: Brevo (ex Sendinblue)

Questo progetto utilizza **Brevo** per l'invio di email transazionali e newsletter. Di seguito le istruzioni per configurare i record DNS necessari.

#### Importante: SPF non richiesto per Brevo

⚠️ **Non è necessario configurare SPF** quando si usa Brevo. La piattaforma gestisce internamente i controlli SPF tramite il loro dominio envelope-from. È sufficiente configurare solo **DKIM** e **DMARC**.

---

### Step 1: Aggiungere il dominio a Brevo

1. Accedi al tuo account Brevo
2. Clicca sul tuo nome (in alto a destra) → **Senders, Domains & Dedicated IPs**
3. Vai alla tab **Domains**
4. Clicca **Add a domain**
5. Inserisci il tuo dominio (es. `maggiolini.com` o il dominio che utilizzi)
6. Clicca **Save this email domain**

---

### Step 2: Ottenere i record DNS da Brevo

Dopo aver aggiunto il dominio, Brevo fornirà i seguenti record da pubblicare:

#### Record TXT di verifica dominio
```
Type: TXT
Name: @ (oppure il tuo dominio)
Value: [codice fornito da Brevo]
```

#### Record DKIM (2 CNAME oppure 1 TXT)
Gli account Brevo più recenti utilizzano **2 record CNAME** per DKIM (più sicuro + rotazione automatica chiavi):

```
Type: CNAME
Name: mail._domainkey.tuodominio.com
Value: [valore fornito da Brevo]

Type: CNAME  
Name: mail2._domainkey.tuodominio.com
Value: [valore fornito da Brevo]
```

*Nota: gli account più vecchi potrebbero vedere 1 record TXT invece dei 2 CNAME.*

---

### Step 3: Configurare DMARC

#### Record DMARC iniziale (consigliato)

**Inizia sempre con la policy `p=none`** per monitorare il traffico email senza impatto sulla consegna:

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@tuodominio.com; pct=100
```

#### Se utilizzi già DMARC

Se hai già un record DMARC pubblicato, **non eliminarlo**. Aggiungi semplicemente l'indirizzo email di reporting di Brevo:

```
v=DMARC1; p=quarantine; rua=mailto:tua-email@tuodominio.com,mailto:rua@dmarc.brevo.com; pct=100
```

#### Opzioni Policy DMARC

- **`p=none`** - Solo monitoraggio, nessun impatto sulla consegna (**raccomandato per iniziare**)
- **`p=quarantine`** - Le email non autenticate vanno in spam (passaggio intermedio)
- **`p=reject`** - Le email non autenticate vengono rifiutate (massima protezione)

#### Tag DMARC importanti

| Tag | Descrizione | Esempio |
|-----|-------------|---------|
| `v=DMARC1` | Versione del protocollo (obbligatorio) | `v=DMARC1` |
| `p=` | Policy per il dominio principale | `p=none` |
| `rua=` | Email per i report aggregati | `rua=mailto:reports@tuodominio.com` |
| `ruf=` | Email per i report forensici (opzionale) | `ruf=mailto:forensics@tuodominio.com` |
| `pct=` | Percentuale di messaggi da controllare | `pct=100` (default) |
| `sp=` | Policy per i sottodomini | `sp=none` |

---

### Step 4: Pubblicare i record DNS

#### Su IONOS

1. Accedi al pannello IONOS
2. Vai in **Domini & SSL** → seleziona il tuo dominio
3. Clicca su **DNS**
4. Aggiungi i record TXT/CNAME forniti da Brevo:

**Per il record di verifica Brevo:**
- Type: `TXT`
- Host: `@` (oppure lascia vuoto)
- Value: incolla il codice Brevo
- TTL: `3600`

**Per i record DKIM:**
- Type: `CNAME`
- Host: `mail._domainkey`
- Points to: incolla il valore Brevo
- TTL: `3600`

Ripeti per il secondo CNAME (`mail2._domainkey`) se presente.

**Per il record DMARC:**
- Type: `TXT`
- Host: `_dmarc`
- Value: `v=DMARC1; p=none; rua=mailto:dmarc-reports@tuodominio.com; pct=100`
- TTL: `3600`

5. Salva le modifiche

#### Su Cloudflare

1. Vai al Dashboard Cloudflare
2. Seleziona il dominio
3. Vai in **DNS** → **Records**
4. Aggiungi i record:

- **Type**: TXT o CNAME (secondo quanto richiesto)
- **Name**: inserisci il valore fornito da Brevo (es. `_dmarc`, `mail._domainkey`)
- **Content**: incolla il valore
- **TTL**: Auto

#### Su altri provider DNS

I principi sono gli stessi. Cerca la sezione DNS/Zone File e aggiungi i record TXT e CNAME come indicato da Brevo.

---

### Step 5: Verificare l'autenticazione

1. Attendi **24-48 ore** per la propagazione DNS (spesso più veloce, 1-4 ore)
2. Torna su Brevo → **Domains**
3. Clicca **View configuration** → **Authenticate this email domain**
4. ✅ Segno verde = configurazione corretta
5. ❌ "Not authenticated" = attendi ancora oppure controlla i valori inseriti

---

### Configurazione DMARC: Best Practices

#### Fase 1: Monitoraggio (2-4 settimane)

**Record iniziale:**
```
v=DMARC1; p=none; rua=mailto:dmarc@tuodominio.com
```

**Obiettivi:**
- Raccogliere report da Gmail, Yahoo, Microsoft
- Identificare tutte le fonti di invio legittime
- Individuare problemi di autenticazione SPF/DKIM
- Verificare che almeno il 95% delle email passi DMARC

**Setup casella email per report:**
- Crea una casella dedicata (es. `dmarc-reports@tuodominio.com`)
- I report arrivano come allegati XML compressi (alto volume per grandi invii)
- Considera l'uso di servizi di analisi DMARC (PowerDMARC, dmarcian, EasyDMARC)

#### Fase 2: Quarantena graduale (2-4 settimane)

```
v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@tuodominio.com
```

- Inizia con `pct=10` (applica la policy solo al 10% dei messaggi)
- Aumenta gradualmente: 10% → 25% → 50% → 100%
- Monitora i report per verificare che non ci siano problemi

#### Fase 3: Protezione completa

```
v=DMARC1; p=reject; rua=mailto:dmarc@tuodominio.com; ruf=mailto:forensics@tuodominio.com
```

- Applica solo quando il 95%+ delle email passa DMARC
- Protezione massima contro phishing e spoofing

---

### Come testare l'invio email

#### Test 1: Verifica record DNS pubblicati

Usa questi strumenti online per verificare che i record siano pubblicati correttamente:

**MXToolbox:**
```
https://mxtoolbox.com/SuperTool.aspx
```
- Inserisci `tuodominio.com`
- Controlla SPF, DKIM, DMARC

**Google Admin Toolbox:**
```
https://toolbox.googleapps.com/apps/checkmx/
```

**dmarcian DMARC Inspector:**
```
https://dmarcian.com/dmarc-inspector/
```

#### Test 2: Invio email di prova

1. Dal pannello di amministrazione dell'applicazione, vai alla sezione contatti
2. Invia un'email di test a un tuo indirizzo Gmail o Yahoo
3. Verifica che l'email arrivi correttamente (non nello spam)

#### Test 3: Verifica intestazioni email

Dopo aver ricevuto un'email di test, controlla le intestazioni (headers):

**In Gmail:**
1. Apri l'email
2. Clicca sui tre puntini → **Mostra originale**
3. Cerca queste sezioni:

```
DKIM-Signature: v=1; a=rsa-sha256; ... (deve essere presente)

Authentication-Results: ... 
  dkim=pass ...
  dmarc=pass ...
```

**Cosa cercare:**
- `dkim=pass` ✅
- `dmarc=pass` ✅
- Nessun warning di autenticazione

#### Test 4: Mail-tester.com

Invia un'email di test all'indirizzo fornito da:
```
https://www.mail-tester.com/
```

Otterrai un punteggio da 0 a 10/10. Obiettivo: almeno 8/10.

Il report ti mostrerà:
- Autenticazione DKIM ✅/❌
- Autenticazione DMARC ✅/❌
- Reputazione IP
- Contenuto spam-like

---

### Troubleshooting

#### "Value mismatched" in Brevo

- Controlla errori di battitura nei record DNS
- Rimuovi spazi extra o virgolette non necessarie
- Attendi fino a 48 ore per la propagazione completa

#### Email ancora nello spam

L'autenticazione aiuta ma non garantisce la consegna. Verifica anche:
- Qualità del contenuto (evita parole spam)
- Reputazione del dominio
- Qualità della lista destinatari
- Frequenza di invio appropriata

#### Record DMARC multipli

- Mantieni **un solo** record DMARC per dominio
- Se ne hai più di uno, combinali in un unico record

---

### Checklist Finale

✅ Dominio aggiunto a Brevo  
✅ Record di verifica Brevo (TXT) pubblicato  
✅ Record DKIM (2 CNAME o 1 TXT) pubblicati  
✅ Record DMARC pubblicato con `p=none` e `rua=`  
✅ Attesi 24-48 ore per propagazione  
✅ Verifica in Brevo completata (segno verde)  
✅ Test invio email effettuato  
✅ Intestazioni email verificate (dkim=pass, dmarc=pass)  
✅ Report DMARC monitorati settimanalmente  
⛔ SPF **non** configurato (gestito da Brevo)

---

### Link Utili

- **Documentazione ufficiale Brevo**: https://help.brevo.com/hc/en-us/articles/12163873383186
- **MXToolbox**: https://mxtoolbox.com/
- **Mail-tester**: https://www.mail-tester.com/
- **dmarcian**: https://dmarcian.com/

---

### Note per altri provider email

Se in futuro decidessi di utilizzare un provider diverso da Brevo (es. SendGrid, Mailgun, AWS SES):

1. **SPF**: Potrebbe essere necessario configurarlo (controlla la documentazione del provider)
   - Formato tipico: `v=spf1 include:_spf.provider.com ~all`
   
2. **DKIM**: Tutti i provider richiedono la configurazione DKIM
   - Riceverai record TXT o CNAME specifici dal provider

3. **DMARC**: La configurazione rimane identica indipendentemente dal provider
   - Usa sempre `p=none` inizialmente
   - Monitora con `rua=` per almeno 2-4 settimane
