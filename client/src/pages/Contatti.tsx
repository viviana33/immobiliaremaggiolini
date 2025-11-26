import ContactForm from "@/components/ContactForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Clock, Search, Map, Handshake } from "lucide-react";
import { usePageMeta } from "@/lib/seo";

export default function Contatti() {
  usePageMeta({
    title: 'Contattaci - Consulenti Immobiliari da 40 Anni',
    description: 'Vendere casa non dovrebbe tenerti sveglio la notte. Immobiliare Maggiolini: 40 anni di esperienza nel territorio di Parabiago. Verifiche approfondite, assistenza continua, consulenza onesta. Contattaci oggi.',
  });

  const scrollToForm = () => {
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const benefits = [
    {
      icon: Search,
      title: "Verifichiamo tutto, prima",
      description: "Non ti proponiamo il primo che bussa. Controlliamo referenze, situazione finanziaria, storico. Se qualcosa non torna, te lo diciamo."
    },
    {
      icon: Map,
      title: "Conosciamo ogni angolo di questa zona",
      description: "Non solo le vie. Le persone. I proprietari affidabili. Gli inquilini seri. I prezzi veri, non quelli dei portali. Quarant'anni di relazioni contano."
    },
    {
      icon: Handshake,
      title: "Rimaniamo anche dopo",
      description: "Contratto firmato? Per noi è solo l'inizio. Problema con l'inquilino? Chiamaci. Dubbio su una clausola? Siamo qui. Anche anni dopo, se serve."
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground mb-8 leading-tight" data-testid="text-headline">
            Vendere casa non dovrebbe tenerti sveglio la notte
          </h1>
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
            <p>
              Eppure succede. Quando non sai se l'inquilino pagherà. Quando l'agente sparisce dopo la firma. Quando scopri troppo tardi che qualcosa non andava.
            </p>
            <p>
              Dopo quarant'anni, abbiamo capito che il valore di un consulente immobiliare si misura in quanti problemi ti evita, non in quanto velocemente chiude.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={scrollToForm}
            data-testid="button-hero-cta"
          >
            CONTATTACI
          </Button>
        </div>
      </section>

      {/* Come Lavoriamo Section */}
      <section className="py-20 md:py-28 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground text-center mb-16" data-testid="text-come-lavoriamo">
            Come Lavoriamo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 hover-elevate transition-all" data-testid={`card-benefit-${index}`}>
                <div className="flex flex-col gap-4">
                  <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif font-semibold text-xl text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {benefit.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* La Nostra Storia Section */}
      <section className="py-20 md:py-28 lg:py-32 bg-secondary">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground text-center mb-12" data-testid="text-nostra-storia">
            La Nostra Storia
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Nel 1985, quando abbiamo aperto, il mercato immobiliare era completamente diverso.
            </p>
            <p>
              Gli affitti te li buttavano dietro. Bastava un cartello "Vendesi" e il telefono squillava. Le persone si fidavano.
            </p>
            <p>
              Oggi è tutto più complicato. Proprietari che temono inquilini inaffidabili. Acquirenti scottati da valutazioni gonfiate. Agenti che spariscono dopo aver incassato la provvigione.
            </p>
            <p>
              In quarant'anni abbiamo visto colleghi aprire e chiudere. Abbiamo visto agenzie bruciare reputazioni per chiudere contratti veloci. Abbiamo visto proprietari e inquilini scottati da accordi che sulla carta sembravano perfetti.
            </p>
            <p>
              Noi siamo ancora qui perché quarant'anni fa abbiamo fatto una scelta: costruire relazioni che durano, non chiudere contratti che poi esplodono. Significa dire dei no. No a proprietari che vogliono affittare a chiunque pur di incassare subito. No a inquilini che cercano soluzioni troppo rischiose. Significa verificare tutto quello che può essere verificato, prima di proporti qualcosa. E significa esserci anche dopo, quando gli altri hanno già dimenticato il tuo nome.
            </p>
            <p>
              Dopo quarant'anni su questo territorio, abbiamo costruito una rete di relazioni – con notai, amministratori, proprietari, inquilini – che ci permette di sapere esattamente chi è affidabile e chi no. Conosciamo i palazzi, le famiglie, i prezzi veri. Non quelli dei portali.
            </p>
            <p>
              E sappiamo che un accordo funziona solo se entrambe le parti dormono tranquille. Non solo il giorno della firma, ma anche sei mesi dopo.
            </p>
            <p className="font-semibold text-foreground text-xl mt-8">
              Non siamo intermediari. Siamo consulenti.
            </p>
            <p className="font-semibold text-foreground text-xl">
              Risolviamo problemi. Non li creiamo.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section Before Form */}
      <section className="py-20 md:py-28 lg:py-32 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-serif font-bold text-3xl md:text-4xl mb-8" data-testid="text-facciamo-cosa">
            FACCIAMO UNA COSA
          </h2>
          <div className="space-y-4 text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
            <p>
              Raccontaci cosa ti serve. Ti richiamiamo entro domani e ti diciamo esattamente come possiamo aiutarti.
            </p>
            <p>
              Niente impegno. Niente commissioni anticipate. Solo una consulenza onesta.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground text-center mb-8" data-testid="text-invia-messaggio">
            Inviaci un Messaggio
          </h2>
          <p className="text-muted-foreground text-center mb-10 text-lg">
            Compila il form e ti risponderemo entro 24 ore.
          </p>
          <ContactForm source="contatti" />
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-10" data-testid="text-preferisci-chiamare">
            Preferisci chiamare direttamente?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <Card className="p-6 hover-elevate transition-all" data-testid="card-contact-phone">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Telefono</p>
                  <p className="text-muted-foreground">3293589090</p>
                  <p className="text-muted-foreground">0331555588</p>
                  <p className="text-sm text-muted-foreground mt-2">Rispondiamo sempre</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover-elevate transition-all" data-testid="card-contact-address">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Indirizzo</p>
                  <p className="text-muted-foreground">Via Paolo Castelnovo, 14</p>
                  <p className="text-muted-foreground">20015 Parabiago (MI)</p>
                  <p className="text-sm text-muted-foreground mt-2">Vieni quando vuoi</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover-elevate transition-all" data-testid="card-contact-hours">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Orari</p>
                  <p className="text-muted-foreground">Lun-Ven 9-19</p>
                  <p className="text-muted-foreground">Sab 9-13</p>
                </div>
              </div>
            </Card>
          </div>
          <p className="text-xl font-serif font-semibold text-foreground" data-testid="text-tagline-finale">
            Stesso posto. Stesse facce. Da quarant'anni.
          </p>
        </div>
      </section>
    </div>
  );
}
