# Progetto Maggiolini

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
