import { usePageMeta } from "@/lib/seo";

export default function Privacy() {
  usePageMeta({
    title: 'Informativa Privacy',
    description: 'Informativa sul trattamento dei dati personali ai sensi del GDPR (Regolamento UE 2016/679)',
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <h1 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-3">
            Informativa Privacy
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Ai sensi dell'art. 13 del Regolamento UE 2016/679
          </p>
        </div>
      </section>

      <article className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="prose prose-slate prose-base md:prose-lg max-w-none dark:prose-invert">
          
          <section>
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">PREMESSA</h2>
            <p className="mb-4 leading-relaxed">
              La presente informativa è resa ai sensi dell'art. 13 del Regolamento (UE) 2016/679 (di seguito "GDPR") agli utenti che compilano il form di contatto presente sul sito web www.immobiliaremaggiolini.it, prima della raccolta dei loro dati personali.
            </p>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">1. TITOLARE DEL TRATTAMENTO</h2>
            <p className="mb-4 leading-relaxed">
              Il Titolare del trattamento dei dati personali è:
            </p>
            <div className="bg-secondary/30 p-6 rounded-md my-6">
              <p className="font-semibold mb-2">Immobiliare Maggiolini</p>
              <p className="mb-1">con sede legale/operativa in: [Indirizzo completo, CAP, Città, Provincia]</p>
              <p className="mb-1">Partita IVA/Codice Fiscale: [P.IVA]</p>
              <p className="mb-1">Email: <a href="mailto:email@immobiliaremaggiolini.it" className="text-primary hover:underline" data-testid="link-email-titolare">email@immobiliaremaggiolini.it</a></p>
              <p className="mb-1">PEC: [pec@immobiliaremaggiolini.it] (se disponibile)</p>
              <p>Telefono: [Numero di telefono]</p>
            </div>
            <p className="mb-4 leading-relaxed">
              Il Titolare non ha nominato un Responsabile della Protezione dei Dati (DPO) in quanto non ricorrono le condizioni di cui all'art. 37 del GDPR.
            </p>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">2. CATEGORIE DI DATI TRATTATI</h2>
            <p className="mb-4 leading-relaxed">
              Attraverso il form di contatto, vengono raccolti esclusivamente i seguenti dati personali forniti volontariamente dall'utente:
            </p>
            <ul className="ml-6 space-y-2 mb-4">
              <li>Nome e Cognome (obbligatorio)</li>
              <li>Indirizzo email (obbligatorio)</li>
              <li>Numero di telefono (facoltativo)</li>
              <li>Messaggio/richiesta inviata tramite form (obbligatorio)</li>
              <li>Eventuale riferimento all'immobile di interesse (se il form è compilato da una scheda immobile)</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              Non vengono raccolti dati appartenenti a categorie particolari di cui all'art. 9 GDPR (es. dati sensibili relativi a salute, orientamento sessuale, convinzioni religiose, appartenenza sindacale, dati biometrici o genetici).
            </p>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">3. FINALITÀ DEL TRATTAMENTO E BASE GIURIDICA</h2>
            <p className="mb-4 leading-relaxed">
              I dati personali raccolti tramite il form di contatto sono trattati per le seguenti finalità:
            </p>
            
            <h3 className="text-lg md:text-xl font-semibold mt-8 mb-4">a) Gestione delle richieste di contatto e fornitura dei servizi richiesti</h3>
            <p className="mb-4 leading-relaxed">
              <strong>Finalità:</strong> Rispondere alla richiesta di informazioni dell'utente relativa agli immobili o ai servizi offerti dall'agenzia, fornire assistenza pre-contrattuale e commerciale.
            </p>
            <p className="mb-4 leading-relaxed">
              <strong>Base giuridica:</strong> Esecuzione di misure precontrattuali adottate su richiesta dell'interessato (art. 6, comma 1, lett. b) GDPR).
            </p>
            <p className="mb-4 leading-relaxed">
              <strong>Natura del conferimento:</strong> Obbligatoria. Il rifiuto di fornire i dati comporta l'impossibilità di evadere la richiesta.
            </p>

            <h3 className="text-lg md:text-xl font-semibold mt-8 mb-4">b) Invio di comunicazioni commerciali e promozionali (Newsletter)</h3>
            <p className="mb-4 leading-relaxed">
              <strong>Finalità:</strong> Qualora l'utente esprima il consenso mediante apposita checkbox, i dati potranno essere utilizzati per l'invio di comunicazioni commerciali e promozionali relative a:
            </p>
            <ul className="ml-6 space-y-2 mb-4">
              <li>Nuovi immobili disponibili</li>
              <li>Aggiornamenti e novità dell'agenzia</li>
              <li>Articoli del blog e contenuti informativi</li>
              <li>Offerte e opportunità immobiliari</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              <strong>Base giuridica:</strong> Consenso esplicito dell'interessato (art. 6, comma 1, lett. a) GDPR).
            </p>
            <p className="mb-4 leading-relaxed">
              <strong>Natura del conferimento:</strong> Facoltativa. Il rifiuto di prestare il consenso non pregiudica la gestione della richiesta di contatto di cui al punto a).
            </p>
            <p className="mb-4 leading-relaxed">
              <strong>Revoca del consenso:</strong> Il consenso può essere revocato in qualsiasi momento:
            </p>
            <ul className="ml-6 space-y-2 mb-4">
              <li>Cliccando sul link di "disiscrizione" presente in calce a ogni email;</li>
              <li>Modificando le proprie preferenze tramite la pagina <a href="/preferenze" className="text-primary hover:underline" data-testid="link-preferenze">/preferenze</a>;</li>
              <li>Inviando una comunicazione a <a href="mailto:email@immobiliaremaggiolini.it" className="text-primary hover:underline" data-testid="link-email-revoca">email@immobiliaremaggiolini.it</a>.</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              La revoca del consenso non pregiudica la liceità del trattamento basata sul consenso prima della revoca.
            </p>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">4. MODALITÀ DI TRATTAMENTO</h2>
            <p className="mb-4 leading-relaxed">
              I dati personali sono trattati con strumenti elettronici e informatici, mediante procedure e modalità strettamente necessarie a perseguire le finalità indicate, nel rispetto dei principi di liceità, correttezza, trasparenza, minimizzazione, esattezza, limitazione della conservazione e integrità/riservatezza di cui all'art. 5 GDPR.
            </p>
            <p className="mb-4 leading-relaxed">
              Il Titolare adotta misure tecniche e organizzative adeguate per garantire un livello di sicurezza appropriato al rischio, ai sensi dell'art. 32 GDPR, tra cui:
            </p>
            <ul className="ml-6 space-y-2 mb-4">
              <li>Cifratura delle comunicazioni tramite protocollo HTTPS/TLS</li>
              <li>Accesso ai dati limitato ai soli soggetti autorizzati e preventivamente istruiti</li>
              <li>Procedure di autenticazione per accesso ai sistemi</li>
              <li>Backup periodici con misure di sicurezza appropriate</li>
              <li>Procedure di gestione delle violazioni dei dati personali (data breach)</li>
            </ul>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">5. AMBITO DI COMUNICAZIONE E DIFFUSIONE DEI DATI</h2>
            <p className="mb-4 leading-relaxed">
              I dati personali raccolti tramite il form di contatto non sono oggetto di diffusione (ossia di comunicazione a soggetti indeterminati).
            </p>
            <p className="mb-4 leading-relaxed">
              I dati potranno essere comunicati, nei limiti strettamente necessari, ai seguenti soggetti o categorie di soggetti:
            </p>

            <h3 className="text-lg md:text-xl font-semibold mt-8 mb-4">a) Personale interno</h3>
            <p className="mb-4 leading-relaxed">
              Dipendenti e collaboratori del Titolare, in qualità di soggetti autorizzati al trattamento ai sensi dell'art. 29 GDPR, preventivamente formati e istruiti.
            </p>

            <h3 className="text-lg md:text-xl font-semibold mt-8 mb-4">b) Soggetti terzi che forniscono servizi strumentali</h3>
            <p className="mb-4 leading-relaxed">
              I dati potranno essere comunicati a soggetti terzi che operano in qualità di Responsabili del trattamento ai sensi dell'art. 28 GDPR, nominati mediante contratto o altro atto giuridico vincolante, tra cui:
            </p>
            <ul className="ml-6 space-y-2 mb-4">
              <li>Provider di servizi di hosting e infrastruttura web (es. Replit, Vercel) per l'erogazione del servizio del sito web</li>
              <li>Provider di servizi email marketing (es. Brevo) per l'invio delle comunicazioni commerciali, solo in caso di consenso prestato</li>
              <li>Provider di servizi di archiviazione cloud (es. Cloudflare R2) per la conservazione sicura dei dati</li>
              <li>Provider di supporto tecnico e manutenzione IT</li>
            </ul>
            <p className="mb-4 leading-relaxed">
              Tali soggetti trattano i dati esclusivamente per conto del Titolare, secondo le sue istruzioni, e sono contrattualmente vincolati a garantire la sicurezza e riservatezza dei dati.
            </p>
            <p className="mb-4 leading-relaxed">
              Un elenco aggiornato dei Responsabili del trattamento può essere richiesto al Titolare.
            </p>

            <h3 className="text-lg md:text-xl font-semibold mt-8 mb-4">c) Soggetti legittimati per obbligo di legge</h3>
            <ul className="ml-6 space-y-2 mb-4">
              <li>Autorità giudiziarie, amministrative o di pubblica sicurezza, in adempimento di obblighi di legge o su ordine delle stesse</li>
              <li>Consulenti legali, fiscali o commerciali, nei limiti strettamente necessari e vincolati da obblighi di riservatezza</li>
            </ul>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">6. TRASFERIMENTO DEI DATI FUORI DALL'UE</h2>
            <p className="mb-4 leading-relaxed">
              I dati personali sono conservati su server ubicati all'interno dell'Unione Europea.
            </p>
            <p className="mb-4 leading-relaxed">
              Nel caso in cui, per esigenze tecniche, alcuni Responsabili del trattamento dovessero trasferire i dati in Paesi terzi al di fuori dello Spazio Economico Europeo (SEE), il Titolare garantisce che tale trasferimento avverrà nel rispetto delle disposizioni del Capo V del GDPR, mediante:
            </p>
            <ul className="ml-6 space-y-2 mb-4">
              <li>Decisioni di adeguatezza della Commissione Europea (art. 45 GDPR);</li>
              <li>Clausole contrattuali tipo approvate dalla Commissione Europea (art. 46, comma 2, lett. c) GDPR);</li>
              <li>Altri strumenti di garanzia appropriati.</li>
            </ul>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">7. PERIODO DI CONSERVAZIONE DEI DATI</h2>
            <p className="mb-4 leading-relaxed">
              I dati personali sono conservati per il tempo strettamente necessario al perseguimento delle finalità per cui sono stati raccolti, nel rispetto del principio di minimizzazione di cui all'art. 5, comma 1, lett. c) e e) GDPR:
            </p>

            <h3 className="text-lg md:text-xl font-semibold mt-8 mb-4">a) Richieste di contatto (finalità pre-contrattuale)</h3>
            <p className="mb-4 leading-relaxed">
              I dati relativi alle richieste di contatto sono conservati per un periodo di 24 mesi dalla data di ricezione della richiesta, salvo che non si instauri un rapporto commerciale o contrattuale, nel qual caso si applicano i termini di conservazione previsti per obblighi contabili e fiscali (generalmente 10 anni ai sensi dell'art. 2220 c.c. e del D.P.R. 600/1973).
            </p>

            <h3 className="text-lg md:text-xl font-semibold mt-8 mb-4">b) Newsletter e comunicazioni marketing</h3>
            <p className="mb-4 leading-relaxed">
              I dati trattati per finalità di marketing sono conservati fino alla revoca del consenso da parte dell'interessato o fino a quando il Titolare non decida autonomamente di cessare l'invio di comunicazioni commerciali.
            </p>
            <p className="mb-4 leading-relaxed">
              Al termine dei periodi di conservazione sopra indicati, i dati saranno cancellati o resi anonimi in modo permanente e irreversibile.
            </p>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">8. DIRITTI DELL'INTERESSATO (ARTT. 15-22 GDPR)</h2>
            <p className="mb-6 leading-relaxed">
              L'interessato ha il diritto di ottenere dal Titolare, nei casi previsti dal GDPR:
            </p>

            <div className="bg-secondary/20 p-6 rounded-md my-6">
              <h3 className="text-lg font-semibold mb-3">Art. 15 - Diritto di accesso</h3>
              <p className="mb-3 leading-relaxed">
                Ottenere conferma che sia o meno in corso un trattamento di dati personali che lo riguardano e, in tal caso, ricevere:
              </p>
              <ul className="ml-6 space-y-2">
                <li>Copia dei dati oggetto di trattamento</li>
                <li>Informazioni sulle finalità, categorie di dati, destinatari, periodo di conservazione</li>
                <li>Informazioni sull'esistenza di processi decisionali automatizzati</li>
              </ul>
            </div>

            <div className="bg-secondary/20 p-6 rounded-md my-6">
              <h3 className="text-lg font-semibold mb-3">Art. 16 - Diritto di rettifica</h3>
              <p className="leading-relaxed">
                Ottenere senza ingiustificato ritardo la rettifica dei dati personali inesatti o l'integrazione dei dati incompleti.
              </p>
            </div>

            <div className="bg-secondary/20 p-6 rounded-md my-6">
              <h3 className="text-lg font-semibold mb-3">Art. 17 - Diritto alla cancellazione ("diritto all'oblio")</h3>
              <p className="mb-3 leading-relaxed">
                Ottenere la cancellazione dei dati personali quando:
              </p>
              <ul className="ml-6 space-y-2">
                <li>I dati non sono più necessari rispetto alle finalità per cui sono stati raccolti</li>
                <li>L'interessato revoca il consenso e non sussiste altro fondamento giuridico per il trattamento</li>
                <li>L'interessato si oppone al trattamento e non sussiste alcun motivo legittimo prevalente</li>
                <li>I dati sono stati trattati illecitamente</li>
                <li>La cancellazione è obbligatoria per adempiere un obbligo legale</li>
              </ul>
            </div>

            <div className="bg-secondary/20 p-6 rounded-md my-6">
              <h3 className="text-lg font-semibold mb-3">Art. 18 - Diritto di limitazione di trattamento</h3>
              <p className="mb-3 leading-relaxed">
                Ottenere la limitazione del trattamento quando:
              </p>
              <ul className="ml-6 space-y-2">
                <li>L'interessato contesta l'esattezza dei dati personali</li>
                <li>Il trattamento è illecito ma l'interessato si oppone alla cancellazione</li>
                <li>I dati sono necessari all'interessato per l'accertamento, esercizio o difesa di un diritto in sede giudiziaria</li>
                <li>L'interessato si è opposto al trattamento in attesa della verifica di eventuali motivi legittimi prevalenti</li>
              </ul>
            </div>

            <div className="bg-secondary/20 p-6 rounded-md my-6">
              <h3 className="text-lg font-semibold mb-3">Art. 20 - Diritto alla portabilità dei dati</h3>
              <p className="mb-3 leading-relaxed">
                Ricevere in un formato strutturato, di uso comune e leggibile da dispositivo automatico i dati personali forniti al Titolare, e trasmetterli ad altro titolare senza impedimenti, quando:
              </p>
              <ul className="ml-6 space-y-2">
                <li>Il trattamento si basa sul consenso o su un contratto</li>
                <li>Il trattamento è effettuato con mezzi automatizzati</li>
              </ul>
            </div>

            <div className="bg-secondary/20 p-6 rounded-md my-6">
              <h3 className="text-lg font-semibold mb-3">Art. 21 - Diritto di opposizione</h3>
              <p className="mb-3 leading-relaxed">
                Opporsi in qualsiasi momento al trattamento dei dati personali per motivi connessi alla propria situazione particolare. Il Titolare si asterrà dal trattare ulteriormente i dati salvo che dimostri l'esistenza di motivi legittimi cogenti per procedere al trattamento che prevalgono sugli interessi, sui diritti e sulle libertà dell'interessato.
              </p>
              <p className="leading-relaxed">
                In caso di trattamento per finalità di marketing diretto, l'interessato ha il diritto di opporsi in qualsiasi momento al trattamento senza fornire alcuna motivazione.
              </p>
            </div>

            <div className="bg-secondary/20 p-6 rounded-md my-6">
              <h3 className="text-lg font-semibold mb-3">Art. 7, comma 3 - Diritto di revoca del consenso</h3>
              <p className="leading-relaxed">
                Revocare il consenso prestato per le finalità di marketing in qualsiasi momento, senza pregiudicare la liceità del trattamento basata sul consenso prestato prima della revoca.
              </p>
            </div>

            <div className="bg-secondary/20 p-6 rounded-md my-6">
              <h3 className="text-lg font-semibold mb-3">Diritto di proporre reclamo all'Autorità di controllo (Art. 77 GDPR)</h3>
              <p className="mb-3 leading-relaxed">
                L'interessato che ritenga che il trattamento dei dati personali che lo riguardano violi il GDPR ha il diritto di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali, con sede in Piazza Venezia n. 11, 00187 Roma (RM):
              </p>
              <ul className="ml-6 space-y-2">
                <li>Email: <a href="mailto:garante@gpdp.it" className="text-primary hover:underline" data-testid="link-email-garante">garante@gpdp.it</a></li>
                <li>PEC: <a href="mailto:protocollo@pec.gpdp.it" className="text-primary hover:underline" data-testid="link-pec-garante">protocollo@pec.gpdp.it</a></li>
                <li>Tel: +39 06.696771</li>
                <li>Sito web: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" data-testid="link-website-garante">www.garanteprivacy.it</a></li>
              </ul>
            </div>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">9. MODALITÀ DI ESERCIZIO DEI DIRITTI</h2>
            <p className="mb-4 leading-relaxed">
              Per esercitare i diritti di cui all'art. 8, l'interessato può presentare richiesta scritta al Titolare mediante:
            </p>
            <ul className="ml-6 space-y-2 mb-6">
              <li>Email: <a href="mailto:email@immobiliaremaggiolini.it" className="text-primary hover:underline" data-testid="link-email-esercizio-diritti">email@immobiliaremaggiolini.it</a></li>
              <li>PEC: [pec@immobiliaremaggiolini.it] (se disponibile)</li>
              <li>Raccomandata A/R: [Indirizzo completo sede legale/operativa]</li>
            </ul>

            <p className="mb-4 leading-relaxed font-semibold">
              La richiesta deve contenere:
            </p>
            <ul className="ml-6 space-y-2 mb-6">
              <li>Generalità complete dell'interessato (nome, cognome)</li>
              <li>Indirizzo email e/o numero di telefono per la risposta</li>
              <li>Copia di un documento di identità valido in corso di validità (per verifica dell'identità)</li>
              <li>Descrizione chiara e specifica del diritto che si intende esercitare</li>
            </ul>

            <p className="mb-4 leading-relaxed">
              Il Titolare fornirà risposta entro 30 giorni dal ricevimento della richiesta. Tale termine può essere prorogato di ulteriori 60 giorni in caso di particolare complessità della richiesta, dandone comunicazione motivata all'interessato entro 30 giorni dal ricevimento.
            </p>
            <p className="mb-4 leading-relaxed">
              La risposta sarà fornita gratuitamente. In caso di richieste manifestamente infondate o eccessive, il Titolare può addebitare un contributo spese ragionevole o rifiutare di soddisfare la richiesta, motivandone le ragioni.
            </p>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">10. CONSEGUENZE DEL MANCATO CONFERIMENTO DEI DATI</h2>
            <p className="mb-4 leading-relaxed">
              Il conferimento dei dati contrassegnati come obbligatori (nome, cognome, email, messaggio) è necessario per consentire al Titolare di evadere la richiesta di contatto.
            </p>
            <p className="mb-4 leading-relaxed">
              Il rifiuto di fornire tali dati comporta l'impossibilità per il Titolare di dare seguito alla richiesta.
            </p>
            <p className="mb-4 leading-relaxed">
              Il conferimento del numero di telefono è facoltativo e l'eventuale rifiuto non pregiudica la gestione della richiesta, ferma restando la possibilità di un contatto telefonico solo in caso di consenso esplicito.
            </p>
            <p className="mb-4 leading-relaxed">
              Il conferimento del consenso per l'invio di comunicazioni commerciali è del tutto facoltativo e l'eventuale rifiuto non pregiudica in alcun modo la gestione della richiesta di contatto.
            </p>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">11. PROCESSI DECISIONALI AUTOMATIZZATI E PROFILAZIONE</h2>
            <p className="mb-4 leading-relaxed">
              Il Titolare non adotta processi decisionali automatizzati, inclusa la profilazione, di cui all'art. 22 del GDPR.
            </p>
            <p className="mb-4 leading-relaxed">
              Le comunicazioni commerciali eventualmente inviate non sono basate su profilazione degli utenti.
            </p>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">12. AGGIORNAMENTO DELL'INFORMATIVA</h2>
            <p className="mb-4 leading-relaxed">
              La presente informativa può essere oggetto di aggiornamenti e modifiche. L'utente è invitato a consultare periodicamente questa pagina.
            </p>
            <p className="mb-4 leading-relaxed">
              Data ultimo aggiornamento: [GG/MM/AAAA]
            </p>
          </section>

          <section className="border-t border-border mt-12 pt-8">
            <h2 className="text-xl md:text-2xl font-bold mt-8 mb-6 text-primary">13. ACCETTAZIONE DELL'INFORMATIVA</h2>
            <p className="mb-4 leading-relaxed">
              Barrando la casella "Ho letto e accetto l'Informativa Privacy" e cliccando sul pulsante di invio del form, l'utente dichiara:
            </p>
            <ul className="ml-6 space-y-2 mb-6">
              <li>Di aver preso visione della presente Informativa Privacy;</li>
              <li>Di essere stato informato in particolare sulle finalità e modalità di trattamento dei dati personali;</li>
              <li>Di acconsentire al trattamento dei propri dati personali per le finalità di gestione della richiesta di contatto di cui all'art. 3, lett. a) della presente informativa.</li>
            </ul>
            <p className="mb-6 leading-relaxed">
              Nel caso in cui sia presente una checkbox separata per la Newsletter, l'utente con il consenso esplicito e distinto autorizza inoltre il trattamento per le finalità di marketing di cui all'art. 3, lett. b).
            </p>

            <div className="bg-secondary/30 p-6 rounded-md my-8">
              <p className="font-semibold mb-2">IMMOBILIARE MAGGIOLINI</p>
              <p className="mb-1">[Indirizzo completo]</p>
              <p className="mb-1">P.IVA: [P.IVA]</p>
              <p className="mb-1">Email: <a href="mailto:email@immobiliaremaggiolini.it" className="text-primary hover:underline" data-testid="link-email-footer-privacy">email@immobiliaremaggiolini.it</a></p>
              <p>Tel: [Numero telefono]</p>
            </div>
          </section>

        </div>
      </article>
    </div>
  );
}
