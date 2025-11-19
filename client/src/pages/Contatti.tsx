import ContactForm from "@/components/ContactForm";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { usePageMeta } from "@/lib/seo";

export default function Contatti() {
  usePageMeta({
    title: 'Contattaci',
    description: 'Contatta Immobiliare Maggiolini per una consulenza personalizzata. Siamo disponibili in Via Paolo Castelnovo, 14, 20015 Parabiago (MI). Telefono: 3293589090 - 0331555588. Email: immobiliaremaggiolini@gmail.com',
  });
  const contactInfo = [
    {
      icon: MapPin,
      title: "Indirizzo",
      details: ["Via Paolo Castelnovo, 14", "20015 Parabiago (MI)"],
    },
    {
      icon: Phone,
      title: "Telefono",
      details: ["3293589090", "0331555588"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["immobiliaremaggiolini@gmail.com"],
    },
    {
      icon: Clock,
      title: "Orari",
      details: ["Lun-Ven 9:30-13:00/14:30-18:30"],
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Contattaci
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Siamo qui per aiutarti. Scrivici o vieni a trovarci in ufficio
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-4">
                  Inviaci un Messaggio
                </h2>
                <p className="text-muted-foreground mb-6">
                  Compila il form e ti risponderemo entro 24 ore. Oppure chiamaci direttamente 
                  per una consulenza immediata.
                </p>
              </div>
              <ContactForm source="contatti" />
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-6">
                  Informazioni di Contatto
                </h2>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="p-6 hover-elevate transition-all" data-testid={`card-contact-${info.title.toLowerCase()}`}>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                            <info.icon className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-muted-foreground text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center space-y-6">
          <h2 className="font-serif font-bold text-3xl md:text-4xl">
            Preferisci Parlare di Persona?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
            Vieni a trovarci nel nostro ufficio. Un caffè è sempre pronto per i nostri ospiti!
          </p>
          <div className="flex items-center justify-center gap-2 text-primary-foreground/95">
            <MapPin className="w-5 h-5" />
            <p className="text-lg font-medium">
              Via Paolo Castelnovo, 14, 20015 Parabiago (MI)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <div className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-md px-6 py-3">
              <p className="text-sm text-primary-foreground/80">Lunedì - Venerdì</p>
              <p className="font-semibold text-lg">9:30-13:00 / 14:30-18:30</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
