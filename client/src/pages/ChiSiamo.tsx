import TeamMember from "@/components/TeamMember";
import { Card } from "@/components/ui/card";
import teamPhoto from "@assets/generated_images/Real_estate_team_photo_7f941344.png";
import member1 from "@assets/generated_images/Team_member_portrait_1_976007be.png";
import member2 from "@assets/generated_images/Team_member_portrait_2_a454b6da.png";
import member3 from "@assets/generated_images/Team_member_portrait_3_3620def7.png";
import { usePageMeta } from "@/lib/seo";

export default function ChiSiamo() {
  usePageMeta({
    title: 'Chi Siamo',
    description: '20 anni di fiducia e amicizia nel settore immobiliare. Scopri la storia di Immobiliare Maggiolini, i nostri valori e il team che ti accompagnerà nella ricerca della casa perfetta.',
  });
  const teamMembers = [
    {
      name: "Maria Rossi",
      role: "Fondatrice & Consulente Senior",
      image: member1,
      quote: "Aiutare le famiglie a trovare casa è la mia passione da sempre",
      email: "maria@maggiolini.it",
      phone: "+39 348 123 4567",
    },
    {
      name: "Luca Bianchi",
      role: "Consulente Immobiliare",
      image: member2,
      quote: "Ogni cliente merita attenzione e dedizione totale",
      email: "luca@maggiolini.it",
      phone: "+39 348 234 5678",
    },
    {
      name: "Sofia Verdi",
      role: "Specialista Vendite",
      image: member3,
      quote: "La fiducia si costruisce giorno dopo giorno",
      email: "sofia@maggiolini.it",
      phone: "+39 348 345 6789",
    },
  ];

  const values = [
    {
      icon: "🤝",
      title: "Fiducia",
      description: "Costruiamo rapporti duraturi basati sulla trasparenza e l'onestà",
    },
    {
      icon: "💚",
      title: "Passione",
      description: "Amiamo quello che facciamo e lo facciamo con il cuore",
    },
    {
      icon: "🎯",
      title: "Professionalità",
      description: "Esperienza e competenza al servizio dei nostri clienti",
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Famiglia",
      description: "Ogni cliente diventa parte della nostra grande famiglia",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Chi Siamo
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            La storia della nostra agenzia e delle persone che la rendono speciale
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground">
                20 Anni di Fiducia e Amicizia
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Immobiliare Maggiolini nasce nel 2004 dal sogno di Maria Rossi: creare un'agenzia 
                  immobiliare diversa, dove le persone vengono prima del business.
                </p>
                <p>
                  In questi vent'anni abbiamo accompagnato oltre 500 famiglie nella ricerca della 
                  casa perfetta, costruendo rapporti che vanno ben oltre la semplice transazione commerciale. 
                  Molti dei nostri clienti sono diventati amici e continuano a rivolgersi a noi per ogni necessità.
                </p>
                <p>
                  La nostra forza? La conoscenza profonda del territorio lombardo, l'esperienza maturata 
                  sul campo e soprattutto la passione sincera per quello che facciamo. Non siamo solo 
                  agenti immobiliari, siamo consulenti di fiducia che vi accompagnano in una delle 
                  decisioni più importanti della vostra vita.
                </p>
                <p>
                  Oggi siamo un team affiatato di professionisti, ma manteniamo intatto lo spirito 
                  familiare che ci ha contraddistinti fin dall'inizio. Ogni cliente riceve attenzione 
                  personalizzata, ascolto attento e supporto costante.
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

      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-4">
              I Nostri Valori
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              I principi che guidano ogni giorno il nostro lavoro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 space-y-3 hover-elevate transition-all" data-testid={`card-value-${value.title.toLowerCase()}`}>
                <div className="text-4xl">{value.icon}</div>
                <h3 className="font-serif font-semibold text-xl text-foreground">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-4">
              Il Nostro Team
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Professionisti appassionati pronti ad aiutarvi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMember key={index} {...member} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center space-y-6">
          <h2 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl">
            Vuoi Unirti alla Nostra Famiglia?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
            Siamo sempre alla ricerca di professionisti motivati che condividano i nostri valori. 
            Se vuoi far parte del team Maggiolini, contattaci!
          </p>
        </div>
      </section>
    </div>
  );
}
