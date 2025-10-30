import teamPhoto from "@assets/generated_images/Real_estate_team_photo_7f941344.png";
import { usePageMeta } from "@/lib/seo";

export default function ChiSiamo() {
  usePageMeta({
    title: 'Chi Siamo',
    description: 'Quarant\'anni nel territorio. Accordi che durano, relazioni che restano. Scopri la storia di Immobiliare Maggiolini.',
  });

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Chi Siamo
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Quarant'anni nel territorio
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground">
                Accordi che durano, relazioni che restano
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Quando consegni le chiavi di casa tua a uno sconosciuto, o quando firmi per l'acquisto più importante della tua vita, non stai cercando solo qualcuno che compili documenti. Stai cercando qualcuno che capisca cosa c'è davvero in gioco.
                </p>
                <p>
                  Dopo quarant'anni in questo territorio, abbiamo imparato che il nostro lavoro non finisce quando si firma un contratto. Inizia molto prima, quando ascoltiamo cosa ti serve davvero, non cosa è più facile da proporre, e continua molto dopo, perché sappiamo che è nei mesi successivi che si capisce se un accordo funziona davvero.
                </p>
                <p>
                  Verifichiamo ogni dettaglio. Controlliamo documenti, referenze, situazioni. Quando ti proponiamo qualcuno, sia inquilino o acquirente, sappiamo già che è affidabile.
                </p>
                <p>
                  Conosciamo ogni angolo di questa zona perché ci abbiamo vissuto, lavorato, costruito relazioni. Quando valutiamo, condividiamo quello che abbiamo visto accadere, non statistiche da portale.
                </p>
                <p>
                  Molti dei nostri clienti sono diventati amici. Quando hai aiutato qualcuno a trovare la prima casa, poi l'hai seguito nell'acquisto della seconda, e magari hai sistemato l'affitto per suo figlio che va all'università, alla fine ti invitano ai compleanni. E noi ci andiamo.
                </p>
                <p>
                  Facciamo questo lavoro per vedere accordi che funzionano: proprietari che dormono tranquilli, inquilini che si sentono a casa, acquirenti che dopo due anni ti ringraziano ancora.
                </p>
                <p>
                  Se cerchi qualcuno che ti ascolti, che conosca davvero questo territorio, e che sia ancora qui quando ti serve, anche mesi dopo aver firmato, allora possiamo parlare.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src={teamPhoto}
                alt="Il nostro team"
                className="w-full h-auto rounded-md shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
